"use client";

import { useState } from "react";
import { ImagePlus, Save } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const statusMap: Record<string, string> = {
  disponível: "disponivel",
  "em tratamento": "em_tratamento",
  adotado: "adotado",
  indisponível: "indisponivel",
};

export default function NewPetPage() {
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
      setMessage("Faça login como ONG/protetor para cadastrar pets.");
      setSaving(false);
      return;
    }

    const form = new FormData(event.currentTarget);
    const profileName = String(user.user_metadata?.name ?? "Responsável PetLar");
    const profileEmail = user.email ?? "";

    await supabase.from("profiles").upsert({
      id: user.id,
      name: profileName,
      email: profileEmail,
      role: "ong",
    });

    const organizationId = await ensureOrganization(supabase, user.id, profileName, profileEmail);

    if (!organizationId) {
      setMessage("Não foi possível criar ou localizar a organização do usuário.");
      setSaving(false);
      return;
    }

    const { data: pet, error: petError } = await supabase
      .from("pets")
      .insert({
        organization_id: organizationId,
        name: String(form.get("name")),
        species: String(form.get("species")),
        sex: String(form.get("sex")),
        approximate_age: String(form.get("approximate_age")),
        size: String(form.get("size")),
        breed: optionalString(form.get("breed")),
        city: String(form.get("city")),
        state: String(form.get("state")).toUpperCase(),
        description: String(form.get("description")),
        rescue_story: optionalString(form.get("rescue_story")),
        temperament: optionalString(form.get("temperament")),
        health_info: optionalString(form.get("health_info")),
        castrated: String(form.get("castrated")),
        vaccinated: String(form.get("vaccinated")),
        dewormed: String(form.get("dewormed")),
        good_with_kids: String(form.get("good_with_kids")),
        good_with_animals: String(form.get("good_with_animals")),
        status: statusMap[String(form.get("status"))] ?? "disponivel",
      })
      .select("id")
      .single();

    if (petError || !pet) {
      setMessage(petError?.message ?? "Não foi possível salvar o pet.");
      setSaving(false);
      return;
    }

    const files = form.getAll("images").filter((item): item is File => item instanceof File && item.size > 0);
    const imageRows = [];

    for (const [index, file] of files.entries()) {
      const extension = file.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/${pet.id}/${Date.now()}-${index}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("pet-images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (uploadError) {
        setMessage(`Pet salvo, mas uma imagem falhou: ${uploadError.message}`);
        continue;
      }

      const { data: publicUrl } = supabase.storage.from("pet-images").getPublicUrl(filePath);
      imageRows.push({
        pet_id: pet.id,
        image_url: publicUrl.publicUrl,
        is_main: index === 0,
      });
    }

    if (imageRows.length) {
      const { error: imageError } = await supabase.from("pet_images").insert(imageRows);
      if (imageError) {
        setMessage(`Pet salvo, mas as URLs das imagens não foram registradas: ${imageError.message}`);
        setSaving(false);
        return;
      }
    }

    event.currentTarget.reset();
    setMessage("Pet salvo no Supabase com imagens registradas.");
    setSaving(false);
  }

  return (
    <div className="container-page py-10">
      <div className="mb-7">
        <p className="text-sm font-black uppercase text-[#0f766e]">Cadastro de pet</p>
        <h1 className="mt-2 text-4xl font-black text-[#18392f]">Cadastrar novo pet</h1>
        <p className="mt-2 max-w-3xl leading-7 text-[#52665a]">
          Este formulário grava o pet no PostgreSQL do Supabase e envia as fotos
          para o bucket `pet-images`.
        </p>
      </div>
      <form className="surface grid gap-5 p-5 md:grid-cols-2" onSubmit={handleSubmit}>
        <Input name="name" label="Nome do pet" required />
        <Select name="species" label="Espécie" options={["cão", "gato", "outro"]} />
        <Select name="sex" label="Sexo" options={["fêmea", "macho"]} />
        <Input name="approximate_age" label="Idade aproximada" required placeholder="Ex.: 2 anos" />
        <Select name="size" label="Porte" options={["pequeno", "médio", "grande"]} />
        <Input name="breed" label="Raça" placeholder="Se houver" />
        <Input name="city" label="Cidade" required />
        <Input name="state" label="UF" required maxLength={2} />
        <Select name="castrated" label="Castrado" options={["sim", "não", "não informado"]} />
        <Select name="vaccinated" label="Vacinado" options={["sim", "não", "não informado"]} />
        <Select name="dewormed" label="Vermifugado" options={["sim", "não", "não informado"]} />
        <Select name="good_with_kids" label="Compatível com crianças" options={["sim", "não", "não informado"]} />
        <Select name="good_with_animals" label="Compatível com outros animais" options={["sim", "não", "não informado"]} />
        <Select name="status" label="Status" options={["disponível", "em tratamento", "adotado", "indisponível"]} />
        <TextArea name="description" label="Descrição" required placeholder="Resumo do perfil, rotina e necessidades do animal." />
        <TextArea name="rescue_story" label="História do resgate" placeholder="Conte de forma respeitosa, sem expor dados sensíveis." />
        <TextArea name="temperament" label="Temperamento" placeholder="Ex.: dócil, tímido, ativo, precisa de adaptação." />
        <TextArea name="health_info" label="Saúde" placeholder="Vacinas, tratamento, necessidades especiais e observações." />
        <label className="label md:col-span-2">
          Imagens do pet
          <span className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#9db7a8] bg-white p-5 text-center text-[#52665a]">
            <ImagePlus aria-hidden size={28} />
            <input className="field max-w-md" name="images" type="file" accept="image/*" multiple />
            <span className="text-sm">A primeira foto enviada será marcada como principal.</span>
          </span>
        </label>
        <button className="btn-primary md:col-span-2" disabled={saving}>
          <Save aria-hidden size={18} />
          {saving ? "Salvando..." : "Salvar pet"}
        </button>
      </form>
      {message && <p className="mt-5 rounded-lg bg-[#e4f5ef] p-4 font-bold text-[#0f5f57]">{message}</p>}
    </div>
  );
}

async function ensureOrganization(
  supabase: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
  userId: string,
  profileName: string,
  profileEmail: string,
) {
  const { data: existing } = await supabase
    .from("organizations")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data: organization } = await supabase
    .from("organizations")
    .insert({
      user_id: userId,
      name: profileName || "ONG/Protetor PetLar",
      type: "protetor_independente",
      description: "Perfil criado automaticamente pelo cadastro de pets do PetLar.",
      city: "Não informada",
      state: "BR",
      whatsapp: "",
      email: profileEmail,
      approved: true,
    })
    .select("id")
    .single();

  return organization?.id as string | undefined;
}

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text ? text : null;
}

function Input({ name, label, required = false, placeholder = "", maxLength }: { name: string; label: string; required?: boolean; placeholder?: string; maxLength?: number }) {
  return (
    <label className="label">
      {label}
      <input className="field" name={name} required={required} placeholder={placeholder} maxLength={maxLength} />
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

function TextArea({ name, label, required = false, placeholder = "" }: { name: string; label: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="label md:col-span-2">
      {label}
      <textarea className="field min-h-28" name={name} required={required} placeholder={placeholder} />
    </label>
  );
}
