"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, Clock, ExternalLink, MapPin, MessageCircle, Phone } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getCategoryLabel,
  getFullAddress,
  getGoogleMapsUrl,
  getTelUrl,
  getWhatsappUrl,
  locationNotice,
  mapSupabaseLocation,
  mockPetServiceLocations,
  petServiceLocationSelectQuery,
  rescuedAnimalsLabels,
  serviceTypeLabels,
  type PetServiceLocation,
  type SupabasePetServiceLocationRow,
} from "@/lib/pet-service-locations";

export default function MapaPetDetailsPage() {
  const params = useParams<{ id: string }>();
  const [location, setLocation] = useState<PetServiceLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLocation() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setLocation(mockPetServiceLocations.find((item) => item.id === params.id) ?? null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("pet_service_locations")
        .select(petServiceLocationSelectQuery)
        .eq("id", params.id)
        .eq("status", "ativo")
        .maybeSingle();

      if (!error && data) {
        setLocation(mapSupabaseLocation(data as SupabasePetServiceLocationRow));
      } else {
        setLocation(mockPetServiceLocations.find((item) => item.id === params.id) ?? null);
      }
      setLoading(false);
    }

    void loadLocation();
  }, [params.id]);

  if (!location) {
    return (
      <div className="container-page py-16">
        <div className="surface p-8 text-center">
          <h1 className="text-3xl font-black text-[#18392f]">
            {loading ? "Carregando local..." : "Local não encontrado"}
          </h1>
          <Link href="/mapa-pet" className="btn-primary mt-5">
            Voltar ao Mapa Pet
          </Link>
        </div>
      </div>
    );
  }

  const whatsappUrl = getWhatsappUrl(location.whatsapp);
  const phoneUrl = getTelUrl(location.phone);

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex gap-3 rounded-lg border border-[#f7c873] bg-[#fff7df] p-4 text-[#6f4f00]">
        <AlertTriangle aria-hidden className="mt-0.5 shrink-0" size={20} />
        <p className="font-bold leading-6">{locationNotice}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr]">
        <section className="surface p-6">
          <span className="badge bg-[#e4f5ef] text-[#0f766e]">{getCategoryLabel(location.category)}</span>
          <h1 className="mt-4 text-4xl font-black text-[#18392f]">{location.name}</h1>
          <p className="mt-3 flex gap-2 font-bold text-[#52665a]">
            <MapPin aria-hidden className="mt-0.5 shrink-0" size={18} />
            {getFullAddress(location)}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Info label="Cidade/UF" value={`${location.city}/${location.state}`} />
            <Info label="Telefone" value={location.phone || "Não informado"} />
            <Info label="WhatsApp" value={location.whatsapp || "Não informado"} />
            <Info label="Horário" value={location.openingHours || "Não informado"} />
            <Info label="Atende emergência" value={location.hasEmergency ? "Sim" : "Não"} />
            <Info label="Atendimento 24h" value={location.is24h ? "Sim" : "Não"} />
            <Info label="Animais resgatados" value={rescuedAnimalsLabels[location.helpsRescuedAnimals]} />
            <Info label="Tipo de atendimento" value={serviceTypeLabels[location.serviceType]} />
          </div>

          {location.description && <Block title="Descrição" text={location.description} />}
          {location.notes && <Block title="Observações" text={location.notes} />}
        </section>

        <aside className="surface h-fit p-6">
          <h2 className="text-2xl font-black text-[#18392f]">Contato e rota</h2>
          <p className="mt-2 leading-7 text-[#52665a]">
            Confirme atendimento, valores e disponibilidade diretamente com o local antes de se deslocar.
          </p>
          <div className="mt-5 grid gap-3">
            <a className="btn-primary" href={getGoogleMapsUrl(location)} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden size={18} />
              Abrir rota no Google Maps
            </a>
            {whatsappUrl && (
              <a className="btn-secondary" href={whatsappUrl} target="_blank" rel="noreferrer">
                <MessageCircle aria-hidden size={18} />
                Contato por WhatsApp
              </a>
            )}
            {phoneUrl && (
              <a className="btn-secondary" href={phoneUrl}>
                <Phone aria-hidden size={18} />
                Ligar
              </a>
            )}
            <p className="mt-2 flex items-center gap-2 text-sm font-bold text-[#52665a]">
              <Clock aria-hidden size={16} />
              {location.openingHours || "Horário não informado"}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-[#dbe6dc]">
      <dt className="text-xs font-black uppercase text-[#6c7a70]">{label}</dt>
      <dd className="mt-1 font-bold text-[#263b31]">{value}</dd>
    </div>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-6">
      <h2 className="text-2xl font-black text-[#18392f]">{title}</h2>
      <p className="mt-2 leading-7 text-[#52665a]">{text}</p>
    </div>
  );
}
