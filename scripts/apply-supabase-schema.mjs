import { readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_POOLER_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL ou SUPABASE_DB_POOLER_URL não configurada.");
  process.exit(1);
}

const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
const sql = await readFile(schemaPath, "utf8");
const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log("Schema Supabase aplicado com sucesso.");
} finally {
  await client.end();
}
