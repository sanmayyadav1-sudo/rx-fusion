-- =======================================================
-- MIGRATION: FIX ADMIN RLS POLICIES WITH CHECK CLAUSES
-- (Safe: skips tables that don't exist yet)
-- =======================================================

-- 1. quiz_questions
do $$ begin
  drop policy if exists "Admins can do everything on quiz_questions" on public.quiz_questions;
  create policy "Admins can do everything on quiz_questions"
    on public.quiz_questions for all
    using (public.is_admin())
    with check (public.is_admin());
exception when undefined_table then
  raise notice 'Table quiz_questions does not exist, skipping.';
end $$;

-- 2. quiz_attempts
do $$ begin
  drop policy if exists "Admins can do everything on quiz_attempts" on public.quiz_attempts;
  create policy "Admins can do everything on quiz_attempts"
    on public.quiz_attempts for all
    using (public.is_admin())
    with check (public.is_admin());
exception when undefined_table then
  raise notice 'Table quiz_attempts does not exist, skipping.';
end $$;

-- 3. question_bank
do $$ begin
  drop policy if exists "Admins can do everything on question_bank" on public.question_bank;
  create policy "Admins can do everything on question_bank"
    on public.question_bank for all
    using (public.is_admin())
    with check (public.is_admin());
exception when undefined_table then
  raise notice 'Table question_bank does not exist, skipping.';
end $$;

-- 4. question_papers
do $$ begin
  drop policy if exists "Admins can do everything on question_papers" on public.question_papers;
  create policy "Admins can do everything on question_papers"
    on public.question_papers for all
    using (public.is_admin())
    with check (public.is_admin());
exception when undefined_table then
  raise notice 'Table question_papers does not exist, skipping.';
end $$;

-- 5. flashcards
do $$ begin
  drop policy if exists "Admins can do everything on flashcards" on public.flashcards;
  create policy "Admins can do everything on flashcards"
    on public.flashcards for all
    using (public.is_admin())
    with check (public.is_admin());
exception when undefined_table then
  raise notice 'Table flashcards does not exist, skipping.';
end $$;

-- 6. lab_manuals
do $$ begin
  drop policy if exists "Admins can do everything on lab_manuals" on public.lab_manuals;
  create policy "Admins can do everything on lab_manuals"
    on public.lab_manuals for all
    using (public.is_admin())
    with check (public.is_admin());
exception when undefined_table then
  raise notice 'Table lab_manuals does not exist, skipping.';
end $$;

-- 7. viva_questions
do $$ begin
  drop policy if exists "Admins can do everything on viva_questions" on public.viva_questions;
  create policy "Admins can do everything on viva_questions"
    on public.viva_questions for all
    using (public.is_admin())
    with check (public.is_admin());
exception when undefined_table then
  raise notice 'Table viva_questions does not exist, skipping.';
end $$;

-- 8. colleges
do $$ begin
  drop policy if exists "Admins can do everything on colleges" on public.colleges;
  create policy "Admins can do everything on colleges"
    on public.colleges for all
    using (public.is_admin())
    with check (public.is_admin());
exception when undefined_table then
  raise notice 'Table colleges does not exist, skipping.';
end $$;

-- 9. college_courses
do $$ begin
  drop policy if exists "Admins can do everything on college_courses" on public.college_courses;
  create policy "Admins can do everything on college_courses"
    on public.college_courses for all
    using (public.is_admin())
    with check (public.is_admin());
exception when undefined_table then
  raise notice 'Table college_courses does not exist, skipping.';
end $$;
