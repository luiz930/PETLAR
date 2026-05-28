"use client";

import { useState } from "react";
import Link from "next/link";
import { Save } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { petServiceCategories } from "@/lib/pet-service-locations";

export default function NewLocationSuggestionPage() {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Supabase não configurado. O formulário está pronto, mas a sugestão ainda não foi gravada.");
      setSaving(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setMessage("Faça login para sugerir um local para revisão.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("pet_service_locations").insert({
      name: text(form, "name"),
      category: text(form, "category"),
      address: text(form, "address"),
      city: text(form, "city"),
      state: text(form, "state").toUpperCase(),
      neighborhood: optionalText(form, "neighborhood"),
      phone: optionalText(form, "phone"),
      whatsapp: optionalText(form, "whatsapp"),
      opening_hours: optionalText(form, "opening_hours"),
      is_24h: form.get("is_24h") === "on",
      has_emergency: form.get("has_emergency") === "on",
      notes: optionalText(form, "notes"),
      source_info: optionalText(form, "source_info"),
      helps_rescued_animals: "nao_informado",
      service_type: "nao_informado",
      status: "pendente",
      suggested_by: user.id,
    });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    formElement.reset();
    setMessage("Local sugerido com sucesso. Ele ficará pendente até revisão da administração.");
    setSaving(false);
  }

  return (
    <div className="container-page py-10">
      <div className="mb-7">
        <p className="text-sm font-black uppercase text-[#0f766e]">Mapa Pet</p>
        <h1 className="mt-2 text-4xl font-black text-[#18392f]">Sugerir novo local</h1>
        <p className="mt-2 max-w-3xl leading-7 text-[#52665a]">
          Sugestões entram como pendentes de revisão. A administração valida informações antes de exibir publicamente.
        </p>
      </div>

      <form className="surface grid gap-5 p-5 md:grid-cols-2" onSubmit={handleSubmit}>
        <Input name="name" label="Nome do local" required />
        <label className="label">
          Categoria
          <select className="field" name="category" required>
            <option value="">Selecione</option>
            {petServiceCategories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <Input name="address" label="Endereço" required />
        <Input name="neighborhood" label="Bairro" />
        <Input name="city" label="Cidade" required />
        <Input name="state" label="Estado/UF" required maxLength={2} />
        <Input name="phone" label="Telefone" />
        <Input name="whatsapp" label="WhatsApp" />
        <Input name="opening_hours" label="Horário" />
        <Input name="source_info" label="Fonte da informação" placeholder="Ex.: site oficial, ligação, indicação" />
        <Checkbox name="is_24h" label="É 24h?" />
        <Checkbox name="has_emergency" label="Atende emergência?" />
        <TextArea name="notes" label="Observações" />
        <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
          <button className="btn-primary" disabled={saving}>
            <Save aria-hidden size={18} />
            {saving ? "Enviando..." : "Enviar sugestão"}
          </button>
          <Link className="btn-secondary" href="/mapa-pet">
            Voltar ao Mapa Pet
          </Link>
        </div>
      </form>

      {message && <p className="mt-5 rounded-lg bg-[#e4f5ef] p-4 font-bold text-[#0f5f57]">{message}</p>}
    </div>
  );
}

function text(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

function optionalText(form: FormData, name: string) {
  const value = text(form, name);
  return value ? value : null;
}

function Input({
  name,
  label,
  required = false,
  placeholder = "",
  maxLength,
}: {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="label">
      {label}
      <input className="field" name={name} required={required} placeholder={placeholder} maxLength={maxLength} />
    </label>
  );
}

function Checkbox({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-[#dbe6dc] bg-white p-3 font-bold text-[#263b31]">
      <input className="h-5 w-5 accent-[#0f766e]" name={name} type="checkbox" />
      {label}
    </label>
  );
}

function TextArea({ name, label }: { name: string; label: string }) {
  return (
    <label className="label md:col-span-2">
      {label}
      <textarea className="field min-h-28" name={name} />
    </label>
  );
}
