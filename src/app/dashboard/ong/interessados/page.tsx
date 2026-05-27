"use client";

import { useState } from "react";
import { useEffect } from "react";
import { Mail, MessageCircle, UserCheck } from "lucide-react";
import { applicationStatusLabels, type ApplicationStatus } from "@/data/domain";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type InterestedItem = {
  id: string;
  petName: string;
  adopterName: string;
  email: string;
  whatsapp: string;
  city: string;
  neighborhood: string;
  sentAt: string;
  status: ApplicationStatus;
  reason: string;
};

export default function InterestedPeoplePage() {
  const [items, setItems] = useState<InterestedItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const current = items.find((item) => item.id === selected);

  useEffect(() => {
    async function loadInterestedPeople() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase
        .from("adoption_applications")
        .select("id, full_name, email, whatsapp, city, neighborhood, created_at, status, reason_to_adopt, pets(name)")
        .order("created_at", { ascending: false });

      if (data) {
        const mapped = data.map((item) => ({
          id: String(item.id),
          petName: getRelatedName(item.pets),
          adopterName: String(item.full_name),
          email: String(item.email),
          whatsapp: String(item.whatsapp),
          city: String(item.city),
          neighborhood: String(item.neighborhood),
          sentAt: String(item.created_at),
          status: item.status as ApplicationStatus,
          reason: String(item.reason_to_adopt ?? ""),
        }));
        setItems(mapped);
        setSelected(mapped[0]?.id ?? null);
      }
    }

    void loadInterestedPeople();
  }, []);

  async function updateStatus(id: string, status: ApplicationStatus) {
    setItems((currentItems) => currentItems.map((item) => (item.id === id ? { ...item, status } : item)));
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.from("adoption_applications").update({ status }).eq("id", id);
    }
  }

  return (
    <div className="container-page py-10">
      <div className="mb-7">
        <p className="text-sm font-black uppercase text-[#0f766e]">Interessados recebidos</p>
        <h1 className="mt-2 text-4xl font-black text-[#18392f]">Análise dos formulários de adoção</h1>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="surface p-5">
            <div className="grid gap-3">
              {items.map((item) => (
                <article key={item.id} className="rounded-lg border border-[#dbe6dc] bg-white p-4">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <h2 className="text-xl font-black text-[#18392f]">{item.adopterName}</h2>
                      <p className="mt-1 text-sm font-bold text-[#52665a]">Pet desejado: {item.petName}</p>
                      <p className="text-sm text-[#52665a]">Enviado em {new Date(item.sentAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <span className="badge bg-[#e4f5ef] text-[#0f766e]">{applicationStatusLabels[item.status]}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="btn-secondary px-3 py-2 text-sm" onClick={() => setSelected(item.id)}>
                      <UserCheck aria-hidden size={16} />
                      Ver formulário completo
                    </button>
                    <a className="btn-secondary px-3 py-2 text-sm" href={`https://wa.me/${item.whatsapp}`} target="_blank" rel="noreferrer">
                      <MessageCircle aria-hidden size={16} />
                      WhatsApp
                    </a>
                    <a className="btn-secondary px-3 py-2 text-sm" href={`mailto:${item.email}`}>
                      <Mail aria-hidden size={16} />
                      E-mail
                    </a>
                    <select className="field max-w-64" value={item.status} onChange={(event) => void updateStatus(item.id, event.target.value as ApplicationStatus)}>
                      {(Object.keys(applicationStatusLabels) as ApplicationStatus[]).map((key) => (
                        <option key={key} value={key}>{applicationStatusLabels[key]}</option>
                      ))}
                    </select>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="surface h-fit p-5">
            <h2 className="text-2xl font-black text-[#18392f]">Formulário completo</h2>
            {current ? (
              <dl className="mt-5 grid gap-3 text-sm">
                <Detail label="Nome" value={current.adopterName} />
                <Detail label="E-mail" value={current.email} />
                <Detail label="WhatsApp" value={current.whatsapp} />
                <Detail label="Cidade/Bairro" value={`${current.city} · ${current.neighborhood}`} />
                <Detail label="Motivação" value={current.reason} />
                <Detail label="Status" value={applicationStatusLabels[current.status]} />
              </dl>
            ) : (
              <p className="mt-4 text-[#52665a]">Selecione um formulário para visualizar.</p>
            )}
          </aside>
        </div>
      ) : (
        <div className="surface p-8 text-center">
          <h2 className="text-2xl font-black text-[#18392f]">Nenhum interessado recebido ainda</h2>
          <p className="mt-2 text-[#52665a]">Os formulários enviados para seus pets aparecerão aqui.</p>
        </div>
      )}
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#f4f1e8] p-3">
      <dt className="font-black text-[#18392f]">{label}</dt>
      <dd className="mt-1 leading-6 text-[#52665a]">{value}</dd>
    </div>
  );
}
