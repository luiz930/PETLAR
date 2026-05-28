export type PetServiceCategory =
  | "hospital_veterinario"
  | "clinica_veterinaria"
  | "emergencia_24h"
  | "castracao_popular"
  | "ong_protecao"
  | "protetor_independente"
  | "lar_temporario"
  | "pet_shop"
  | "banho_tosa"
  | "ponto_arrecadacao"
  | "servico_publico"
  | "outro";

export type HelpRescuedAnimals = "sim" | "nao" | "nao_informado";
export type PetServiceType = "gratuito" | "popular" | "particular" | "nao_informado";
export type PetServiceStatus = "ativo" | "pendente" | "inativo";

export type PetServiceLocation = {
  id: string;
  name: string;
  category: PetServiceCategory;
  description: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  instagram: string;
  openingHours: string;
  is24h: boolean;
  hasEmergency: boolean;
  helpsRescuedAnimals: HelpRescuedAnimals;
  serviceType: PetServiceType;
  notes: string;
  latitude: number | null;
  longitude: number | null;
  status: PetServiceStatus;
  suggestedBy: string | null;
  suggestedByName?: string;
  suggestedByEmail?: string;
  sourceInfo?: string;
  createdAt: string;
  updatedAt: string;
};

export type SupabasePetServiceLocationRow = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  address: string;
  neighborhood: string | null;
  city: string;
  state: string;
  zip_code: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  opening_hours: string | null;
  is_24h: boolean | null;
  has_emergency: boolean | null;
  helps_rescued_animals: string | null;
  service_type: string | null;
  notes: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  status: string | null;
  suggested_by: string | null;
  source_info?: string | null;
  created_at: string | null;
  updated_at: string | null;
  profiles?: { name?: string | null; email?: string | null } | null;
};

export const petServiceCategories: { value: PetServiceCategory; label: string }[] = [
  { value: "hospital_veterinario", label: "Hospital veterinário" },
  { value: "clinica_veterinaria", label: "Clínica veterinária" },
  { value: "emergencia_24h", label: "Atendimento veterinário de emergência 24h" },
  { value: "castracao_popular", label: "Castração popular" },
  { value: "ong_protecao", label: "ONG de proteção animal" },
  { value: "protetor_independente", label: "Protetor independente" },
  { value: "lar_temporario", label: "Lar temporário" },
  { value: "pet_shop", label: "Pet shop" },
  { value: "banho_tosa", label: "Banho e tosa" },
  { value: "ponto_arrecadacao", label: "Ponto de arrecadação" },
  { value: "servico_publico", label: "Prefeitura / serviço público" },
  { value: "outro", label: "Outro" },
];

export const serviceTypeLabels: Record<PetServiceType, string> = {
  gratuito: "Gratuito",
  popular: "Popular",
  particular: "Particular",
  nao_informado: "Não informado",
};

export const rescuedAnimalsLabels: Record<HelpRescuedAnimals, string> = {
  sim: "Sim",
  nao: "Não",
  nao_informado: "Não informado",
};

export const locationStatusLabels: Record<PetServiceStatus, string> = {
  ativo: "Ativo",
  pendente: "Pendente de revisão",
  inativo: "Inativo",
};

export const petServiceLocationSelectQuery =
  "id, name, category, description, address, neighborhood, city, state, zip_code, phone, whatsapp, email, website, instagram, opening_hours, is_24h, has_emergency, helps_rescued_animals, service_type, notes, latitude, longitude, status, suggested_by, source_info, created_at, updated_at";

export const petServiceLocationAdminSelectQuery = `${petServiceLocationSelectQuery}, profiles:suggested_by(name, email)`;

export const locationNotice =
  "As informações exibidas devem ser confirmadas diretamente com o local antes do deslocamento, pois horários, valores e disponibilidade podem mudar.";

export const mockPetServiceLocations: PetServiceLocation[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Hospital Veterinário Plantão Pet",
    category: "emergencia_24h",
    description: "Atendimento veterinário com plantão e suporte para casos urgentes.",
    address: "Rua das Flores, 120",
    neighborhood: "Centro",
    city: "Curitiba",
    state: "PR",
    zipCode: "80010-000",
    phone: "(41) 3333-1200",
    whatsapp: "41999991200",
    email: "",
    website: "",
    instagram: "",
    openingHours: "24 horas",
    is24h: true,
    hasEmergency: true,
    helpsRescuedAnimals: "nao_informado",
    serviceType: "particular",
    notes: "Confirme disponibilidade e valores antes de sair.",
    latitude: null,
    longitude: null,
    status: "ativo",
    suggestedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Projeto Castração Popular Bairro Novo",
    category: "castracao_popular",
    description: "Mutirões e agenda de castração com valores populares.",
    address: "Avenida Brasil, 880",
    neighborhood: "Bairro Novo",
    city: "Curitiba",
    state: "PR",
    zipCode: "",
    phone: "(41) 3333-8800",
    whatsapp: "41988888800",
    email: "contato@castracaopopular.org",
    website: "",
    instagram: "castracaopopular",
    openingHours: "Segunda a sexta, 8h às 17h",
    is24h: false,
    hasEmergency: false,
    helpsRescuedAnimals: "sim",
    serviceType: "popular",
    notes: "Verifique agenda, critérios e necessidade de cadastro prévio.",
    latitude: null,
    longitude: null,
    status: "ativo",
    suggestedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "ONG Patinhas Unidas",
    category: "ong_protecao",
    description: "Rede de apoio para adoção, resgate responsável e orientação comunitária.",
    address: "Rua Esperança, 45",
    neighborhood: "Jardim Social",
    city: "Curitiba",
    state: "PR",
    zipCode: "",
    phone: "",
    whatsapp: "41977774545",
    email: "contato@patinhasunidas.org",
    website: "",
    instagram: "patinhasunidas",
    openingHours: "Atendimento por WhatsApp",
    is24h: false,
    hasEmergency: false,
    helpsRescuedAnimals: "sim",
    serviceType: "gratuito",
    notes: "ONG não realiza resgates imediatos; confirme possibilidades de apoio.",
    latitude: null,
    longitude: null,
    status: "ativo",
    suggestedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Ponto Solidário PetLar",
    category: "ponto_arrecadacao",
    description: "Recebe ração, cobertas, medicamentos dentro da validade e itens de higiene.",
    address: "Rua dos Voluntários, 300",
    neighborhood: "Mercês",
    city: "Curitiba",
    state: "PR",
    zipCode: "",
    phone: "(41) 3333-0300",
    whatsapp: "",
    email: "",
    website: "",
    instagram: "",
    openingHours: "Segunda a sábado, 9h às 18h",
    is24h: false,
    hasEmergency: false,
    helpsRescuedAnimals: "sim",
    serviceType: "gratuito",
    notes: "Ligue antes para confirmar itens aceitos no dia.",
    latitude: null,
    longitude: null,
    status: "ativo",
    suggestedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function mapSupabaseLocation(row: SupabasePetServiceLocationRow): PetServiceLocation {
  return {
    id: row.id,
    name: row.name,
    category: asCategory(row.category),
    description: row.description ?? "",
    address: row.address,
    neighborhood: row.neighborhood ?? "",
    city: row.city,
    state: row.state,
    zipCode: row.zip_code ?? "",
    phone: row.phone ?? "",
    whatsapp: row.whatsapp ?? "",
    email: row.email ?? "",
    website: row.website ?? "",
    instagram: row.instagram ?? "",
    openingHours: row.opening_hours ?? "",
    is24h: Boolean(row.is_24h),
    hasEmergency: Boolean(row.has_emergency),
    helpsRescuedAnimals: asHelpRescuedAnimals(row.helps_rescued_animals),
    serviceType: asServiceType(row.service_type),
    notes: row.notes ?? "",
    latitude: toNumber(row.latitude),
    longitude: toNumber(row.longitude),
    status: asStatus(row.status),
    suggestedBy: row.suggested_by ?? null,
    suggestedByName: row.profiles?.name ?? undefined,
    suggestedByEmail: row.profiles?.email ?? undefined,
    sourceInfo: row.source_info ?? undefined,
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at ?? "",
  };
}

export function getCategoryLabel(category: string) {
  return petServiceCategories.find((item) => item.value === category)?.label ?? "Outro";
}

export function getFullAddress(location: Pick<PetServiceLocation, "address" | "neighborhood" | "city" | "state" | "zipCode">) {
  const cityState = [location.city, location.state].filter(Boolean).join("/");
  return [location.address, location.neighborhood, cityState, location.zipCode].filter(Boolean).join(", ");
}

export function getGoogleMapsUrl(location: Pick<PetServiceLocation, "address" | "neighborhood" | "city" | "state" | "zipCode">) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getFullAddress(location))}`;
}

export function getWhatsappUrl(whatsapp: string) {
  const digits = whatsapp.replace(/\D/g, "");
  if (!digits) return "";
  const normalized = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${normalized}`;
}

export function getTelUrl(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:${digits}` : "";
}

export function isFreeOrPopular(type: PetServiceType) {
  return type === "gratuito" || type === "popular";
}

function asCategory(value: string): PetServiceCategory {
  return petServiceCategories.some((item) => item.value === value) ? (value as PetServiceCategory) : "outro";
}

function asHelpRescuedAnimals(value: string | null): HelpRescuedAnimals {
  return value === "sim" || value === "nao" || value === "nao_informado" ? value : "nao_informado";
}

function asServiceType(value: string | null): PetServiceType {
  return value === "gratuito" || value === "popular" || value === "particular" || value === "nao_informado"
    ? value
    : "nao_informado";
}

function asStatus(value: string | null): PetServiceStatus {
  return value === "ativo" || value === "pendente" || value === "inativo" ? value : "pendente";
}

function toNumber(value: number | string | null) {
  if (value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
