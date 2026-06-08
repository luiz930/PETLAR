"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle2, Power, Save, Trash2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getCategoryLabel,
  locationStatusLabels,
  mapSupabaseLocation,
  petServiceLocationAdminSelectQuery,
  petServiceCategories,
  rescuedAnimalsLabels,
  serviceTypeLabels,
  type HelpRescuedAnimals,
  type PetServiceLocation,
  type PetServiceStatus,
  type PetServiceType,
  type SupabasePetServiceLocationRow,
} from "@/lib/pet-service-locations";

const statusOrder: PetServiceStatus[] = ["pendente", "ativo", "inativo"];

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<PetServiceLocation[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [canAdmin, setCanAdmin] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PetServiceStatus | "todos">("pendente");

  useEffect(() => {
    async function loadLocations() {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        setLocations([]);
        setMessage("Supabase não configurado. Não é possível abrir a revisão administrativa.");
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setMessage("Faça login como administrador para revisar locais.");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (profile?.role !== "admin") {
        setMessage("A revisão de locais é restrita a administradores.");
        setLoading(false);
        return;
      }

      setCanAdmin(true);
      const { data, error } = await supabase
        .from("pet_service_locations")
        .select(petServiceLocationAdminSelectQuery)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
      } else {
        setLocations(((data ?? []) as SupabasePetServiceLocationRow[]).map(mapSupabaseLocation));
      }
      setLoading(false);
    }

    void loadLocations();
  }, []);

  const filteredLocations = useMemo(() => {
    if (statusFilter === "todos") return locations;
    return locations.filter((location) => location.status === statusFilter);
  }, [locations, statusFilter]);

  async function updateStatus(id: string, status: PetServiceStatus) {
    const supabase = getSupabaseBrowserClient();
    if (supabase && canAdmin) {
      const { error } = await supabase.from("pet_service_locations").update({ status }).eq("id", id);
      setMessage(error ? error.message : "Status atualizado.");
      if (!error) {
        setLocations((current) => current.map((location) => (location.id === id ? { ...location, status } : location)));
      }
    }
  }

  async function saveLocation(location: PetServiceLocation) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase não configurado. Alteração aplicada apenas na prévia local.");
      return;
    }

    const { error } = await supabase
      .from("pet_service_locations")
      .update({
        name: location.name,
        category: location.category,
        description: nullable(location.description),
        address: location.address,
        neighborhood: nullable(location.neighborhood),
        city: location.city,
        state: location.state.toUpperCase(),
        phone: nullable(location.phone),
        whatsapp: nullable(location.whatsapp),
        opening_hours: nullable(location.openingHours),
        is_24h: location.is24h,
        has_emergency: location.hasEmergency,
        helps_rescued_animals: location.helpsRescuedAnimals,
        service_type: location.serviceType,
        notes: nullable(location.notes),
        status: location.status,
      })
      .eq("id", location.id);

    setMessage(error ? error.message : "Local atualizado.");
  }

  async function deleteLocation(id: string) {
    const supabase = getSupabaseBrowserClient();
    if (supabase && canAdmin) {
      const { error } = await supabase.from("pet_service_locations").delete().eq("id", id);
      setMessage(error ? error.message : "Local excluído.");
      if (!error) {
        setLocations((current) => current.filter((location) => location.id !== id));
      }
    }
  }

  function patchLocation(id: string, patch: Partial<PetServiceLocation>) {
    setLocations((current) => current.map((location) => (location.id === id ? { ...location, ...patch } : location)));
  }

  return (
    <div className="container-page py-10">
      <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase text-[#0f766e]">Administração</p>
          <h1 className="mt-2 text-4xl font-black text-[#18392f]">Revisar locais do Mapa Pet</h1>
          <p className="mt-2 max-w-3xl leading-7 text-[#52665a]">
            Aprove locais sugeridos, corrija informações, marque como inativo ou exclua cadastros incorretos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/admin/ongs" className="btn-secondary">
            <Building2 aria-hidden size={18} />
            Revisar ONGs
          </Link>
          <Link href="/dashboard/locais/novo" className="btn-secondary">
            Sugerir local
          </Link>
        </div>
      </div>

      {message && <p className="mb-5 rounded-lg bg-[#e4f5ef] p-4 font-bold text-[#0f5f57]">{message}</p>}

      <section className="mb-6 flex flex-wrap gap-2">
        <FilterButton active={statusFilter === "pendente"} label="Pendentes" onClick={() => setStatusFilter("pendente")} />
        <FilterButton active={statusFilter === "ativo"} label="Ativos" onClick={() => setStatusFilter("ativo")} />
        <FilterButton active={statusFilter === "inativo"} label="Inativos" onClick={() => setStatusFilter("inativo")} />
        <FilterButton active={statusFilter === "todos"} label="Todos" onClick={() => setStatusFilter("todos")} />
      </section>

      {!canAdmin && !loading ? (
        <div className="surface p-8 text-center">
          <h2 className="text-2xl font-black text-[#18392f]">Acesso administrativo necessário</h2>
        </div>
      ) : filteredLocations.length > 0 ? (
        <div className="grid gap-5">
          {filteredLocations.map((location) => (
            <article key={location.id} className="surface grid gap-4 p-5">
              <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                <div>
                  <p className="text-sm font-black uppercase text-[#0f766e]">{getCategoryLabel(location.category)}</p>
                  <h2 className="mt-1 text-2xl font-black text-[#18392f]">{location.name}</h2>
                  <p className="mt-1 text-sm font-bold text-[#52665a]">
                    Status: {locationStatusLabels[location.status]} · Sugerido por:{" "}
                    {location.suggestedByName || location.suggestedByEmail || location.suggestedBy || "Cadastro direto"}
                  </p>
                  {location.sourceInfo && <p className="mt-1 text-sm font-semibold text-[#52665a]">Fonte: {location.sourceInfo}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn-primary px-3 py-2 text-sm" onClick={() => void updateStatus(location.id, "ativo")}>
                    <CheckCircle2 aria-hidden size={16} />
                    Aprovar
                  </button>
                  <button className="btn-secondary px-3 py-2 text-sm" onClick={() => void updateStatus(location.id, "inativo")}>
                    <Power aria-hidden size={16} />
                    Inativar
                  </button>
                  <button className="btn-secondary px-3 py-2 text-sm" onClick={() => void deleteLocation(location.id)}>
                    <Trash2 aria-hidden size={16} />
                    Excluir
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Input label="Nome" value={location.name} onChange={(name) => patchLocation(location.id, { name })} />
                <label className="label">
                  Categoria
                  <select className="field" value={location.category} onChange={(event) => patchLocation(location.id, { category: event.target.value as PetServiceLocation["category"] })}>
                    {petServiceCategories.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <Input label="Endereço" value={location.address} onChange={(address) => patchLocation(location.id, { address })} />
                <Input label="Bairro" value={location.neighborhood} onChange={(neighborhood) => patchLocation(location.id, { neighborhood })} />
                <Input label="Cidade" value={location.city} onChange={(city) => patchLocation(location.id, { city })} />
                <Input label="UF" value={location.state} onChange={(state) => patchLocation(location.id, { state })} />
                <Input label="Telefone" value={location.phone} onChange={(phone) => patchLocation(location.id, { phone })} />
                <Input label="WhatsApp" value={location.whatsapp} onChange={(whatsapp) => patchLocation(location.id, { whatsapp })} />
                <Input label="Horário" value={location.openingHours} onChange={(openingHours) => patchLocation(location.id, { openingHours })} />
                <label className="label">
                  Atendimento resgatados
                  <select className="field" value={location.helpsRescuedAnimals} onChange={(event) => patchLocation(location.id, { helpsRescuedAnimals: event.target.value as HelpRescuedAnimals })}>
                    {Object.entries(rescuedAnimalsLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="label">
                  Tipo de atendimento
                  <select className="field" value={location.serviceType} onChange={(event) => patchLocation(location.id, { serviceType: event.target.value as PetServiceType })}>
                    {Object.entries(serviceTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="label">
                  Status
                  <select className="field" value={location.status} onChange={(event) => patchLocation(location.id, { status: event.target.value as PetServiceStatus })}>
                    {statusOrder.map((status) => (
                      <option key={status} value={status}>
                        {locationStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <TextArea label="Descrição" value={location.description} onChange={(description) => patchLocation(location.id, { description })} />
                <TextArea label="Observações" value={location.notes} onChange={(notes) => patchLocation(location.id, { notes })} />
              </div>

              <div className="flex flex-wrap gap-4">
                <Checkbox label="Atendimento 24h" checked={location.is24h} onChange={(is24h) => patchLocation(location.id, { is24h })} />
                <Checkbox label="Atende emergência" checked={location.hasEmergency} onChange={(hasEmergency) => patchLocation(location.id, { hasEmergency })} />
              </div>

              <button className="btn-primary w-fit" onClick={() => void saveLocation(location)}>
                <Save aria-hidden size={18} />
                Salvar edição
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="surface p-8 text-center">
          <h2 className="text-2xl font-black text-[#18392f]">
            {loading ? "Carregando locais..." : "Nenhum local encontrado nessa revisão."}
          </h2>
        </div>
      )}
    </div>
  );
}

function nullable(value: string) {
  const clean = value.trim();
  return clean ? clean : null;
}

function FilterButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button className={active ? "btn-primary px-3 py-2 text-sm" : "btn-secondary px-3 py-2 text-sm"} onClick={onClick}>
      {label}
    </button>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="label">
      {label}
      <input className="field" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="label">
      {label}
      <textarea className="field min-h-28" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-[#dbe6dc] bg-white p-3 font-bold text-[#263b31]">
      <input className="h-5 w-5 accent-[#0f766e]" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}
