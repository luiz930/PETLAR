"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HeartHandshake } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserRole } from "@/data/domain";

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("adotante");
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

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });

    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/login?cadastro=ok");
  }

  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-10">
      <section className="surface w-full max-w-2xl p-6">
        <p className="text-sm font-black uppercase text-[#0f766e]">Cadastro</p>
        <h1 className="mt-2 text-3xl font-black text-[#18392f]">Criar conta no PetLar</h1>
        <p className="mt-2 text-sm leading-6 text-[#52665a]">
          Escolha o perfil que representa sua participação na plataforma.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="label">
            Nome
            <input className="field" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome completo ou responsável" />
          </label>
          <label className="label">
            Tipo de perfil
            <select className="field" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              <option value="adotante">Adotante</option>
              <option value="ong">ONG/protetor</option>
              <option value="lar_temporario">Lar temporário</option>
            </select>
          </label>
          <label className="label">
            E-mail
            <input className="field" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" />
          </label>
          <label className="label">
            Senha
            <input className="field" type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 6 caracteres" />
          </label>
          <button className="btn-primary md:col-span-2" disabled={loading}>
            <HeartHandshake aria-hidden size={18} />
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>
        {message && <p className="mt-4 rounded-lg bg-[#e4f5ef] p-3 text-sm font-bold text-[#0f766e]">{message}</p>}
      </section>
    </div>
  );
}
