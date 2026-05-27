"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type PetEditState = {
  name: string;
  species: string;
  sex: string;
  approximate_age: string;
  size: string;
  breed: string;
  city: string;
  state: string;
  description: string;
};

const emptyPet: PetEditState = {
  name: "",
  species: "",
  sex: "",
  approximate_age: "",
  size: "",
  breed: "",
  city: "",
  state: "",
  description: "",
};

export default function EditPetPage() {
  const params = useParams<{ id: string }>();
  const [pet, setPet] = useState<PetEditState>(emptyPet);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPet() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("pets")
        .select("name, species, sex, approximate_age, size, breed, city, state, description")
        .eq("id", params.id)
        .maybeSingle();

      if (data) {
        setPet({
          name: String(data.name ?? ""),
          species: String(data.species ?? ""),
          sex: String(data.sex ?? ""),
          approximate_age: String(data.approximate_age ?? ""),
          size: String(data.size ?? ""),
          breed: String(data.breed ?? ""),
          city: String(data.city ?? ""),
          state: String(data.state ?? ""),
          description: String(data.description ?? ""),
        });
      }
      setLoading(false);
    }

    void loadPet();
  }, [params.id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase não configurado.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const { error } = await supabase
      .from("pets")
      .update({
        name: String(form.get("name")),
        species: String(form.get("species")),
        sex: String(form.get("sex")),
        approximate_age: String(form.get("approximate_age")),
        size: String(form.get("size")),
        breed: String(form.get("breed") ?? ""),
        city: String(form.get("city")),
        state: String(form.get("state")).toUpperCase(),
        description: String(form.get("description")),
      })
      .eq("id", params.id);

    setMessage(error ? error.message : "Alterações salvas no Supabase.");
  }

  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="surface p-8 text-center font-bold text-[#52665a]">Carregando pet...</div>
      </div>
    );
  }

  if (!pet.name) {
    return (
      <div className="container-page py-16">
        <div className="surface p-8 text-center">
          <h1 className="text-3xl font-black text-[#18392f]">Pet não encontrado</h1>
          <Link href="/dashboard/ong" className="btn-primary mt-5">
            Voltar ao painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="mb-7">
        <p className="text-sm font-black uppercase text-[#0f766e]">Editar pet</p>
        <h1 className="mt-2 text-4xl font-black text-[#18392f]">Editar {pet.name}</h1>
      </div>
      <form className="surface grid gap-5 p-5 md:grid-cols-2" onSubmit={handleSubmit}>
        <Input name="name" label="Nome do pet" defaultValue={pet.name} />
        <Input name="species" label="Espécie" defaultValue={pet.species} />
        <Input name="sex" label="Sexo" defaultValue={pet.sex} />
        <Input name="approximate_age" label="Idade aproximada" defaultValue={pet.approximate_age} />
        <Input name="size" label="Porte" defaultValue={pet.size} />
        <Input name="breed" label="Raça" defaultValue={pet.breed} />
        <Input name="city" label="Cidade" defaultValue={pet.city} />
        <Input name="state" label="UF" defaultValue={pet.state} />
        <label className="label md:col-span-2">
          Descrição
          <textarea className="field min-h-28" name="description" defaultValue={pet.description} />
        </label>
        <button className="btn-primary md:col-span-2">
          <Save aria-hidden size={18} />
          Salvar alterações
        </button>
      </form>
      {message && <p className="mt-5 rounded-lg bg-[#e4f5ef] p-4 font-bold text-[#0f5f57]">{message}</p>}
    </div>
  );
}

function Input({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="label">
      {label}
      <input className="field" name={name} defaultValue={defaultValue} />
    </label>
  );
}
