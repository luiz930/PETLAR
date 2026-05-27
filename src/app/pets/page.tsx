"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { PetCard } from "@/components/pet-card";
import { statusLabels, type Pet, type PetStatus } from "@/data/domain";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mapSupabasePet, petSelectQuery, type SupabasePetRow } from "@/lib/pet-mapper";

const all = "todos";

export default function PetsPage() {
  const [species, setSpecies] = useState(all);
  const [size, setSize] = useState(all);
  const [sex, setSex] = useState(all);
  const [city, setCity] = useState("");
  const [status, setStatus] = useState(all);
  const [search, setSearch] = useState("");
  const [sourcePets, setSourcePets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPets() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("pets")
        .select(petSelectQuery)
        .order("created_at", { ascending: false });

      if (!error && data?.length) {
        setSourcePets((data as SupabasePetRow[]).map(mapSupabasePet));
      }
      setLoading(false);
    }

    void loadPets();
  }, []);

  const cities = Array.from(new Set(sourcePets.map((pet) => pet.city))).sort();

  const pets = sourcePets.filter((pet) => {
    const matchSpecies = species === all || pet.species === species;
    const matchSize = size === all || pet.size === size;
    const matchSex = sex === all || pet.sex === sex;
    const matchCity = !city || pet.city === city;
    const matchStatus = status === all || pet.status === status;
    const matchSearch = pet.name.toLowerCase().includes(search.toLowerCase().trim());

    return matchSpecies && matchSize && matchSex && matchCity && matchStatus && matchSearch;
  });

  return (
    <div className="container-page py-10">
      <div className="mb-8 grid gap-3">
        <p className="text-sm font-black uppercase text-[#0f766e]">Quero adotar</p>
        <h1 className="text-4xl font-black text-[#18392f]">Pets disponíveis para adoção</h1>
        <p className="max-w-3xl leading-7 text-[#52665a]">
          Use os filtros para encontrar animais divulgados por ONGs e protetores.
          Para enviar interesse de adoção, crie uma conta ou faça login.
        </p>
      </div>

      <section className="surface mb-8 grid gap-4 p-4 md:grid-cols-3 lg:grid-cols-6">
        <label className="label md:col-span-2 lg:col-span-2">
          Busca por nome
          <span className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8c80]" aria-hidden size={18} />
            <input
              className="field pl-10"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome do pet"
            />
          </span>
        </label>
        <Select label="Espécie" value={species} onChange={setSpecies} options={[all, "cão", "gato", "outro"]} />
        <Select label="Porte" value={size} onChange={setSize} options={[all, "pequeno", "médio", "grande"]} />
        <Select label="Sexo" value={sex} onChange={setSex} options={[all, "fêmea", "macho"]} />
        <label className="label">
          Cidade
          <select className="field" value={city} onChange={(event) => setCity(event.target.value)}>
            <option value="">Todas</option>
            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="label md:col-span-2 lg:col-span-1">
          Status
          <select className="field" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value={all}>Todos</option>
            {(Object.keys(statusLabels) as PetStatus[]).map((key) => (
              <option key={key} value={key}>
                {statusLabels[key]}
              </option>
            ))}
          </select>
        </label>
      </section>

      {pets.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      ) : (
        <div className="surface p-8 text-center">
          <h2 className="text-2xl font-black text-[#18392f]">
            {loading ? "Carregando pets..." : "Nenhum pet cadastrado ainda"}
          </h2>
          <p className="mt-2 text-[#52665a]">
            {loading ? "Buscando dados no Supabase." : "Quando uma ONG/protetor cadastrar um pet, ele aparecerá aqui."}
          </p>
        </div>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="label">
      {label}
      <select className="field capitalize" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option === all ? "Todos" : option}
          </option>
        ))}
      </select>
    </label>
  );
}
