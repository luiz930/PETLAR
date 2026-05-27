export type UserRole = "adotante" | "ong" | "lar_temporario" | "admin";
export type PetStatus = "disponivel" | "em_tratamento" | "adotado" | "indisponivel";
export type ApplicationStatus =
  | "enviado"
  | "em_analise"
  | "aprovado_para_contato"
  | "recusado"
  | "finalizado";

export type Pet = {
  id: string;
  name: string;
  species: "cão" | "gato" | "outro";
  sex: "fêmea" | "macho";
  approximateAge: string;
  size: "pequeno" | "médio" | "grande";
  breed?: string;
  city: string;
  state: string;
  status: PetStatus;
  description: string;
  rescueStory: string;
  temperament: string;
  healthInfo: string;
  castrated: "sim" | "não" | "não informado";
  vaccinated: "sim" | "não" | "não informado";
  dewormed: "sim" | "não" | "não informado";
  goodWithKids: "sim" | "não" | "não informado";
  goodWithAnimals: "sim" | "não" | "não informado";
  organizationName: string;
  images: string[];
};

export const statusLabels: Record<PetStatus, string> = {
  disponivel: "Disponível",
  em_tratamento: "Em tratamento",
  adotado: "Adotado",
  indisponivel: "Indisponível",
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  enviado: "Enviado",
  em_analise: "Em análise",
  aprovado_para_contato: "Aprovado para contato",
  recusado: "Recusado",
  finalizado: "Finalizado",
};
