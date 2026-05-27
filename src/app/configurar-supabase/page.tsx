"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Database, Loader2 } from "lucide-react";

type SetupResponse = {
  ok?: boolean;
  mode?: "local" | "vercel";
  schemaApplied?: boolean;
  needsRedeploy?: boolean;
  error?: string;
};

export default function ConfigurarSupabasePage() {
  const [databaseUrl, setDatabaseUrl] = useState("");
  const [status, setStatus] = useState<SetupResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const response = await fetch("/api/configurar-supabase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ databaseUrl }),
    });

    const data = (await response.json()) as SetupResponse;
    setStatus(data);
    setLoading(false);
  }

  return (
    <main className="bg-[var(--background)]">
      <section className="mx-auto flex min-h-[calc(100vh-190px)] max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <form
          onSubmit={onSubmit}
          className="w-full rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm sm:p-7"
        >
          <span className="text-sm font-black uppercase tracking-wide text-[var(--primary)]">
            Supabase
          </span>
          <h1 className="mt-3 text-3xl font-black text-[var(--text)]">Configurar banco</h1>
          <p className="mt-2 text-sm font-semibold text-[var(--muted)]">
            Cole apenas a connection string do Session Pooler.
          </p>

          <label className="mt-6 block">
            <span className="mb-2 flex items-center gap-2 text-sm font-black text-[var(--text)]">
              <Database className="h-4 w-4 text-[var(--primary)]" />
              Connection string
            </span>
            <textarea
              required
              rows={4}
              value={databaseUrl}
              onChange={(event) => setDatabaseUrl(event.target.value)}
              placeholder="postgresql://postgres.PROJECT_REF:SUA-SENHA@aws-1-us-west-1.pooler.supabase.com:5432/postgres"
              className="w-full rounded-lg border border-[var(--border)] px-4 py-3 font-mono text-sm outline-none focus:border-[var(--primary)]"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="sticky bottom-4 mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-4 text-base font-black text-white shadow-lg transition hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
            Salvar e configurar
          </button>

          {status?.error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
              {status.error}
            </div>
          )}

          {status?.ok && (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
              Configuracao salva e banco preparado.
              {status.needsRedeploy
                ? " Agora faca Redeploy na Vercel para o site carregar as variaveis."
                : " Reinicie o servidor local para carregar as variaveis."}
            </div>
          )}
        </form>
      </section>
    </main>
  );
}
