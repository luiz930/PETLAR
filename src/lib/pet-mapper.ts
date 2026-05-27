import type { Pet } from "@/data/domain";

type PetImageRow = {
  image_url: string;
  is_main: boolean | null;
};

type OrganizationRow = {
  name: string | null;
};

export type SupabasePetRow = {
  id: string;
  name: string;
  species: string;
  sex: string;
  approximate_age: string;
  size: string;
  breed: string | null;
  city: string;
  state: string;
  status: string;
  description: string;
  rescue_story: string | null;
  temperament: string | null;
  health_info: string | null;
  castrated: string;
  vaccinated: string;
  dewormed: string;
  good_with_kids: string;
  good_with_animals: string;
  organizations?: OrganizationRow | OrganizationRow[] | null;
  pet_images?: PetImageRow[] | null;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1601758177266-bc599de87707?auto=format&fit=crop&w=1200&q=80";

export function mapSupabasePet(row: SupabasePetRow): Pet {
  const organization = Array.isArray(row.organizations)
    ? row.organizations[0]
    : row.organizations;
  const images = [...(row.pet_images ?? [])].sort((a, b) => {
    if (a.is_main === b.is_main) return 0;
    return a.is_main ? -1 : 1;
  });

  return {
    id: row.id,
    name: row.name,
    species: normalizeSpecies(row.species),
    sex: normalizeSex(row.sex),
    approximateAge: row.approximate_age,
    size: normalizeSize(row.size),
    breed: row.breed ?? undefined,
    city: row.city,
    state: row.state,
    status: normalizeStatus(row.status),
    description: row.description,
    rescueStory: row.rescue_story ?? "História do resgate não informada.",
    temperament: row.temperament ?? "Temperamento não informado.",
    healthInfo: row.health_info ?? "Informações de saúde não informadas.",
    castrated: normalizeYesNo(row.castrated),
    vaccinated: normalizeYesNo(row.vaccinated),
    dewormed: normalizeYesNo(row.dewormed),
    goodWithKids: normalizeYesNo(row.good_with_kids),
    goodWithAnimals: normalizeYesNo(row.good_with_animals),
    organizationName: organization?.name ?? "Responsável não informado",
    images: images.length ? images.map((image) => image.image_url) : [fallbackImage],
  };
}

function normalizeSpecies(value: string): Pet["species"] {
  if (value === "gato" || value === "outro") return value;
  return "cão";
}

function normalizeSex(value: string): Pet["sex"] {
  return value === "macho" ? "macho" : "fêmea";
}

function normalizeSize(value: string): Pet["size"] {
  if (value === "pequeno" || value === "grande") return value;
  return "médio";
}

function normalizeStatus(value: string): Pet["status"] {
  if (value === "em_tratamento" || value === "adotado" || value === "indisponivel") {
    return value;
  }
  return "disponivel";
}

function normalizeYesNo(value: string): "sim" | "não" | "não informado" {
  if (value === "sim" || value === "não") return value;
  return "não informado";
}

export const petSelectQuery = `
  id,
  name,
  species,
  sex,
  approximate_age,
  size,
  breed,
  city,
  state,
  status,
  description,
  rescue_story,
  temperament,
  health_info,
  castrated,
  vaccinated,
  dewormed,
  good_with_kids,
  good_with_animals,
  organizations(name),
  pet_images(image_url, is_main)
`;
