import Link from "next/link";
import { Clock, ExternalLink, MapPin, MessageCircle, Phone } from "lucide-react";
import {
  getCategoryLabel,
  getFullAddress,
  getGoogleMapsUrl,
  getTelUrl,
  getWhatsappUrl,
  isFreeOrPopular,
  serviceTypeLabels,
  type PetServiceLocation,
} from "@/lib/pet-service-locations";

export function PetLocationCard({ location }: { location: PetServiceLocation }) {
  const whatsappUrl = getWhatsappUrl(location.whatsapp);
  const phoneUrl = getTelUrl(location.phone);

  return (
    <article className="surface flex h-full flex-col p-5">
      <div className="flex flex-wrap gap-2">
        <span className="badge bg-[#e4f5ef] text-[#0f766e]">{getCategoryLabel(location.category)}</span>
        {location.is24h && <span className="badge bg-[#172554] text-white">24h</span>}
        {location.hasEmergency && <span className="badge bg-[#fee2e2] text-[#991b1b]">Emergência</span>}
        {isFreeOrPopular(location.serviceType) && (
          <span className="badge bg-[#fff7ed] text-[#9a3412]">{serviceTypeLabels[location.serviceType]}</span>
        )}
      </div>

      <h2 className="mt-4 text-2xl font-black text-[#18392f]">{location.name}</h2>
      {location.description && <p className="mt-2 leading-7 text-[#52665a]">{location.description}</p>}

      <div className="mt-4 grid gap-3 text-sm font-semibold text-[#3d5548]">
        <p className="flex gap-2">
          <MapPin aria-hidden className="mt-0.5 shrink-0 text-[#0f766e]" size={18} />
          <span>{getFullAddress(location)}</span>
        </p>
        {location.openingHours && (
          <p className="flex gap-2">
            <Clock aria-hidden className="mt-0.5 shrink-0 text-[#0f766e]" size={18} />
            <span>{location.openingHours}</span>
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <a className="btn-primary px-3 py-2 text-sm" href={getGoogleMapsUrl(location)} target="_blank" rel="noreferrer">
          <ExternalLink aria-hidden size={16} />
          Abrir no Google Maps
        </a>
        {whatsappUrl && (
          <a className="btn-secondary px-3 py-2 text-sm" href={whatsappUrl} target="_blank" rel="noreferrer">
            <MessageCircle aria-hidden size={16} />
            Chamar no WhatsApp
          </a>
        )}
        {phoneUrl && (
          <a className="btn-secondary px-3 py-2 text-sm" href={phoneUrl}>
            <Phone aria-hidden size={16} />
            Ligar
          </a>
        )}
        <Link className="btn-secondary px-3 py-2 text-sm" href={`/mapa-pet/${location.id}`}>
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}
