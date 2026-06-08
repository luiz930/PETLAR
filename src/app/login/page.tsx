"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { LogIn } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="container-page py-10">Carregando...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Serviço de autenticação indisponível. Verifique a configuração do ambiente.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    router.push(profile?.role === "ong" ? "/dashboard/ong" : "/dashboard/adotante");
  }

  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-10">
      <section className="surface w-full max-w-lg p-6">
        <p className="text-sm font-black uppercase text-[#0f766e]">Acesso</p>
        <h1 className="mt-2 text-3xl font-black text-[#18392f]">Entrar no PetLar</h1>
        <p className="mt-2 text-sm leading-6 text-[#52665a]">
          Visitantes podem navegar livremente. O login é necessário para enviar
          interesse de adoção e acompanhar pedidos.
        </p>
        {searchParams.get("cadastro") === "ok" && (
          <div className="mt-4 rounded-lg bg-[#e4f5ef] p-3 text-sm font-bold text-[#0f5f57]">
            Cadastro criado. Entre com seu e-mail e senha.
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="label">
            E-mail
            <input className="field" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" />
          </label>
          <label className="label">
            Senha
            <input className="field" type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" />
          </label>
          <button className="btn-primary" disabled={loading}>
            <LogIn aria-hidden size={18} />
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        {message && <p className="mt-4 rounded-lg bg-[#e4f5ef] p-3 text-sm font-bold text-[#0f766e]">{message}</p>}
        <p className="mt-5 text-sm text-[#52665a]">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-black text-[#0f766e]">
            Criar cadastro
          </Link>
        </p>
      </section>
    </div>
  );
}
