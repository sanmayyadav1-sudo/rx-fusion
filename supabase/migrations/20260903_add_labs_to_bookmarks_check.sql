-- =======================================================
-- MIGRATION: ADD 'labs' TO BOOKMARKS & RECENT ACTIVITY CHECK CONSTRAINTS
-- =======================================================

-- 1. Drop existing constraint on student_bookmarks and add updated constraint including 'labs'
alter table public.student_bookmarks 
  drop constraint if exists student_bookmarks_content_type_check;

alter table public.student_bookmarks 
  add constraint student_bookmarks_content_type_check 
  check (content_type in ('notes', 'drugs', 'cases', 'blogs', 'colleges', 'viva', 'quiz', 'question_bank', 'question_papers', 'flashcards', 'labs'));

-- 2. Drop existing constraint on student_recent_activity and add updated constraint including 'labs'
alter table public.student_recent_activity 
  drop constraint if exists student_recent_activity_content_type_check;

alter table public.student_recent_activity 
  add constraint student_recent_activity_content_type_check 
  check (content_type in ('notes', 'drugs', 'cases', 'blogs', 'colleges', 'viva', 'quiz', 'question_bank', 'question_papers', 'flashcards', 'labs'));
