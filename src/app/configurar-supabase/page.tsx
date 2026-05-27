"use client";

import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, Database, KeyRound, Loader2, ShieldAlert } from "lucide-react";

type SetupResponse = {
  ok?: boolean;
  mode?: "local" | "vercel";
  saved?: string[];
  schemaApplied?: boolean;
  needsRedeploy?: boolean;
  error?: string;
};

function inferProjectUrl(poolerUrl: string) {
  const match = poolerUrl.match(/postgres\.([a-z0-9]+):/i);
  return match ? `https://${match[1]}.supabase.co` : "";
}

export default function ConfigurarSupabasePage() {
  const [databaseUrl, setDatabaseUrl] = useState("");
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const [vercelToken, setVercelToken] = useState("");
  const [vercelProjectIdOrName, setVercelProjectIdOrName] = useState("PETLAR");
  const [vercelTeamId, setVercelTeamId] = useState("");
  const [vercelTeamSlug, setVercelTeamSlug] = useState("");
  const [setupPassword, setSetupPassword] = useState("");
  const [applySchema, setApplySchema] = useState(true);
  const [status, setStatus] = useState<SetupResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const detectedUrl = useMemo(() => inferProjectUrl(databaseUrl), [databaseUrl]);

  function onPoolerChange(value: string) {
    setDatabaseUrl(value);
    const inferred = inferProjectUrl(value);
    if (inferred && !supabaseUrl) {
      setSupabaseUrl(inferred);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const response = await fetch("/api/configurar-supabase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        databaseUrl,
        supabaseUrl: supabaseUrl || detectedUrl,
        supabaseAnonKey,
        appUrl,
        vercelToken,
        vercelProjectIdOrName,
        vercelTeamId,
        vercelTeamSlug,
        setupPassword,
        applySchema,
      }),
    });

    const data = (await response.json()) as SetupResponse;
    setStatus(data);
    setLoading(false);
  }

  return (
    <main className="bg-[var(--background)]">
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <span className="text-sm font-black uppercase tracking-wide text-[var(--primary)]">
            Configuracao
          </span>
          <h1 className="mt-3 text-3xl font-black text-[var(--text)] sm:text-4xl">
            Configurar Supabase
          </h1>
          <p className="mt-3 text-base text-[var(--muted)]">
            Cole os dados do Supabase e do Session Pooler. No Vercel, informe tambem um token da
            Vercel para a pagina gravar as variaveis no projeto.
          </p>
        </div>

        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          <div className="flex gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              Use esta pagina apenas enquanto configura o sistema. Depois de salvar no Vercel,
              faca um novo deploy para as variaveis entrarem no build.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-2 flex items-center gap-2 text-sm font-black text-[var(--text)]">
                <Database className="h-4 w-4 text-[var(--primary)]" />
                Connection string do Session Pooler
              </span>
              <textarea
                required
                rows={3}
                value={databaseUrl}
                onChange={(event) => onPoolerChange(event.target.value)}
                placeholder="postgresql://postgres.PROJECT_REF:SUA-SENHA@aws-1-us-west-1.pooler.supabase.com:5432/postgres"
                className="w-full rounded-lg border border-[var(--border)] px-4 py-3 font-mono text-sm outline-none focus:border-[var(--primary)]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black text-[var(--text)]">Project URL</span>
              <input
                required
                value={supabaseUrl || detectedUrl}
                onChange={(event) => setSupabaseUrl(event.target.value)}
                placeholder="https://seu-projeto.supabase.co"
                className="w-full rounded-lg border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black text-[var(--text)]">URL do site</span>
              <input
                required
                value={appUrl}
                onChange={(event) => setAppUrl(event.target.value)}
                placeholder="https://petlar.vercel.app"
                className="w-full rounded-lg border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
              />
            </label>

            <label className="md:col-span-2">
              <span className="mb-2 flex items-center gap-2 text-sm font-black text-[var(--text)]">
                <KeyRound className="h-4 w-4 text-[var(--primary)]" />
                Supabase anon public key
              </span>
              <textarea
                required
                rows={3}
                value={supabaseAnonKey}
                onChange={(event) => setSupabaseAnonKey(event.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full rounded-lg border border-[var(--border)] px-4 py-3 font-mono text-sm outline-none focus:border-[var(--primary)]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black text-[var(--text)]">Vercel token</span>
              <input
                type="password"
                value={vercelToken}
                onChange={(event) => setVercelToken(event.target.value)}
                placeholder="Token criado na Vercel"
                className="w-full rounded-lg border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black text-[var(--text)]">Projeto na Vercel</span>
              <input
                value={vercelProjectIdOrName}
                onChange={(event) => setVercelProjectIdOrName(event.target.value)}
                placeholder="PETLAR ou prj_..."
                className="w-full rounded-lg border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black text-[var(--text)]">Team ID opcional</span>
              <input
                value={vercelTeamId}
                onChange={(event) => setVercelTeamId(event.target.value)}
                placeholder="team_..."
                className="w-full rounded-lg border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black text-[var(--text)]">Team slug opcional</span>
              <input
                value={vercelTeamSlug}
                onChange={(event) => setVercelTeamSlug(event.target.value)}
                placeholder="nome-do-time"
                className="w-full rounded-lg border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black text-[var(--text)]">
                Senha da pagina opcional
              </span>
              <input
                type="password"
                value={setupPassword}
                onChange={(event) => setSetupPassword(event.target.value)}
                placeholder="Use se PETLAR_SETUP_PASSWORD existir"
                className="w-full rounded-lg border border-[var(--border)] px-4 py-3 outline-none focus:border-[var(--primary)]"
              />
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--text)]">
              <input
                type="checkbox"
                checked={applySchema}
                onChange={(event) => setApplySchema(event.target.checked)}
                className="h-5 w-5 accent-[var(--primary)]"
              />
              Criar tabelas, buckets e regras RLS no Supabase
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-4 text-base font-black text-white transition hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
            Salvar configuracao
          </button>

          {status?.error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
              {status.error}
            </div>
          )}

          {status?.ok && (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
              Configuracao salva. {status.schemaApplied ? "Banco configurado. " : ""}
              {status.needsRedeploy
                ? "Agora faca Redeploy na Vercel para o site carregar as novas variaveis."
                : "Reinicie o servidor local para carregar as variaveis."}
            </div>
          )}
        </form>
      </section>
    </main>
  );
}
