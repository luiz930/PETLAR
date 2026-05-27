import Image from "next/image";
import Link from "next/link";
import { MapPin, PawPrint } from "lucide-react";
import { type Pet, statusLabels } from "@/data/domain";

export function PetCard({ pet }: { pet: Pet }) {
  return (
    <article className="surface overflow-hidden">
      <div className="relative aspect-[4/3] bg-[#e7efe8]">
        <Image
          src={pet.images[0]}
          alt={`Foto de ${pet.name}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <span className="badge absolute left-3 top-3 bg-white text-[#0f766e]">
          <PawPrint aria-hidden size={14} />
          {statusLabels[pet.status]}
        </span>
      </div>
      <div className="grid gap-4 p-4">
        <div>
          <h3 className="text-xl font-black text-[#18392f]">{pet.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-[#52665a]">
            <MapPin aria-hidden size={15} />
            {pet.city}/{pet.state}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <Info label="Espécie" value={pet.species} />
          <Info label="Sexo" value={pet.sex} />
          <Info label="Idade" value={pet.approximateAge} />
          <Info label="Porte" value={pet.size} />
        </dl>
        <Link href={`/pets/${pet.id}`} className="btn-primary">
          Ver detalhes
        </Link>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#f4f1e8] p-2">
      <dt className="text-xs font-bold uppercase text-[#6c7a70]">{label}</dt>
      <dd className="font-bold capitalize text-[#263b31]">{value}</dd>
    </div>
  );
}
