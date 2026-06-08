"use client";

import Link from "next/link";
import { Building2, CheckCircle2, MapPin, Power } from "lucide-react";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Organization = {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  email: string;
  approved: boolean;
  ownerName: string;
  ownerEmail: string;
};

type OrganizationRow = {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  email: string;
  approved: boolean;
  profiles?: { name?: string | null; email?: string | null } | null;
};

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [canAdmin, setCanAdmin] = useState(false);

  useEffect(() => {
    async function loadOrganizations() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setMessage("Supabase não configurado. Não é possível abrir a revisão administrativa.");
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setMessage("Faça login como administrador para revisar ONGs e protetores.");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (profile?.role !== "admin") {
        setMessage("A revisão de ONGs e protetores é restrita a administradores.");
        setLoading(false);
        return;
      }

      setCanAdmin(true);
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, type, city, state, email, approved, profiles:user_id(name, email)")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
      } else {
        setOrganizations(((data ?? []) as OrganizationRow[]).map(mapOrganization));
      }

      setLoading(false);
    }

    void loadOrganizations();
  }, []);

  async function setApproval(id: string, approved: boolean) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !canAdmin) return;

    const { error } = await supabase.rpc("set_organization_approval", {
      organization_id: id,
      next_approved: approved,
    });

    setMessage(error ? error.message : approved ? "ONG/protetor aprovado." : "ONG/protetor suspenso.");
    if (!error) {
      setOrganizations((current) =>
        current.map((organization) => (organization.id === id ? { ...organization, approved } : organization)),
      );
    }
  }

  return (
    <div className="container-page py-10">
      <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase text-[#0f766e]">Administração</p>
          <h1 className="mt-2 text-4xl font-black text-[#18392f]">Revisar ONGs e protetores</h1>
          <p className="mt-2 max-w-3xl leading-7 text-[#52665a]">
            Aprove somente responsáveis validados. Pets de organizações pendentes não aparecem publicamente.
          </p>
        </div>
        <Link href="/dashboard/admin/locais" className="btn-secondary">
          Revisar Mapa Pet
        </Link>
      </div>

      {message && <p className="mb-5 rounded-lg bg-[#e4f5ef] p-4 font-bold text-[#0f5f57]">{message}</p>}

      {!canAdmin && !loading ? (
        <div className="surface p-8 text-center">
          <h2 className="text-2xl font-black text-[#18392f]">Acesso administrativo necessário</h2>
        </div>
      ) : organizations.length > 0 ? (
        <div className="grid gap-4">
          {organizations.map((organization) => (
            <article key={organization.id} className="surface flex flex-col justify-between gap-5 p-5 lg:flex-row lg:items-center">
              <div>
                <p className="flex items-center gap-2 text-sm font-black uppercase text-[#0f766e]">
                  <Building2 aria-hidden size={17} />
                  {organization.type === "ong" ? "ONG" : "Protetor independente"}
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#18392f]">{organization.name}</h2>
                <p className="mt-2 flex items-center gap-2 font-bold text-[#52665a]">
                  <MapPin aria-hidden size={17} />
                  {organization.city}/{organization.state}
                </p>
                <p className="mt-2 text-sm text-[#52665a]">
                  Responsável: {organization.ownerName || organization.ownerEmail || "Não informado"} · {organization.email}
                </p>
                <span className={organization.approved ? "badge mt-3 bg-[#e4f5ef] text-[#0f766e]" : "badge mt-3 bg-[#fff7df] text-[#6f4f00]"}>
                  {organization.approved ? "Aprovado" : "Pendente de revisão"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {!organization.approved && (
                  <button className="btn-primary" onClick={() => void setApproval(organization.id, true)}>
                    <CheckCircle2 aria-hidden size={18} />
                    Aprovar
                  </button>
                )}
                {organization.approved && (
                  <button className="btn-secondary" onClick={() => void setApproval(organization.id, false)}>
                    <Power aria-hidden size={18} />
                    Suspender
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="surface p-8 text-center">
          <h2 className="text-2xl font-black text-[#18392f]">
            {loading ? "Carregando ONGs e protetores..." : "Nenhuma ONG ou protetor cadastrado ainda."}
          </h2>
        </div>
      )}
    </div>
  );
}

function mapOrganization(row: OrganizationRow): Organization {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    city: row.city,
    state: row.state,
    email: row.email,
    approved: row.approved,
    ownerName: String(row.profiles?.name ?? ""),
    ownerEmail: String(row.profiles?.email ?? ""),
  };
}
