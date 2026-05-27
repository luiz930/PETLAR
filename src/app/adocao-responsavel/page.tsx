import { AlertTriangle, HeartHandshake, ShieldCheck } from "lucide-react";

const topics = [
  {
    title: "Adoção não é impulso",
    text: "A decisão precisa considerar rotina, espaço, tempo disponível e acordo de todos os moradores.",
  },
  {
    title: "Custos permanentes",
    text: "Alimentação, vacina, castração, vermífugo, consultas veterinárias e emergências devem entrar no planejamento.",
  },
  {
    title: "Telas de proteção para gatos",
    text: "Gatos precisam de janelas e sacadas protegidas para evitar quedas e fugas.",
  },
  {
    title: "Animal solto na rua corre risco",
    text: "Passeios devem ser seguros. Deixar cães ou gatos soltos aumenta risco de atropelamento, brigas e doenças.",
  },
  {
    title: "Adaptação leva tempo",
    text: "Animais resgatados podem precisar de paciência, previsibilidade, enriquecimento ambiental e acompanhamento.",
  },
  {
    title: "Responsabilidade de longo prazo",
    text: "Adoção responsável acompanha o animal durante toda a vida, inclusive na velhice.",
  },
];

export default function ResponsibleAdoptionPage() {
  return (
    <div className="container-page py-10">
      <section className="mb-8 grid gap-4">
        <span className="badge bg-[#e4f5ef] text-[#0f766e]">
          <ShieldCheck aria-hidden size={16} />
          Conteúdo educativo
        </span>
        <h1 className="text-4xl font-black text-[#18392f]">Adoção responsável</h1>
        <p className="max-w-4xl leading-7 text-[#52665a]">
          Adotar é assumir cuidado, tempo, custos e segurança. O PetLar ajuda a
          organizar o contato, mas a decisão final deve ser feita com avaliação
          cuidadosa da ONG ou protetor.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <article key={topic.title} className="surface p-5">
            <HeartHandshake className="mb-4 text-[#d95d39]" aria-hidden size={28} />
            <h2 className="text-xl font-black text-[#18392f]">{topic.title}</h2>
            <p className="mt-3 leading-7 text-[#52665a]">{topic.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 flex gap-3 rounded-lg border border-[#f6d58c] bg-[#fef0d6] p-5 text-[#704214]">
        <AlertTriangle aria-hidden className="shrink-0" size={26} />
        <p className="font-bold leading-7">
          Não compre animais pela plataforma. O MVP é voltado exclusivamente para
          adoção responsável, lar temporário e apoio a resgates.
        </p>
      </section>
    </div>
  );
}
