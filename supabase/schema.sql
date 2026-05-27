create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('adotante', 'ong', 'lar_temporario', 'admin')),
  avatar_url text,
  phone text,
  city text,
  state text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists avatar_url text;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type text not null check (type in ('ong', 'protetor_independente')),
  description text not null,
  city text not null,
  state text not null,
  whatsapp text not null,
  email text not null,
  instagram text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  species text not null,
  sex text not null,
  approximate_age text not null,
  size text not null,
  breed text,
  city text not null,
  state text not null,
  description text not null,
  rescue_story text,
  temperament text,
  health_info text,
  castrated text not null,
  vaccinated text not null,
  dewormed text not null,
  good_with_kids text not null,
  good_with_animals text not null,
  status text not null check (status in ('disponivel', 'em_tratamento', 'adotado', 'indisponivel')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pet_images (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  image_url text not null,
  is_main boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.adoption_applications (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  adopter_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  email text not null,
  whatsapp text not null,
  city text not null,
  neighborhood text not null,
  housing_type text not null,
  housing_status text not null,
  household_agrees boolean not null,
  has_other_pets boolean not null,
  current_pets_castrated_vaccinated text,
  had_pet_before boolean not null,
  pet_access_to_street text not null,
  hours_alone_per_day text not null,
  can_afford_vet boolean not null,
  reason_to_adopt text not null,
  long_term_responsibility boolean not null,
  consent_lgpd boolean not null,
  status text not null default 'enviado' check (status in ('enviado', 'em_analise', 'aprovado_para_contato', 'recusado', 'finalizado')),
  created_at timestamptz not null default now()
);

create table if not exists public.temporary_homes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  email text not null,
  whatsapp text not null,
  city text not null,
  neighborhood text not null,
  animal_type text not null,
  accepted_size text not null,
  quantity_available int not null,
  available_period text not null,
  has_other_pets boolean not null,
  notes text,
  consent_lgpd boolean not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pets_set_updated_at on public.pets;
create trigger pets_set_updated_at
before update on public.pets
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuário PetLar'),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'role', 'adotante')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.pets enable row level security;
alter table public.pet_images enable row level security;
alter table public.adoption_applications enable row level security;
alter table public.temporary_homes enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "organizations_public_approved" on public.organizations;
drop policy if exists "organizations_owner_select" on public.organizations;
drop policy if exists "organizations_owner_insert" on public.organizations;
drop policy if exists "organizations_owner_update" on public.organizations;
drop policy if exists "pets_public_available" on public.pets;
drop policy if exists "pets_owner_select" on public.pets;
drop policy if exists "pets_owner_insert" on public.pets;
drop policy if exists "pets_owner_update" on public.pets;
drop policy if exists "pet_images_public_available" on public.pet_images;
drop policy if exists "pet_images_owner_all" on public.pet_images;
drop policy if exists "applications_adopter_insert" on public.adoption_applications;
drop policy if exists "applications_adopter_select_own" on public.adoption_applications;
drop policy if exists "applications_org_select" on public.adoption_applications;
drop policy if exists "applications_org_update_status" on public.adoption_applications;
drop policy if exists "temporary_homes_insert_own" on public.temporary_homes;
drop policy if exists "temporary_homes_select_own" on public.temporary_homes;
drop policy if exists "temporary_homes_select_orgs" on public.temporary_homes;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "organizations_public_approved" on public.organizations
for select using (approved = true);

create policy "organizations_owner_select" on public.organizations
for select using (auth.uid() = user_id);

create policy "organizations_owner_insert" on public.organizations
for insert with check (auth.uid() = user_id);

create policy "organizations_owner_update" on public.organizations
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "pets_public_available" on public.pets
for select using (
  status = 'disponivel'
  and exists (
    select 1 from public.organizations o
    where o.id = pets.organization_id and o.approved = true
  )
);

create policy "pets_owner_select" on public.pets
for select using (
  exists (
    select 1 from public.organizations o
    where o.id = pets.organization_id and o.user_id = auth.uid()
  )
);

create policy "pets_owner_insert" on public.pets
for insert with check (
  exists (
    select 1 from public.organizations o
    where o.id = organization_id and o.user_id = auth.uid()
  )
);

create policy "pets_owner_update" on public.pets
for update using (
  exists (
    select 1 from public.organizations o
    where o.id = pets.organization_id and o.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.organizations o
    where o.id = organization_id and o.user_id = auth.uid()
  )
);

create policy "pet_images_public_available" on public.pet_images
for select using (
  exists (
    select 1
    from public.pets p
    join public.organizations o on o.id = p.organization_id
    where p.id = pet_images.pet_id and p.status = 'disponivel' and o.approved = true
  )
);

create policy "pet_images_owner_all" on public.pet_images
for all using (
  exists (
    select 1
    from public.pets p
    join public.organizations o on o.id = p.organization_id
    where p.id = pet_images.pet_id and o.user_id = auth.uid()
  )
) with check (
  exists (
    select 1
    from public.pets p
    join public.organizations o on o.id = p.organization_id
    where p.id = pet_id and o.user_id = auth.uid()
  )
);

create policy "applications_adopter_insert" on public.adoption_applications
for insert with check (auth.uid() = adopter_id and consent_lgpd = true);

create policy "applications_adopter_select_own" on public.adoption_applications
for select using (auth.uid() = adopter_id);

create policy "applications_org_select" on public.adoption_applications
for select using (
  exists (
    select 1
    from public.pets p
    join public.organizations o on o.id = p.organization_id
    where p.id = adoption_applications.pet_id and o.user_id = auth.uid()
  )
);

create policy "applications_org_update_status" on public.adoption_applications
for update using (
  exists (
    select 1
    from public.pets p
    join public.organizations o on o.id = p.organization_id
    where p.id = adoption_applications.pet_id and o.user_id = auth.uid()
  )
);

create policy "temporary_homes_insert_own" on public.temporary_homes
for insert with check (auth.uid() = user_id and consent_lgpd = true);

create policy "temporary_homes_select_own" on public.temporary_homes
for select using (auth.uid() = user_id);

create policy "temporary_homes_select_orgs" on public.temporary_homes
for select using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('ong', 'admin')
  )
);

insert into storage.buckets (id, name, public)
values ('pet-images', 'pet-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do nothing;

drop policy if exists "pet_images_storage_public_read" on storage.objects;
drop policy if exists "pet_images_storage_authenticated_upload" on storage.objects;
drop policy if exists "pet_images_storage_authenticated_update" on storage.objects;
drop policy if exists "pet_images_storage_authenticated_delete" on storage.objects;
drop policy if exists "profile_avatars_storage_public_read" on storage.objects;
drop policy if exists "profile_avatars_storage_authenticated_upload" on storage.objects;
drop policy if exists "profile_avatars_storage_authenticated_update" on storage.objects;
drop policy if exists "profile_avatars_storage_authenticated_delete" on storage.objects;

create policy "pet_images_storage_public_read" on storage.objects
for select using (bucket_id = 'pet-images');

create policy "pet_images_storage_authenticated_upload" on storage.objects
for insert to authenticated
with check (bucket_id = 'pet-images');

create policy "pet_images_storage_authenticated_update" on storage.objects
for update to authenticated
using (bucket_id = 'pet-images')
with check (bucket_id = 'pet-images');

create policy "pet_images_storage_authenticated_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'pet-images');

create policy "profile_avatars_storage_public_read" on storage.objects
for select using (bucket_id = 'profile-avatars');

create policy "profile_avatars_storage_authenticated_upload" on storage.objects
for insert to authenticated
with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "profile_avatars_storage_authenticated_update" on storage.objects
for update to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "profile_avatars_storage_authenticated_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
