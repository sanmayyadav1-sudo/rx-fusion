-- =======================================================
-- CREATE LAB MANUALS TABLE AND RLS POLICIES
-- =======================================================

-- 1. Create lab_manuals table
create table if not exists public.lab_manuals (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  experiment_number text,
  aim text not null,
  requirements text,
  principle text,
  procedure text,
  observations text,
  calculations text,
  results text,
  subject text not null,
  year integer not null,
  course text not null,
  category text not null default 'General',
  file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.lab_manuals enable row level security;

-- 3. Create RLS Policies
drop policy if exists "Lab manuals are viewable by everyone" on public.lab_manuals;
create policy "Lab manuals are viewable by everyone"
  on public.lab_manuals for select
  using (true);

drop policy if exists "Admins can do everything on lab_manuals" on public.lab_manuals;
create policy "Admins can do everything on lab_manuals"
  on public.lab_manuals for all
  using (public.is_admin());

-- 4. Performance Indexes
create index if not exists idx_lab_manuals_course on public.lab_manuals(course);
create index if not exists idx_lab_manuals_subject on public.lab_manuals(subject);
create index if not exists idx_lab_manuals_year on public.lab_manuals(year);
