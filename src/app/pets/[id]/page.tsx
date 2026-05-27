"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, HeartHandshake, MapPin, ShieldCheck } from "lucide-react";
import { statusLabels, type Pet } from "@/data/domain";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mapSupabasePet, petSelectQuery, type SupabasePetRow } from "@/lib/pet-mapper";

export default function PetDetailsPage() {
  const params = useParams<{ id: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPet() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("pets")
        .select(petSelectQuery)
        .eq("id", params.id)
        .maybeSingle();

      if (!error && data) {
        setPet(mapSupabasePet(data as SupabasePetRow));
      }
      setLoading(false);
    }

    void loadPet();
  }, [params.id]);

  if (!pet) {
    return (
      <div className="container-page py-16">
        <div className="surface p-8 text-center">
          <h1 className="text-3xl font-black text-[#18392f]">
            {loading ? "Carregando pet..." : "Pet não encontrado"}
          </h1>
          <Link href="/pets" className="btn-primary mt-5">
            Voltar para pets
          </Link>
        </div>
      </div>
    );
  }

  const checks = [
    ["Castrado", pet.castrated],
    ["Vacinado", pet.vaccinated],
    ["Vermifugado", pet.dewormed],
    ["Compatível com crianças", pet.goodWithKids],
    ["Compatível com outros animais", pet.goodWithAnimals],
  ];

  return (
    <div className="container-page py-10">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="grid gap-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#e7efe8]">
            <Image src={pet.images[0]} alt={`Foto principal de ${pet.name}`} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {pet.images.slice(1).map((image) => (
              <div key={image} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#e7efe8]">
                <Image src={image} alt={`Foto adicional de ${pet.name}`} fill sizes="50vw" className="object-cover" />
              </div>
            ))}
          </div>
        </section>

        <section>
          <span className="badge bg-[#e4f5ef] text-[#0f766e]">{statusLabels[pet.status]}</span>
          <h1 className="mt-4 text-5xl font-black text-[#18392f]">{pet.name}</h1>
          <p className="mt-3 flex items-center gap-2 font-bold text-[#52665a]">
            <MapPin aria-hidden size={18} />
            {pet.city}/{pet.state} · {pet.species} · {pet.sex} · {pet.approximateAge}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Info label="Porte" value={pet.size} />
            <Info label="Raça" value={pet.breed || "Não informada"} />
            <Info label="Responsável" value={pet.organizationName} />
            <Info label="Status" value={statusLabels[pet.status]} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href={`/interesse/${pet.id}`} className="btn-primary">
              <HeartHandshake aria-hidden size={19} />
              Tenho interesse em adotar
            </Link>
            <Link href="/adocao-responsavel" className="btn-secondary">
              <ShieldCheck aria-hidden size={19} />
              Ler adoção responsável
            </Link>
          </div>
        </section>
      </div>

      <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="surface grid gap-5 p-6">
          <Block title="Descrição" text={pet.description} />
          <Block title="História do resgate" text={pet.rescueStory} />
          <Block title="Temperamento" text={pet.temperament} />
          <Block title="Informações de saúde" text={pet.healthInfo} />
        </div>
        <aside className="surface h-fit p-6">
          <h2 className="text-2xl font-black text-[#18392f]">Condições informadas</h2>
          <div className="mt-5 grid gap-3">
            {checks.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3 rounded-lg bg-[#f4f1e8] p-3">
                <span className="flex items-center gap-2 font-bold text-[#263b31]">
                  <CheckCircle2 aria-hidden size={18} className="text-[#0f766e]" />
                  {label}
                </span>
                <span className="font-black capitalize text-[#18392f]">{value}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-[#dbe6dc]">
      <dt className="text-xs font-black uppercase text-[#6c7a70]">{label}</dt>
      <dd className="mt-1 font-bold capitalize text-[#263b31]">{value}</dd>
    </div>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-2xl font-black text-[#18392f]">{title}</h2>
      <p className="mt-2 leading-7 text-[#52665a]">{text}</p>
    </div>
  );
}
