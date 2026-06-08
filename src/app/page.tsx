import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ClipboardCheck, HeartHandshake, Home, MapPin, Phone, Search } from "lucide-react";

const steps = [
  "ONG/protetor cadastra o pet",
  "Adotante encontra um animal",
  "Adotante preenche o formulário",
  "ONG/protetor avalia o pedido",
  "Adoção segue presencialmente com responsabilidade",
];

export default function HomePage() {
  return (
    <div>
      <section className="relative min-h-[78vh] overflow-hidden bg-[#15372f] text-white">
        <Image
          src="https://images.unsplash.com/photo-1601758177266-bc599de87707?auto=format&fit=crop&w=1800&q=80"
          alt="Pessoa acolhendo um animal resgatado"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,55,47,0.92),rgba(21,55,47,0.58),rgba(21,55,47,0.22))]" />
        <div className="container-page relative flex min-h-[78vh] items-center py-16">
          <div className="max-w-3xl">
            <span className="badge mb-5 bg-[#ffd166] text-[#2b3a2f]">
              <HeartHandshake aria-hidden size={16} />
              Adoção responsável
            </span>
            <h1 className="text-5xl font-black leading-tight tracking-normal md:text-7xl">
              PetLar
            </h1>
            <p className="mt-5 max-w-2xl text-xl font-semibold leading-8 text-[#fff7e7] md:text-2xl">
              Conectando animais resgatados a novos lares com responsabilidade.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#f4ead8]">
              Uma plataforma para ONGs, protetores independentes, lares temporários
              e adotantes organizarem a divulgação de cães e gatos resgatados,
              triagem inicial e contato seguro.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/pets" className="btn-primary bg-[#ffd166] text-[#18392f] hover:bg-[#f4bd3f]">
                <Search aria-hidden size={18} />
                Quero adotar
              </Link>
              <Link href="/para-ongs" className="btn-secondary border-white/40 bg-white/95">
                <ClipboardCheck aria-hidden size={18} />
                Sou ONG ou protetor
              </Link>
              <Link href="/lar-temporario" className="btn-secondary border-white/40 bg-white/95">
                <Home aria-hidden size={18} />
                Quero ser lar temporário
              </Link>
              <Link href="/mapa-pet" className="btn-secondary border-white/40 bg-white/95">
                <MapPin aria-hidden size={18} />
                Hospitais e apoio
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#e4f5ef] py-12">
        <div className="container-page grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase text-[#0f766e]">Hospitais, emergência e apoio animal</p>
            <h2 className="mt-2 text-3xl font-black text-[#18392f] md:text-4xl">
              Precisa de atendimento veterinário ou ponto de apoio?
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-[#52665a]">
              Acesse o Mapa Pet para encontrar hospitais veterinários, clínicas, atendimento 24h,
              castração popular, ONGs, lares temporários e pontos de arrecadação.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/mapa-pet" className="btn-primary">
                <MapPin aria-hidden size={18} />
                Abrir Mapa Pet
              </Link>
              <Link href="/mapa-pet" className="btn-secondary">
                <Phone aria-hidden size={18} />
                Ver contatos de emergência
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <HomeHighlight title="Hospitais" text="Hospitais veterinários, clínicas e plantão 24h." />
            <HomeHighlight title="Castração" text="Serviços gratuitos, populares ou particulares." />
            <HomeHighlight title="Apoio" text="ONGs, protetores, lares temporários e arrecadação." />
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container-page grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase text-[#d95d39]">Como funciona</p>
            <h2 className="mt-2 text-3xl font-black text-[#18392f] md:text-4xl">
              Um fluxo simples para aproximar quem resgata de quem quer adotar.
            </h2>
          </div>
          <ol className="grid gap-3">
            {steps.map((step, index) => (
              <li key={step} className="surface flex items-center gap-4 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#0f766e] font-black text-white">
                  {index + 1}
                </span>
                <span className="font-bold text-[#263b31]">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#fef0d6] py-10">
        <div className="container-page flex flex-col gap-4 md:flex-row md:items-start">
          <AlertTriangle className="mt-1 shrink-0 text-[#b45309]" aria-hidden size={28} />
          <div>
            <h2 className="text-2xl font-black text-[#633c12]">Aviso importante</h2>
            <p className="mt-2 max-w-4xl leading-7 text-[#704214]">
              O PetLar não substitui a avaliação da ONG ou protetor. A plataforma
              apenas facilita a conexão entre responsáveis pelos animais e pessoas
              interessadas em adoção.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function HomeHighlight({ title, text }: { title: string; text: string }) {
  return (
    <div className="surface h-full p-4">
      <h3 className="text-xl font-black text-[#18392f]">{title}</h3>
      <p className="mt-2 leading-6 text-[#52665a]">{text}</p>
    </div>
  );
}
