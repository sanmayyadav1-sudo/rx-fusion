-- =======================================================
-- CREATE VIVA QUESTIONS TABLE AND RLS POLICIES
-- =======================================================

-- 1. Create viva_questions table
create table if not exists public.viva_questions (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  answer text not null,
  subject text not null,
  year integer not null,
  course text not null,
  category text not null default 'General',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.viva_questions enable row level security;

-- 3. Create RLS Policies
drop policy if exists "Viva questions are viewable by everyone" on public.viva_questions;
create policy "Viva questions are viewable by everyone"
  on public.viva_questions for select
  using (true);

drop policy if exists "Admins can do everything on viva_questions" on public.viva_questions;
create policy "Admins can do everything on viva_questions"
  on public.viva_questions for all
  using (public.is_admin());

-- 4. Performance Indexes
create index if not exists idx_viva_questions_course on public.viva_questions(course);
create index if not exists idx_viva_questions_subject on public.viva_questions(subject);
create index if not exists idx_viva_questions_year on public.viva_questions(year);
