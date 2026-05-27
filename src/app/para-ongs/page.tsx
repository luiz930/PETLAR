import Link from "next/link";
import { ArrowRight, ClipboardCheck, Megaphone, MessageSquare, PawPrint } from "lucide-react";

const benefits = [
  {
    icon: PawPrint,
    title: "Centralizar pets",
    text: "Cadastre cães e gatos com fotos, status, saúde, temperamento e localização.",
  },
  {
    icon: ClipboardCheck,
    title: "Organizar interessados",
    text: "Receba respostas estruturadas em vez de perder conversas em redes sociais.",
  },
  {
    icon: Megaphone,
    title: "Facilitar divulgação",
    text: "Compartilhe uma página clara do pet com informações importantes para adoção.",
  },
  {
    icon: MessageSquare,
    title: "Contato responsável",
    text: "Use WhatsApp ou e-mail depois de avaliar o formulário de interesse.",
  },
];

export default function ForOngsPage() {
  return (
    <div className="container-page py-10">
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase text-[#0f766e]">Para ONGs e protetores</p>
          <h1 className="mt-2 text-4xl font-black text-[#18392f]">
            Menos conversas perdidas, mais organização para adoções responsáveis.
          </h1>
          <p className="mt-4 leading-7 text-[#52665a]">
            O PetLar permite cadastrar pets, acompanhar interessados, analisar
            respostas e atualizar status como disponível, em tratamento, adotado
            ou indisponível.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/cadastro" className="btn-primary">
              Criar cadastro <ArrowRight aria-hidden size={18} />
            </Link>
            <Link href="/dashboard/ong" className="btn-secondary">
              Ver painel demo
            </Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article key={benefit.title} className="surface p-5">
                <Icon className="mb-4 text-[#d95d39]" aria-hidden size={28} />
                <h2 className="text-xl font-black text-[#18392f]">{benefit.title}</h2>
                <p className="mt-3 leading-7 text-[#52665a]">{benefit.text}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
