"use client";

import Link from "next/link";
import Image from "next/image";
import { HeartHandshake, LogIn, LogOut, PawPrint, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/pets", label: "Pets" },
  { href: "/mapa-pet", label: "Mapa Pet" },
  { href: "/adocao-responsavel", label: "Adoção responsável" },
  { href: "/para-ongs", label: "Para ONGs" },
  { href: "/lar-temporario", label: "Lar temporário" },
  { href: "/privacidade", label: "LGPD" },
];

export function Header() {
  const [user, setUser] = useState<{ name: string; email: string; role?: string; avatarUrl?: string } | null>(null);
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const client = supabase;

    async function loadUser() {
      const { data } = await client.auth.getUser();
      if (!data.user) {
        setUser(null);
        setCheckedSession(true);
        return;
      }

      const { data: profile } = await client
        .from("profiles")
        .select("name, email, role, avatar_url")
        .eq("id", data.user.id)
        .maybeSingle();

      setUser({
        name: String(profile?.name ?? data.user.user_metadata?.name ?? "Usuário"),
        email: String(profile?.email ?? data.user.email ?? ""),
        role: profile?.role as string | undefined,
        avatarUrl: profile?.avatar_url ? String(profile.avatar_url) : undefined,
      });
      setCheckedSession(true);
    }

    void loadUser();

    const { data: listener } = client.auth.onAuthStateChange(() => {
      void loadUser();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#dbe6dc] bg-[#fffaf3]/95 backdrop-blur">
      <div className="container-page flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
        <Link href="/" className="flex items-center gap-2 font-black text-[#18392f]">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#0f766e] text-white">
            <PawPrint aria-hidden size={22} />
          </span>
          <span className="text-xl">PetLar</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-bold text-[#355044] lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#0f766e]">
              {item.label}
            </Link>
          ))}
        </nav>

        {!checkedSession ? (
          <div className="h-11 w-48 rounded-lg border border-[#dbe6dc] bg-white/70" aria-label="Carregando sessão" />
        ) : user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/configuracoes/perfil"
              className="flex min-h-11 items-center gap-3 rounded-lg border border-[#c9d8ce] bg-white px-3 text-left"
            >
              <span className="relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#e4f5ef] text-[#0f766e]">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={`Foto de ${user.name}`} fill sizes="32px" className="object-cover" />
                ) : (
                  <UserRound aria-hidden size={18} />
                )}
              </span>
              <span className="hidden max-w-44 leading-tight sm:block">
                <span className="block truncate text-sm font-black text-[#18392f]">{user.name}</span>
                <span className="block truncate text-xs font-semibold text-[#52665a]">{user.email}</span>
              </span>
            </Link>
            <button className="btn-secondary px-3 text-sm" onClick={signOut}>
              <LogOut aria-hidden size={17} />
              Sair
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-secondary px-3 text-sm">
              <LogIn aria-hidden size={17} />
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-primary px-3 text-sm">
              <HeartHandshake aria-hidden size={17} />
              Criar conta
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
