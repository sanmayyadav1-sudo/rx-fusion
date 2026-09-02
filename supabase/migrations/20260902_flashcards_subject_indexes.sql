-- =======================================================
-- MIGRATION: FLASHCARDS INDEXES & RLS SAFETY POLICIES
-- =======================================================

-- 1. Performance indexes for Flashcards lookup
create index if not exists idx_flashcards_year_subject on public.flashcards(year, subject);
create index if not exists idx_flashcards_course_year_subject on public.flashcards(course, year, subject);

-- 2. RLS Security policies for quiz attempts and student activity (if enabled)
alter table if exists public.quiz_attempts enable row level security;
alter table if exists public.student_recent_activity enable row level security;

-- Quiz attempts select/insert policies
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Students view own quiz attempts' and tablename = 'quiz_attempts') then
    create policy "Students view own quiz attempts"
      on public.quiz_attempts for select
      using (auth.uid() = student_id or public.is_admin());
  end if;
end $$;

-- Student recent activity select/insert policies
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Students view own recent activity' and tablename = 'student_recent_activity') then
    create policy "Students view own recent activity"
      on public.student_recent_activity for select
      using (auth.uid() = student_id or public.is_admin());
  end if;
end $$;
