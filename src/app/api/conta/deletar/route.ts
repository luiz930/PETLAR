import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import pg from "pg";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_POOLER_URL;

export async function DELETE(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return NextResponse.json({ error: "Sessão não encontrada." }, { status: 401 });
  }

  if (!supabaseUrl || !supabaseAnonKey || !databaseUrl) {
    return NextResponse.json({ error: "Configuração do servidor incompleta." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return NextResponse.json({ error: "Sessão inválida ou expirada." }, { status: 401 });
  }

  const userId = data.user.id;

  await removeStorageFolder(supabase, "profile-avatars", userId);
  await removeStorageFolder(supabase, "pet-images", userId);
  await deleteAuthUser(userId);

  return NextResponse.json({ ok: true });
}

async function removeStorageFolder(
  supabase: SupabaseClient,
  bucket: string,
  folder: string,
) {
  const files = await listFilesRecursive(supabase, bucket, folder);

  if (files.length > 0) {
    await supabase.storage.from(bucket).remove(files);
  }
}

async function listFilesRecursive(
  supabase: SupabaseClient,
  bucket: string,
  folder: string,
) {
  const result: string[] = [];
  const { data } = await supabase.storage.from(bucket).list(folder, { limit: 1000 });

  for (const item of data ?? []) {
    const path = `${folder}/${item.name}`;

    if (item.id) {
      result.push(path);
    } else {
      result.push(...(await listFilesRecursive(supabase, bucket, path)));
    }
  }

  return result;
}

async function deleteAuthUser(userId: string) {
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query("delete from auth.users where id = $1", [userId]);
  } finally {
    await client.end();
  }
}
