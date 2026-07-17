-- =======================================================
-- CREATE DRUG OF THE DAY AND CLINICAL CASES TABLES
-- =======================================================

-- 1. Create drug_of_the_day table
create table if not exists public.drug_of_the_day (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  drug_name text not null,
  generic_name text not null,
  drug_class text not null,
  image_url text,
  moa text,
  uses text,
  side_effects text,
  contraindications text,
  interactions text,
  clinical_pearl text,
  viva_questions text,
  exam_point text,
  status text not null check (status in ('draft', 'published', 'scheduled')) default 'draft',
  author text not null default 'RxFusion Admin',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create clinical_cases table
create table if not exists public.clinical_cases (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  department text not null,
  disease text not null,
  age integer not null,
  gender text not null,
  chief_complaint text,
  history text,
  medication_history text,
  findings text,
  diagnosis text,
  treatment text,
  monitoring text,
  outcome text,
  subjective text,
  objective text,
  assessment text,
  plan text,
  discussion text,
  learning_points text,
  attachments text[], -- Array of attachment URLs
  status text not null check (status in ('draft', 'published')) default 'draft',
  author text not null default 'RxFusion Admin',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS
alter table public.drug_of_the_day enable row level security;
alter table public.clinical_cases enable row level security;

-- 4. Create RLS Policies for drug_of_the_day
drop policy if exists "Drugs are viewable by everyone" on public.drug_of_the_day;
create policy "Drugs are viewable by everyone" 
  on public.drug_of_the_day for select 
  using (status = 'published' or status = 'scheduled' or public.is_admin());

drop policy if exists "Admins can do everything on drug_of_the_day" on public.drug_of_the_day;
create policy "Admins can do everything on drug_of_the_day"
  on public.drug_of_the_day for all
  using (public.is_admin());

-- 5. Create RLS Policies for clinical_cases
drop policy if exists "Cases are viewable by everyone" on public.clinical_cases;
create policy "Cases are viewable by everyone" 
  on public.clinical_cases for select 
  using (status = 'published' or public.is_admin());

drop policy if exists "Admins can do everything on clinical_cases" on public.clinical_cases;
create policy "Admins can do everything on clinical_cases"
  on public.clinical_cases for all
  using (public.is_admin());

-- 6. Performance Indexes
create index if not exists idx_drug_of_the_day_slug on public.drug_of_the_day(slug);
create index if not exists idx_drug_of_the_day_status on public.drug_of_the_day(status);
create index if not exists idx_clinical_cases_slug on public.clinical_cases(slug);
create index if not exists idx_clinical_cases_status on public.clinical_cases(status);
