const sections = [
  {
    title: "Lei aplicada",
    text: "O tratamento de dados pessoais no PetLar segue como referência a Lei Geral de Proteção de Dados Pessoais, Lei nº 13.709, de 14 de agosto de 2018, que estabelece regras para coleta, uso, armazenamento, compartilhamento e eliminação de dados pessoais no Brasil.",
  },
  {
    title: "Quais dados são coletados",
    text: "Nome, e-mail, WhatsApp, cidade, bairro e respostas necessárias para triagem inicial de adoção ou lar temporário. O PetLar não solicita CPF nem endereço completo.",
  },
  {
    title: "Para que são usados",
    text: "Os dados servem para análise do interesse de adoção, contato com o responsável pelo animal, organização dos pedidos enviados, cadastro de conta e segurança básica da plataforma.",
  },
  {
    title: "Como tratamos os dados",
    text: "Os dados são tratados com finalidade definida, necessidade, transparência e acesso restrito. Coletamos apenas o necessário para o funcionamento do serviço e mantemos as informações disponíveis somente para quem precisa atuar no fluxo.",
  },
  {
    title: "Quem pode acessar",
    text: "O adotante pode visualizar seus próprios formulários. A ONG ou protetor acessa apenas pedidos enviados para pets sob sua responsabilidade. Administradores podem acessar dados necessários para suporte, segurança e moderação.",
  },
  {
    title: "Dados no Mapa Pet",
    text: "O Mapa Pet exibe apenas dados de locais de atendimento e apoio, como endereço público, telefone, WhatsApp, horário e categoria. Dados pessoais de quem sugeriu um local não são exibidos publicamente.",
  },
  {
    title: "Compartilhamento",
    text: "O PetLar não vende dados pessoais. O compartilhamento ocorre apenas dentro do fluxo esperado da plataforma, como quando um adotante envia interesse para uma ONG ou protetor responsável pelo pet.",
  },
  {
    title: "Remoção e correção de dados",
    text: "O usuário pode solicitar correção ou remoção de dados entrando em contato com a ONG/protetor responsável ou com o administrador do sistema em uma implantação real.",
  },
  {
    title: "Uso limitado",
    text: "O PetLar não usa dados para propaganda comportamental e coleta apenas informações necessárias para análise inicial, contato, segurança e melhoria do serviço.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="container-page py-10">
      <section className="mb-8">
        <p className="text-sm font-black uppercase text-[#0f766e]">LGPD</p>
        <h1 className="mt-2 text-4xl font-black text-[#18392f]">LGPD e privacidade em linguagem simples</h1>
        <p className="mt-4 max-w-4xl leading-7 text-[#52665a]">
          Esta página explica como o PetLar trata dados pessoais de acordo com a Lei Geral de Proteção
          de Dados Pessoais (LGPD), Lei nº 13.709/2018. Em uma implantação real, a instituição
          responsável deve informar canais de contato, encarregado de dados quando aplicável e
          políticas complementares.
        </p>
      </section>

      <div className="mb-6 rounded-lg border border-[#dbe6dc] bg-white p-5">
        <h2 className="text-2xl font-black text-[#18392f]">Resumo do tratamento de dados</h2>
        <p className="mt-2 leading-7 text-[#52665a]">
          Coletamos somente dados necessários para adoção responsável, lar temporário, sugestão de
          locais no Mapa Pet, contato e segurança da conta. As informações não são vendidas e não
          são exibidas publicamente sem finalidade clara.
        </p>
      </div>

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
