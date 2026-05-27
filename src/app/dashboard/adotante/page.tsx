"use client";

import Link from "next/link";
import { CalendarDays, FileText, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { applicationStatusLabels, type ApplicationStatus } from "@/data/domain";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ApplicationItem = {
  id: string;
  petName: string;
  sentAt: string;
  status: ApplicationStatus;
  reason: string;
};

export default function AdopterDashboardPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [profile, setProfile] = useState({ name: "Adotante", email: "", city: "" });

  useEffect(() => {
    async function loadApplications() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      setProfile({
        name: String(userData.user.user_metadata?.name ?? "Adotante"),
        email: userData.user.email ?? "",
        city: "",
      });

      const { data } = await supabase
        .from("adoption_applications")
        .select("id, created_at, status, reason_to_adopt, pets(name)")
        .order("created_at", { ascending: false });

      if (data) {
        setApplications(
          data.map((item) => ({
            id: String(item.id),
            petName: getRelatedName(item.pets),
            sentAt: String(item.created_at),
            status: item.status as ApplicationStatus,
            reason: String(item.reason_to_adopt ?? ""),
          })),
        );
      }
    }

    void loadApplications();
  }, []);

  return (
    <div className="container-page py-10">
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase text-[#0f766e]">Painel do adotante</p>
          <h1 className="mt-2 text-4xl font-black text-[#18392f]">Acompanhe seus pedidos</h1>
        </div>
        <Link href="/pets" className="btn-primary">
          Encontrar pets
        </Link>
      </div>

      <section className="surface mb-6 flex flex-col gap-4 p-5 md:flex-row md:items-center">
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-[#e4f5ef] text-[#0f766e]">
          <UserRound aria-hidden size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#18392f]">{profile.name}</h2>
          <p className="text-[#52665a]">{profile.email}{profile.city ? ` · ${profile.city}` : ""}</p>
        </div>
        <Link href="/cadastro" className="btn-secondary md:ml-auto">
          Editar perfil básico
        </Link>
      </section>

      <section className="surface p-5">
        <h2 className="mb-5 flex items-center gap-2 text-2xl font-black text-[#18392f]">
          <FileText aria-hidden size={24} />
          Formulários enviados
        </h2>
        {applications.length > 0 ? (
          <div className="grid gap-3">
            {applications.map((application) => (
              <article key={application.id} className="rounded-lg border border-[#dbe6dc] bg-white p-4">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <h3 className="text-xl font-black text-[#18392f]">{application.petName}</h3>
                    <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#52665a]">
                      <CalendarDays aria-hidden size={16} />
                      Enviado em {new Date(application.sentAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span className="badge bg-[#e4f5ef] text-[#0f766e]">
                    {applicationStatusLabels[application.status]}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#52665a]">{application.reason}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-[#f4f1e8] p-8 text-center">
            <h3 className="text-xl font-black text-[#18392f]">Nenhum pedido enviado ainda</h3>
            <p className="mt-2 text-[#52665a]">Quando você demonstrar interesse por um pet, o pedido aparecerá aqui.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function getRelatedName(value: unknown) {
  if (Array.isArray(value)) return String(value[0]?.name ?? "Pet");
  if (value && typeof value === "object" && "name" in value) {
    return String((value as { name?: string }).name ?? "Pet");
  }
  return "Pet";
}
