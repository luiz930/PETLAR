"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera, Save, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ProfileState = {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  role: string;
  avatarUrl: string;
};

const emptyProfile: ProfileState = {
  name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  role: "adotante",
  avatarUrl: "",
};

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<ProfileState>(emptyProfile);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }

      setUserId(userData.user.id);
      const { data } = await supabase
        .from("profiles")
        .select("name, email, phone, city, state, role, avatar_url")
        .eq("id", userData.user.id)
        .maybeSingle();

      setProfile({
        name: String(data?.name ?? userData.user.user_metadata?.name ?? ""),
        email: String(data?.email ?? userData.user.email ?? ""),
        phone: String(data?.phone ?? ""),
        city: String(data?.city ?? ""),
        state: String(data?.state ?? ""),
        role: String(data?.role ?? userData.user.user_metadata?.role ?? "adotante"),
        avatarUrl: String(data?.avatar_url ?? ""),
      });
      setLoading(false);
    }

    void loadProfile();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase || !userId) {
      setMessage("Faça login para editar o perfil.");
      setSaving(false);
      return;
    }

    const form = new FormData(event.currentTarget);
    let avatarUrl = profile.avatarUrl;
    const avatarFile = form.get("avatar");

    if (avatarFile instanceof File && avatarFile.size > 0) {
      const extension = avatarFile.name.split(".").pop() || "jpg";
      const filePath = `${userId}/avatar-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-avatars")
        .upload(filePath, avatarFile, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        setMessage(uploadError.message);
        setSaving(false);
        return;
      }

      const { data: publicUrl } = supabase.storage.from("profile-avatars").getPublicUrl(filePath);
      avatarUrl = publicUrl.publicUrl;
    }

    const nextProfile = {
      id: userId,
      name: String(form.get("name")),
      email: profile.email,
      role: profile.role,
      phone: String(form.get("phone")),
      city: String(form.get("city")),
      state: String(form.get("state")).toUpperCase(),
      avatar_url: avatarUrl || null,
    };

    const { error } = await supabase.from("profiles").upsert(nextProfile);
    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setProfile((current) => ({
      ...current,
      name: nextProfile.name,
      phone: nextProfile.phone,
      city: nextProfile.city,
      state: nextProfile.state,
      avatarUrl,
    }));
    setMessage("Perfil atualizado com sucesso. Recarregue a página para ver a foto no topo.");
  }

  async function deleteAccount() {
    const confirmed = window.confirm(
      "Tem certeza que deseja deletar sua conta? Esta ação remove seu usuário, perfil, pets cadastrados, fotos, pedidos e dados ligados à conta. Não será possível desfazer.",
    );

    if (!confirmed) return;

    setDeleting(true);
    setMessage("");

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Sessão não encontrada.");
      setDeleting(false);
      return;
    }

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      setMessage("Faça login novamente para deletar a conta.");
      setDeleting(false);
      return;
    }

    const response = await fetch("/api/conta/deletar", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(payload?.error ?? "Não foi possível deletar a conta.");
      setDeleting(false);
      return;
    }

    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="surface p-8 text-center font-bold text-[#52665a]">Carregando configurações...</div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="container-page py-10">
        <div className="surface p-8 text-center">
          <h1 className="text-3xl font-black text-[#18392f]">Faça login para editar seu perfil</h1>
          <Link href="/login" className="btn-primary mt-5">
            Entrar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="mb-7">
        <p className="text-sm font-black uppercase text-[#0f766e]">Configurações</p>
        <h1 className="mt-2 text-4xl font-black text-[#18392f]">Meu perfil</h1>
        <p className="mt-2 max-w-3xl leading-7 text-[#52665a]">
          Atualize seus dados básicos e a foto que aparece no topo quando você está logado.
        </p>
      </div>

      <form className="surface grid gap-6 p-5 lg:grid-cols-[280px_1fr]" onSubmit={handleSubmit}>
        <section className="grid h-fit justify-items-center gap-4 rounded-lg bg-[#f4f1e8] p-5 text-center">
          <div className="relative grid h-40 w-40 place-items-center overflow-hidden rounded-lg bg-white text-[#0f766e] ring-1 ring-[#dbe6dc]">
            {profile.avatarUrl ? (
              <Image src={profile.avatarUrl} alt={`Foto de ${profile.name}`} fill sizes="160px" className="object-cover" />
            ) : (
              <UserRound aria-hidden size={72} />
            )}
          </div>
          <label className="btn-secondary w-full cursor-pointer">
            <Camera aria-hidden size={18} />
            Escolher foto
            <input className="sr-only" name="avatar" type="file" accept="image/*" />
          </label>
          <p className="text-sm font-semibold leading-6 text-[#52665a]">
            Use uma imagem clara. Arquivos são enviados para o bucket `profile-avatars`.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <label className="label">
            Nome
            <input className="field" name="name" defaultValue={profile.name} required />
          </label>
          <label className="label">
            E-mail
            <input className="field bg-[#f4f1e8]" value={profile.email} readOnly />
          </label>
          <label className="label">
            WhatsApp
            <input className="field" name="phone" defaultValue={profile.phone} placeholder="Ex.: 5511999990000" />
          </label>
          <label className="label">
            Perfil
            <input className="field bg-[#f4f1e8]" value={profile.role} readOnly />
          </label>
          <label className="label">
            Cidade
            <input className="field" name="city" defaultValue={profile.city} />
          </label>
          <label className="label">
            UF
            <input className="field" name="state" defaultValue={profile.state} maxLength={2} />
          </label>
          <button className="btn-primary md:col-span-2" disabled={saving}>
            <Save aria-hidden size={18} />
            {saving ? "Salvando..." : "Salvar configurações"}
          </button>
          {message && (
            <p className="rounded-lg bg-[#e4f5ef] p-4 text-sm font-bold text-[#0f5f57] md:col-span-2">
              {message}
            </p>
          )}
        </section>
      </form>

      <section className="surface mt-6 border-[#f3b1a8] bg-[#fff7f5] p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-black text-[#8f2f24]">Deletar conta</h2>
            <p className="mt-2 max-w-3xl leading-7 text-[#70413b]">
              Remove sua conta, perfil, dados cadastrados, pets vinculados, fotos
              enviadas, pedidos de adoção e registros de lar temporário ligados ao usuário.
            </p>
          </div>
          <button className="btn-secondary border-[#d75a4a] text-[#8f2f24]" type="button" onClick={deleteAccount} disabled={deleting}>
            <Trash2 aria-hidden size={18} />
            {deleting ? "Deletando..." : "Deletar conta"}
          </button>
        </div>
      </section>
    </div>
  );
}
