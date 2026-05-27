"use client";

import { useState } from "react";
import { Home, Send } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function TemporaryHomePage() {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

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
      setMessage("Faça login para cadastrar lar temporário.");
      setSaving(false);
      return;
    }

    const form = new FormData(event.currentTarget);
    const { error } = await supabase.from("temporary_homes").insert({
      user_id: user.id,
      full_name: String(form.get("full_name")),
      email: String(form.get("email")),
      whatsapp: String(form.get("whatsapp")),
      city: String(form.get("city")),
      neighborhood: String(form.get("neighborhood")),
      animal_type: String(form.get("animal_type")),
      accepted_size: String(form.get("accepted_size")),
      quantity_available: Number(form.get("quantity_available") || 1),
      available_period: String(form.get("available_period")),
      has_other_pets: String(form.get("has_other_pets")) === "Sim",
      notes: String(form.get("notes") ?? ""),
      consent_lgpd: form.get("consent_lgpd") === "on",
    });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    event.currentTarget.reset();
    setSubmitted(true);
    setMessage("Cadastro de lar temporário salvo no Supabase.");
  }

  return (
    <div className="container-page py-10">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <section>
          <span className="badge bg-[#e4f5ef] text-[#0f766e]">
            <Home aria-hidden size={16} />
            Voluntariado
          </span>
          <h1 className="mt-4 text-4xl font-black text-[#18392f]">Quero ser lar temporário</h1>
          <p className="mt-4 leading-7 text-[#52665a]">
            Lares temporários ajudam animais resgatados a aguardarem adoção em
            ambiente seguro. Cadastre sua disponibilidade para que ONGs e protetores
            possam avaliar o contato.
          </p>
          <div className="mt-5 rounded-lg bg-[#fef0d6] p-4 text-sm font-bold leading-6 text-[#704214]">
            Informe apenas dados necessários para contato e triagem inicial. Não
            inclua endereço completo neste formulário.
          </div>
        </section>

        <form
          className="surface grid gap-4 p-5 md:grid-cols-2"
          onSubmit={handleSubmit}
        >
          <Input name="full_name" label="Nome" required />
          <Input name="email" label="E-mail" type="email" required />
          <Input name="whatsapp" label="WhatsApp" required />
          <Input name="city" label="Cidade" required />
          <Input name="neighborhood" label="Bairro" required />
          <Select name="animal_type" label="Tipo de animal que pode acolher" options={["Cão", "Gato", "Ambos"]} />
          <Select name="accepted_size" label="Porte aceito" options={["Pequeno", "Médio", "Grande", "Qualquer porte"]} />
          <Input name="quantity_available" label="Quantidade de animais" type="number" required />
          <Input name="available_period" label="Tempo disponível" placeholder="Ex.: 30 dias, 3 meses, indefinido" required />
          <Select name="has_other_pets" label="Possui outros animais?" options={["Sim", "Não"]} />
          <label className="label md:col-span-2">
            Observações
            <textarea className="field min-h-28" name="notes" placeholder="Rotina, limitações, experiência e cuidados possíveis." />
          </label>
          <label className="md:col-span-2 flex items-start gap-3 rounded-lg bg-[#f4f1e8] p-4 text-sm font-bold text-[#263b31]">
            <input className="mt-1 h-5 w-5 accent-[#0f766e]" name="consent_lgpd" type="checkbox" required />
            Autorizo o uso dos meus dados apenas para análise do voluntariado e
            contato por ONGs/protetores cadastrados.
          </label>
          <button className="btn-primary md:col-span-2" disabled={saving}>
            <Send aria-hidden size={18} />
            {saving ? "Enviando..." : "Enviar cadastro de lar temporário"}
          </button>
          {(submitted || message) && (
            <p className="md:col-span-2 rounded-lg bg-[#e4f5ef] p-3 text-sm font-bold text-[#0f5f57]">
              {message}
            </p>
          )}
        </form>
      </div>
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
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
