-- =======================================================
-- STUDENT INTERACTIONS: BOOKMARKS & RECENT ACTIVITY
-- =======================================================

-- 1. Create student bookmarks table
create table if not exists public.student_bookmarks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.student_profiles(id) on delete cascade not null,
  content_type text not null check (content_type in ('notes', 'drugs', 'cases', 'blogs', 'colleges', 'viva', 'quiz', 'question_bank', 'question_papers', 'flashcards')),
  content_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, content_type, content_id)
);

-- 2. Create student recent activity table
create table if not exists public.student_recent_activity (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.student_profiles(id) on delete cascade not null,
  content_type text not null check (content_type in ('notes', 'drugs', 'cases', 'blogs', 'colleges', 'viva', 'quiz', 'question_bank', 'question_papers', 'flashcards')),
  content_id text not null,
  content_title text not null,
  content_url text not null,
  viewed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, content_type, content_id)
);

-- Enable Row-Level Security
alter table public.student_bookmarks enable row level security;
alter table public.student_recent_activity enable row level security;

-- Indexes for performance
create index if not exists idx_student_bookmarks_student_id on public.student_bookmarks(student_id);
create index if not exists idx_student_recent_activity_student_id on public.student_recent_activity(student_id);
create index if not exists idx_student_recent_activity_viewed_at on public.student_recent_activity(viewed_at desc);

-- Since these tables are queried via Next.js API endpoints on the server-side
-- using the service role key, no client-side RLS policies are needed.
