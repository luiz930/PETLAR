const sections = [
  {
    title: "Quais dados são coletados",
    text: "Nome, e-mail, WhatsApp, cidade, bairro e respostas necessárias para triagem inicial de adoção ou lar temporário. O PetLar não solicita CPF nem endereço completo.",
  },
  {
    title: "Para que são usados",
    text: "Os dados servem para análise do interesse de adoção, contato com o responsável pelo animal e organização dos pedidos enviados.",
  },
  {
    title: "Quem pode acessar",
    text: "O adotante pode visualizar seus próprios formulários. A ONG ou protetor acessa apenas pedidos enviados para pets sob sua responsabilidade.",
  },
  {
    title: "Remoção de dados",
    text: "O usuário pode solicitar remoção entrando em contato com a ONG/protetor responsável ou com o administrador do sistema em uma implantação real.",
  },
  {
    title: "Uso limitado",
    text: "O PetLar não vende dados, não usa dados para propaganda e coleta apenas informações necessárias para análise inicial.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="container-page py-10">
      <section className="mb-8">
        <p className="text-sm font-black uppercase text-[#0f766e]">LGPD</p>
        <h1 className="mt-2 text-4xl font-black text-[#18392f]">Privacidade em linguagem simples</h1>
        <p className="mt-4 max-w-4xl leading-7 text-[#52665a]">
          Esta página explica como o PetLar trata os dados na plataforma. Em uma implantação
          real, a instituição responsável deve informar canais de contato e políticas
          complementares.
        </p>
      </section>
      <div className="grid gap-4">
        {sections.map((section) => (
          <article key={section.title} className="surface p-5">
            <h2 className="text-2xl font-black text-[#18392f]">{section.title}</h2>
            <p className="mt-2 leading-7 text-[#52665a]">{section.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
