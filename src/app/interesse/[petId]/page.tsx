"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Send, ShieldCheck } from "lucide-react";
import { type Pet } from "@/data/domain";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mapSupabasePet, petSelectQuery, type SupabasePetRow } from "@/lib/pet-mapper";

const booleanOptions = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

export default function AdoptionInterestPage() {
  const params = useParams<{ petId: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPet() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("pets")
        .select(petSelectQuery)
        .eq("id", params.petId)
        .maybeSingle();

      if (data) setPet(mapSupabasePet(data as SupabasePetRow));
      setLoading(false);
    }

    void loadPet();
  }, [params.petId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase não configurado.");
      setSaving(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setMessage("Faça login para enviar interesse de adoção.");
      setSaving(false);
      return;
    }

    if (!isUuid(params.petId)) {
      setMessage("Pet inválido ou indisponível para envio de formulário.");
      setSaving(false);
      return;
    }

    const form = new FormData(event.currentTarget);
    const row = {
      pet_id: params.petId,
      adopter_id: user.id,
      full_name: String(form.get("full_name")),
      email: String(form.get("email")),
      whatsapp: String(form.get("whatsapp")),
      city: String(form.get("city")),
      neighborhood: String(form.get("neighborhood")),
      housing_type: String(form.get("housing_type")),
      housing_status: String(form.get("housing_status")),
      household_agrees: String(form.get("household_agrees")) === "Sim",
      has_other_pets: String(form.get("has_other_pets")) === "Sim",
      current_pets_castrated_vaccinated: String(form.get("current_pets_castrated_vaccinated")),
      had_pet_before: String(form.get("had_pet_before")) === "Sim",
      pet_access_to_street: String(form.get("pet_access_to_street")),
      hours_alone_per_day: String(form.get("hours_alone_per_day")),
      can_afford_vet: String(form.get("can_afford_vet")) === "Sim",
      reason_to_adopt: String(form.get("reason_to_adopt")),
      long_term_responsibility: true,
      consent_lgpd: form.get("consent_lgpd") === "on",
      status: "enviado",
    };

    const { error } = await supabase.from("adoption_applications").insert(row);
    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setSubmitted(true);
    setMessage("Formulário salvo no Supabase.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!pet) {
    return (
      <div className="container-page py-16">
        <div className="surface p-8 text-center">
          <h1 className="text-3xl font-black text-[#18392f]">
            {loading ? "Carregando pet..." : "Pet não encontrado"}
          </h1>
          <Link className="btn-primary mt-5" href="/pets">
            Voltar para pets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="mb-7 grid gap-2">
        <p className="text-sm font-black uppercase text-[#0f766e]">Interesse de adoção</p>
        <h1 className="text-4xl font-black text-[#18392f]">Formulário para adotar {pet.name}</h1>
        <p className="max-w-4xl leading-7 text-[#52665a]">
          Responda com sinceridade. Estes dados são usados apenas para análise
          inicial do interesse de adoção e contato com o responsável pelo animal.
        </p>
      </div>

      <div className="mb-6 flex gap-3 rounded-lg border border-[#f6d58c] bg-[#fef0d6] p-4 text-[#704214]">
        <ShieldCheck aria-hidden className="shrink-0" size={24} />
        <p className="text-sm font-bold leading-6">
          Não pedimos CPF nem endereço completo no PetLar. A avaliação final deve
          ser conduzida pela ONG/protetor com responsabilidade e, quando adequado,
          de forma presencial.
        </p>
      </div>

      <form
        className="surface grid gap-5 p-5 md:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <Input name="full_name" label="Nome completo" required />
        <Input name="email" label="E-mail" type="email" required />
        <Input name="whatsapp" label="WhatsApp" required />
        <Input name="city" label="Cidade" required />
        <Input name="neighborhood" label="Bairro" required />
        <Select name="housing_type" label="Mora em casa ou apartamento?" options={["Casa", "Apartamento"]} />
        <Select name="housing_status" label="A residência é própria ou alugada?" options={["Própria", "Alugada", "Outro"]} />
        <Select name="household_agrees" label="Todos da casa concordam com a adoção?" options={booleanOptions.map((item) => item.label)} />
        <Select name="has_other_pets" label="Tem outros animais?" options={booleanOptions.map((item) => item.label)} />
        <Input name="current_pets_castrated_vaccinated" label="Os animais atuais são castrados/vacinados?" placeholder="Ex.: sim, todos vacinados" />
        <Select name="had_pet_before" label="Já teve pet antes?" options={booleanOptions.map((item) => item.label)} />
        <Input name="pet_access_to_street" label="O animal teria acesso à rua?" placeholder="Ex.: não, apenas passeios com guia" required />
        <Input name="hours_alone_per_day" label="Quantas horas por dia ficaria sozinho?" placeholder="Ex.: 4 horas" required />
        <Select name="can_afford_vet" label="Tem condições de levar ao veterinário?" options={booleanOptions.map((item) => item.label)} />
        <label className="label md:col-span-2">
          Por que deseja adotar este pet?
          <textarea className="field min-h-32" name="reason_to_adopt" required placeholder="Conte sobre sua motivação, rotina e expectativas." />
        </label>
        <Select name="long_term_responsibility" label="Está ciente de que adoção é responsabilidade de longo prazo?" options={["Sim, estou ciente"]} />
        <label className="md:col-span-2 flex items-start gap-3 rounded-lg bg-[#f4f1e8] p-4 text-sm font-bold text-[#263b31]">
          <input className="mt-1 h-5 w-5 accent-[#0f766e]" name="consent_lgpd" type="checkbox" required />
          Confirmo que as informações fornecidas são verdadeiras e autorizo o uso
          dos meus dados apenas para análise do interesse de adoção e contato com
          o responsável pelo animal.
        </label>
        <button className="btn-primary md:col-span-2" disabled={saving}>
          <Send aria-hidden size={18} />
          {saving ? "Enviando..." : "Enviar interesse"}
        </button>
      </form>

      {(submitted || message) && (
        <div className="mt-6 rounded-lg border border-[#b7dfc8] bg-[#e4f5ef] p-4 font-bold text-[#0f5f57]">
          {message}
        </div>
      )}
    </div>
  );
}

function Input({ name, label, type = "text", required = false, placeholder = "" }: { name: string; label: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="label">
      {label}
      <input className="field" name={name} type={type} required={required} placeholder={placeholder} />
    </label>
  );
}

function Select({ name, label, options }: { name: string; label: string; options: string[] }) {
  return (
    <label className="label">
      {label}
      <select className="field" name={name} required>
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
