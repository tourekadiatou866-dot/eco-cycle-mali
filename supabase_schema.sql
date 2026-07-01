-- 1. NETTOYAGE DES ANCIENNES TABLES (Utile pour réinitialiser proprement)
drop table if exists public.post_comments cascade;
drop table if exists public.post_likes cascade;
drop table if exists public.posts cascade;
drop table if exists public.withdrawals cascade;
drop table if exists public.waste_reports cascade;
drop table if exists public.profiles cascade;

-- 2. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABLE DES PROFILS UTILISATEURS (Liée à l'auth Supabase)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  phone text,
  address text,
  photo text, -- URL ou base64
  points integer default 0 not null,
  balance numeric(10, 2) default 0.00 not null,
  total_weight numeric(10, 2) default 0.00 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index pour accélérer le lookup par téléphone lors de la connexion
create index if not exists idx_profiles_phone on public.profiles(phone);

-- 3. TABLE DES SIGNALEMENTS DE DECHETS (WASTE REPORTS)
create table public.waste_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  waste_type text not null,
  weight numeric(10, 2) not null,
  description text,
  location text,
  status text default 'en_attente' not null, -- 'en_attente', 'en_cours', 'complete', 'annule'
  points integer default 0 not null,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABLE DES RETRAITS DE RECOMPENSES (WITHDRAWALS)
create table public.withdrawals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  points_debited integer not null,
  amount_fcfa numeric(10, 2) not null,
  method text not null, -- 'Orange Money', 'Wave', 'Moov Money', 'Espèces'
  phone text not null,
  status text default 'complete' not null, -- 'complete', 'en_cours', 'annule'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TABLE DES PUBLICATIONS (COMMUNITY POSTS)
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  image text, -- URL ou base64
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. TABLE DES LIKES DE PUBLICATIONS
create table public.post_likes (
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (post_id, user_id)
);

-- 7. TABLE DES COMMENTAIRES DE PUBLICATIONS
create table public.post_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ====================================================================
-- TRIGGERS & FONCTIONS DE BASE DE DONNEES
-- ====================================================================

-- Trigger 1 : Création automatique du profil lors de l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, phone, points, balance, total_weight)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', ''),
    0,
    0.00,
    0.00
  );
  return new;
end;
$$ language plpgsql security definer;

-- Association du trigger à auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Trigger 2 : Recalcul automatique des points et de la balance de l'utilisateur
-- Prend en compte les gains (waste_reports) et les débits (withdrawals).
create or replace function public.update_profile_stats()
returns trigger as $$
declare
  target_user_id uuid;
begin
  -- Déterminer quel utilisateur mettre à jour
  if tg_op = 'DELETE' then
    target_user_id := old.user_id;
  else
    target_user_id := new.user_id;
  end if;

  update public.profiles
  set 
    total_weight = (
      select coalesce(sum(weight), 0.00)
      from public.waste_reports
      where user_id = target_user_id and status = 'complete'
    ),
    points = (
      select coalesce(sum(points), 0)
      from public.waste_reports
      where user_id = target_user_id and status = 'complete'
    ) - (
      select coalesce(sum(points_debited), 0)
      from public.withdrawals
      where user_id = target_user_id and status = 'complete'
    ),
    balance = (
      select coalesce(sum(points * 10), 0.00) -- Règle de gain : 1 point = 10 FCFA
      from public.waste_reports
      where user_id = target_user_id and status = 'complete'
    ) - (
      select coalesce(sum(amount_fcfa), 0.00) -- Règle de retrait : 1 point = 10 FCFA (soit points_debited * 10)
      from public.withdrawals
      where user_id = target_user_id and status = 'complete'
    )
  where id = target_user_id;

  return null;
end;
$$ language plpgsql security definer;

-- Association du trigger à waste_reports
drop trigger if exists on_waste_report_change on public.waste_reports;
create trigger on_waste_report_change
  after insert or update or delete on public.waste_reports
  for each row execute procedure public.update_profile_stats();

-- Association du trigger à withdrawals
drop trigger if exists on_withdrawal_change on public.withdrawals;
create trigger on_withdrawal_change
  after insert or update or delete on public.withdrawals
  for each row execute procedure public.update_profile_stats();

-- ====================================================================
-- SECURITE : ROW LEVEL SECURITY (RLS)
-- ====================================================================

alter table public.profiles enable row level security;
alter table public.waste_reports enable row level security;
alter table public.withdrawals enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;

-- Politiques pour PROFILES
create policy "Lecture publique de tous les profils" on public.profiles
  for select using (true);

create policy "Modification de son propre profil" on public.profiles
  for update using (auth.uid() = id);

-- Politiques pour WASTE_REPORTS
create policy "Les utilisateurs voient leurs propres rapports" on public.waste_reports
  for select using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent insérer leurs propres rapports" on public.waste_reports
  for insert with check (auth.uid() = user_id);

create policy "Les utilisateurs peuvent modifier leurs propres rapports" on public.waste_reports
  for update using (auth.uid() = user_id);

-- Politiques pour WITHDRAWALS
create policy "Les utilisateurs voient leurs propres retraits" on public.withdrawals
  for select using (auth.uid() = user_id);

create policy "Les utilisateurs peuvent insérer leurs propres retraits" on public.withdrawals
  for insert with check (auth.uid() = user_id);

-- Politiques pour POSTS
create policy "Lecture publique des posts" on public.posts
  for select using (true);

create policy "Les utilisateurs connectés peuvent insérer un post" on public.posts
  for insert with check (auth.uid() = user_id);

create policy "Les utilisateurs peuvent supprimer leurs propres posts" on public.posts
  for delete using (auth.uid() = user_id);

-- Politiques pour POST_LIKES
create policy "Lecture publique des likes" on public.post_likes
  for select using (true);

create policy "Les utilisateurs connectés peuvent liker" on public.post_likes
  for insert with check (auth.uid() = user_id);

create policy "Les utilisateurs connectés peuvent supprimer leur like" on public.post_likes
  for delete using (auth.uid() = user_id);

-- Politiques pour POST_COMMENTS
create policy "Lecture publique des commentaires" on public.post_comments
  for select using (true);

create policy "Les utilisateurs connectés peuvent commenter" on public.post_comments
  for insert with check (auth.uid() = user_id);
