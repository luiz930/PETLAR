"use client";

import Link from "next/link";
import { ClipboardList, Edit3, Eye, Plus, RefreshCcw } from "lucide-react";
import { statusLabels, type Pet, type PetStatus } from "@/data/domain";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mapSupabasePet, petSelectQuery, type SupabasePetRow } from "@/lib/pet-mapper";

export default function OngDashboardPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [applicationsCount, setApplicationsCount] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: petRows } = await supabase
        .from("pets")
        .select(petSelectQuery)
        .order("created_at", { ascending: false });

      if (petRows?.length) {
        setPets((petRows as SupabasePetRow[]).map(mapSupabasePet));
      } else {
        setPets([]);
      }

      const { count } = await supabase
        .from("adoption_applications")
        .select("id", { count: "exact", head: true });

      setApplicationsCount(count ?? 0);
    }

    void loadDashboard();
  }, []);

  const totals = {
    all: pets.length,
    available: pets.filter((pet) => pet.status === "disponivel").length,
    adopted: pets.filter((pet) => pet.status === "adotado").length,
    applications: applicationsCount,
  };

  async function changeStatus(id: string, status: PetStatus) {
    setPets((current) => current.map((pet) => (pet.id === id ? { ...pet, status } : pet)));
    const supabase = getSupabaseBrowserClient();
    if (supabase && isUuid(id)) {
      await supabase.from("pets").update({ status }).eq("id", id);
    }
  }

  return (
    <div className="container-page py-10">
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase text-[#0f766e]">Painel da ONG/protetor</p>
          <h1 className="mt-2 text-4xl font-black text-[#18392f]">Gestão de pets e interessados</h1>
        </div>
        <Link href="/dashboard/ong/pets/novo" className="btn-primary">
          <Plus aria-hidden size={18} />
          Cadastrar novo pet
        </Link>
      </div>

      <section className="mb-6 grid gap-4 md:grid-cols-4">
        <Metric label="Total de pets" value={totals.all} />
        <Metric label="Pets disponíveis" value={totals.available} />
        <Metric label="Pets adotados" value={totals.adopted} />
        <Metric label="Solicitações recebidas" value={totals.applications} />
      </section>

      <section className="surface p-5">
        <h2 className="mb-5 flex items-center gap-2 text-2xl font-black text-[#18392f]">
          <ClipboardList aria-hidden size={24} />
          Pets cadastrados
        </h2>
        {pets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left">
              <thead className="text-sm text-[#52665a]">
                <tr>
                  <th className="px-3 py-2">Pet</th>
                  <th className="px-3 py-2">Cidade/UF</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pets.map((pet) => (
                  <tr key={pet.id} className="bg-white">
                    <td className="rounded-l-lg px-3 py-3 font-black text-[#18392f]">{pet.name}</td>
                    <td className="px-3 py-3 text-[#52665a]">{pet.city}/{pet.state}</td>
                    <td className="px-3 py-3">
                      <select className="field max-w-52" value={pet.status} onChange={(event) => void changeStatus(pet.id, event.target.value as PetStatus)}>
                        {(Object.keys(statusLabels) as PetStatus[]).map((key) => (
                          <option key={key} value={key}>{statusLabels[key]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="rounded-r-lg px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/dashboard/ong/pets/${pet.id}/editar`} className="btn-secondary px-3 py-2 text-sm">
                          <Edit3 aria-hidden size={16} /> Editar
                        </Link>
                        <Link href="/dashboard/ong/interessados" className="btn-secondary px-3 py-2 text-sm">
                          <Eye aria-hidden size={16} /> Ver interessados
                        </Link>
                        <button className="btn-secondary px-3 py-2 text-sm" onClick={() => void changeStatus(pet.id, "adotado")}>
                          <RefreshCcw aria-hidden size={16} /> Marcar adotado
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg bg-[#f4f1e8] p-8 text-center">
            <h3 className="text-xl font-black text-[#18392f]">Nenhum pet cadastrado ainda</h3>
            <p className="mt-2 text-[#52665a]">Cadastre o primeiro animal disponível para adoção.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface p-5">
      <p className="text-sm font-black uppercase text-[#6c7a70]">{label}</p>
      <p className="mt-2 text-4xl font-black text-[#0f766e]">{value}</p>
    </div>
  );
}
