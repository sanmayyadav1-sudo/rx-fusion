-- =======================================================
-- MIGRATION: FLASHCARD COURSE HIERARCHY & FLEXIBLE CONSTRAINTS
-- =======================================================

-- 1. Ensure composite performance indexes for Flashcards lookup by course, year, subject
create index if not exists idx_flashcards_course_year_subject on public.flashcards(course, year, subject);
create index if not exists idx_flashcards_course_published on public.flashcards(course, is_published);

-- 2. Drop restrictive check constraints on course column if present to support all pharmacy courses (Pharm D, B Pharm, D Pharm, M Pharm, etc.)
do $$
begin
  -- Flashcards table constraint check
  if exists (
    select 1 from information_schema.constraint_column_usage 
    where table_name = 'flashcards' and column_name = 'course'
  ) then
    alter table public.flashcards drop constraint if exists flashcards_course_check;
  end if;
end $$;

-- 3. Verify RLS Policies for Flashcards
alter table if exists public.flashcards enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Published flashcards are viewable by everyone' and tablename = 'flashcards') then
    create policy "Published flashcards are viewable by everyone"
      on public.flashcards for select
      using (is_published = true or public.is_admin());
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Admins can do everything on flashcards' and tablename = 'flashcards') then
    create policy "Admins can do everything on flashcards"
      on public.flashcards for all
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;
