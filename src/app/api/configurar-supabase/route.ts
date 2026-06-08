import { promises as fs } from "fs";
import path from "path";
import { Pool } from "pg";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type SetupPayload = {
  databaseUrl?: string;
  setupPassword?: string;
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

function normalizeDatabaseUrl(databaseUrl: string) {
  const match = databaseUrl.match(/^(postgresql:\/\/[^:]+:)([^@]+)(@.+)$/);
  if (!match) return databaseUrl;

  const [, prefix, password, suffix] = match;
  let decodedPassword = password;

  try {
    decodedPassword = decodeURIComponent(password);
  } catch {
    decodedPassword = password;
  }

  return `${prefix}${encodeURIComponent(decodedPassword)}${suffix}`;
}

function validatePayload(payload: SetupPayload, request: Request) {
  const databaseUrl = normalizeDatabaseUrl(clean(payload.databaseUrl));
  const supabaseUrl = inferSupabaseUrl(databaseUrl);
  const supabaseAnonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const requestOrigin = request.headers.get("origin") || new URL(request.url).origin;
  const appUrl = clean(process.env.NEXT_PUBLIC_APP_URL) || requestOrigin;

  if (!databaseUrl.startsWith("postgresql://")) {
    throw new Error("Cole a connection string completa do Session Pooler.");
  }

  if (!supabaseUrl) {
    throw new Error("Nao consegui identificar o projeto do Supabase nessa connection string.");
  }

  if (!supabaseAnonKey || supabaseAnonKey.includes("sua-chave")) {
    throw new Error(
      "A anon public key precisa existir no ambiente antes de usar a tela simples.",
    );
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
  const envPath = path.join(process.cwd(), ".env.local");
  let current = "";

  try {
    current = await fs.readFile(envPath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const pending = new Map(ENV_KEYS.map((key) => [key, vars[key]]));
  const lines = current.replace(/\r\n/g, "\n").split("\n");
  if (lines.at(-1) === "") lines.pop();

  const updatedLines = lines.map((line) => {
    const key = line.match(/^([A-Z0-9_]+)=/)?.[1] as (typeof ENV_KEYS)[number] | undefined;
    if (!key || !pending.has(key)) return line;

    const value = pending.get(key);
    pending.delete(key);
    return `${key}=${value}`;
  });

  for (const [key, value] of pending) {
    updatedLines.push(`${key}=${value}`);
  }

  await fs.writeFile(envPath, `${updatedLines.join("\n")}\n`, "utf8");
}

async function saveVercelEnv(vars: Record<(typeof ENV_KEYS)[number], string>) {
  const token = clean(process.env.PETLAR_VERCEL_TOKEN);
  const project = clean(process.env.PETLAR_VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_ID);
  const teamId = clean(process.env.PETLAR_VERCEL_TEAM_ID);

  if (!token || !project) {
    throw new Error(
      "Para salvar no Vercel com um campo so, configure PETLAR_VERCEL_TOKEN e PETLAR_VERCEL_PROJECT_ID uma vez no painel da Vercel.",
    );
  }

  const params = new URLSearchParams({ upsert: "true" });
  if (teamId) params.set("teamId", teamId);

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
        comment: "Configurado pela pagina simples do PetLar",
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
    const expectedPassword = clean(process.env.PETLAR_SETUP_PASSWORD);

    if (!expectedPassword) {
      return NextResponse.json(
        { error: "Configure PETLAR_SETUP_PASSWORD no servidor antes de usar esta rota." },
        { status: 503 },
      );
    }

    if (payload.setupPassword !== expectedPassword) {
      return NextResponse.json({ error: "Senha de configuracao invalida." }, { status: 401 });
    }

    const vars = validatePayload(payload, request);
    const isVercel = process.env.VERCEL === "1";
    const saved = isVercel ? await saveVercelEnv(vars) : (await writeLocalEnv(vars), [...ENV_KEYS]);

    await applySupabaseSchema(vars.DATABASE_URL);

    return NextResponse.json({
      ok: true,
      mode: isVercel ? "vercel" : "local",
      saved,
      schemaApplied: true,
      needsRedeploy: isVercel,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nao foi possivel salvar a configuracao." },
      { status: 400 },
    );
  }
}
