"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Filter, MapPin, Plus, Search } from "lucide-react";
import { PetLocationCard } from "@/components/pet-location-card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  locationNotice,
  mapSupabaseLocation,
  mockPetServiceLocations,
  petServiceCategories,
  petServiceLocationSelectQuery,
  type PetServiceLocation,
  type SupabasePetServiceLocationRow,
} from "@/lib/pet-service-locations";

const all = "todos";

export default function MapaPetPage() {
  const [locations, setLocations] = useState<PetServiceLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(all);
  const [only24h, setOnly24h] = useState(false);
  const [onlyEmergency, setOnlyEmergency] = useState(false);
  const [onlyAffordable, setOnlyAffordable] = useState(false);

  useEffect(() => {
    async function loadLocations() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setLocations(mockPetServiceLocations);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("pet_service_locations")
        .select(petServiceLocationSelectQuery)
        .eq("status", "ativo")
        .order("name", { ascending: true });

      if (!error && data) {
        setLocations((data as SupabasePetServiceLocationRow[]).map(mapSupabaseLocation));
      } else {
        setLocations(mockPetServiceLocations);
      }
      setLoading(false);
    }

    void loadLocations();
  }, []);

  const filteredLocations = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return locations.filter((location) => {
      const matchesSearch =
        !searchTerm ||
        location.name.toLowerCase().includes(searchTerm) ||
        location.neighborhood.toLowerCase().includes(searchTerm) ||
        location.city.toLowerCase().includes(searchTerm);
      const matchesCategory = category === all || location.category === category;
      const matches24h = !only24h || location.is24h;
      const matchesEmergency = !onlyEmergency || location.hasEmergency;
      const matchesAffordable = !onlyAffordable || location.serviceType === "gratuito" || location.serviceType === "popular";

      return matchesSearch && matchesCategory && matches24h && matchesEmergency && matchesAffordable;
    });
  }, [category, locations, only24h, onlyAffordable, onlyEmergency, search]);

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase text-[#0f766e]">Mapa Pet</p>
          <h1 className="mt-2 text-4xl font-black text-[#18392f]">Locais de atendimento e apoio animal</h1>
          <p className="mt-3 max-w-3xl leading-7 text-[#52665a]">
            Consulte hospitais veterinários, clínicas, emergências, castração popular, ONGs, lares temporários,
            pontos de arrecadação e outros serviços úteis para animais.
          </p>
        </div>
        <Link href="/dashboard/locais/novo" className="btn-primary">
          <Plus aria-hidden size={18} />
          Sugerir local
        </Link>
      </div>

      <div className="mb-6 flex gap-3 rounded-lg border border-[#f7c873] bg-[#fff7df] p-4 text-[#6f4f00]">
        <AlertTriangle aria-hidden className="mt-0.5 shrink-0" size={20} />
        <p className="font-bold leading-6">{locationNotice}</p>
      </div>

      <section className="surface mb-8 grid gap-4 p-4 lg:grid-cols-[1.5fr_1fr_0.8fr_0.8fr_1fr]">
        <label className="label">
          Busca por nome, bairro ou cidade
          <span className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8c80]" aria-hidden size={18} />
            <input
              className="field pl-10"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ex.: emergência, centro, Curitiba"
            />
          </span>
        </label>
        <label className="label">
          Categoria
          <select className="field" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value={all}>Todas</option>
            {petServiceCategories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <Toggle label="Atendimento 24h" checked={only24h} onChange={setOnly24h} />
        <Toggle label="Emergência" checked={onlyEmergency} onChange={setOnlyEmergency} />
        <Toggle label="Gratuito/popular" checked={onlyAffordable} onChange={setOnlyAffordable} />
      </section>

      <section className="mb-7 rounded-lg border border-[#dbe6dc] bg-white p-4">
        <h2 className="flex items-center gap-2 text-lg font-black text-[#18392f]">
          <MapPin aria-hidden size={20} />
          Visualização rápida
        </h2>
        <p className="mt-2 leading-7 text-[#52665a]">
          O MVP prioriza dados revisáveis e botões de rota. Locais com latitude e longitude já ficam preparados para
          uma integração futura com Leaflet ou outro mapa gratuito.
        </p>
      </section>

      {filteredLocations.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredLocations.map((location) => (
            <PetLocationCard key={location.id} location={location} />
          ))}
        </div>
      ) : (
        <div className="surface p-8 text-center">
          <Filter aria-hidden className="mx-auto mb-3 text-[#0f766e]" size={34} />
          <h2 className="text-2xl font-black text-[#18392f]">
            {loading ? "Carregando locais..." : "Nenhum local encontrado com esses filtros."}
          </h2>
          <p className="mt-2 text-[#52665a]">
            {loading ? "Buscando dados do Mapa Pet." : "Tente limpar filtros ou sugerir um novo local para revisão."}
          </p>
        </div>
      )}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="label justify-end rounded-lg border border-[#dbe6dc] bg-white p-3">
      <span>{label}</span>
      <input className="h-5 w-5 accent-[#0f766e]" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
