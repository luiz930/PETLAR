import Link from "next/link";
import { HeartHandshake } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#dbe6dc] bg-white">
      <div className="container-page grid gap-6 py-8 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="mb-3 flex items-center gap-2 font-black text-[#18392f]">
            <HeartHandshake aria-hidden size={22} />
            PetLar
          </div>
          <p className="max-w-xl text-sm leading-6 text-[#52665a]">
            Conectando animais resgatados a novos lares com responsabilidade.
            O PetLar não realiza venda de animais e não substitui a avaliação
            presencial da ONG ou protetor.
          </p>
        </div>
        <div className="grid gap-2 text-sm">
          <strong className="text-[#1e2a24]">Plataforma</strong>
          <Link href="/pets" className="text-[#52665a] hover:text-[#0f766e]">
            Pets disponíveis
          </Link>
          <Link href="/mapa-pet" className="text-[#52665a] hover:text-[#0f766e]">
            Mapa Pet: hospitais e apoio
          </Link>
          <Link href="/para-ongs" className="text-[#52665a] hover:text-[#0f766e]">
            Para ONGs
          </Link>
          <Link href="/privacidade" className="text-[#52665a] hover:text-[#0f766e]">
            LGPD e privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
