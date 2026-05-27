import { promises as fs } from "fs";
import path from "path";
import { Pool } from "pg";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type SetupPayload = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  appUrl?: string;
  databaseUrl?: string;
  vercelToken?: string;
  vercelProjectIdOrName?: string;
  vercelTeamId?: string;
  vercelTeamSlug?: string;
  setupPassword?: string;
  applySchema?: boolean;
};

const ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
  "DATABASE_URL",
  "SUPABASE_DB_POOLER_URL",
] as const;

function clean(value?: string) {
  return value?.trim() ?? "";
}

function inferSupabaseUrl(databaseUrl: string) {
  const match = databaseUrl.match(/postgres\.([a-z0-9]+):/i);
  return match ? `https://${match[1]}.supabase.co` : "";
}

function validatePayload(payload: SetupPayload) {
  const databaseUrl = clean(payload.databaseUrl);
  const supabaseUrl = clean(payload.supabaseUrl) || inferSupabaseUrl(databaseUrl);
  const supabaseAnonKey = clean(payload.supabaseAnonKey);
  const appUrl = clean(payload.appUrl);

  if (!databaseUrl.startsWith("postgresql://")) {
    throw new Error("Cole a connection string completa do Session Pooler.");
  }

  if (!supabaseUrl.startsWith("https://") || !supabaseUrl.includes(".supabase.co")) {
    throw new Error("Informe uma URL valida do Supabase.");
  }

  if (!supabaseAnonKey || supabaseAnonKey.length < 80) {
    throw new Error("Informe a anon public key do Supabase.");
  }

  if (!appUrl.startsWith("http://") && !appUrl.startsWith("https://")) {
    throw new Error("Informe a URL do site, por exemplo https://petlar.vercel.app.");
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    NEXT_PUBLIC_APP_URL: appUrl,
    DATABASE_URL: databaseUrl,
    SUPABASE_DB_POOLER_URL: databaseUrl,
  };
}

async function writeLocalEnv(vars: Record<(typeof ENV_KEYS)[number], string>) {
  const content = ENV_KEYS.map((key) => `${key}=${vars[key]}`).join("\n") + "\n";
  await fs.writeFile(path.join(process.cwd(), ".env.local"), content, "utf8");
}

async function saveVercelEnv(payload: SetupPayload, vars: Record<(typeof ENV_KEYS)[number], string>) {
  const token = clean(payload.vercelToken);
  const project = clean(payload.vercelProjectIdOrName);

  if (!token) {
    throw new Error("Informe o token da Vercel para salvar no projeto publicado.");
  }

  if (!project) {
    throw new Error("Informe o Project ID ou nome do projeto na Vercel.");
  }

  const params = new URLSearchParams({ upsert: "true" });
  const teamId = clean(payload.vercelTeamId);
  const slug = clean(payload.vercelTeamSlug);

  if (teamId) params.set("teamId", teamId);
  if (slug) params.set("slug", slug);

  const endpoint = `https://api.vercel.com/v10/projects/${encodeURIComponent(project)}/env?${params}`;
  const saved: string[] = [];

  for (const key of ENV_KEYS) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        value: vars[key],
        type: "plain",
        target: ["production", "preview", "development"],
        comment: "Configurado pela pagina protegida do PetLar",
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const message = body?.error?.message || body?.message || `Erro HTTP ${response.status}`;
      throw new Error(`Vercel recusou ${key}: ${message}`);
    }

    saved.push(key);
  }

  return saved;
}

async function applySupabaseSchema(databaseUrl: string) {
  const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
  const schema = await fs.readFile(schemaPath, "utf8");
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await pool.query(schema);
  } finally {
    await pool.end();
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SetupPayload;
    const expectedPassword = process.env.PETLAR_SETUP_PASSWORD;

    if (expectedPassword && payload.setupPassword !== expectedPassword) {
      return NextResponse.json({ error: "Senha de configuracao invalida." }, { status: 401 });
    }

    const vars = validatePayload(payload);
    const isVercel = process.env.VERCEL === "1";
    const saved = isVercel
      ? await saveVercelEnv(payload, vars)
      : (await writeLocalEnv(vars), [...ENV_KEYS]);

    if (payload.applySchema) {
      await applySupabaseSchema(vars.DATABASE_URL);
    }

    return NextResponse.json({
      ok: true,
      mode: isVercel ? "vercel" : "local",
      saved,
      schemaApplied: Boolean(payload.applySchema),
      needsRedeploy: isVercel,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel salvar a configuracao." },
      { status: 400 },
    );
  }
}
