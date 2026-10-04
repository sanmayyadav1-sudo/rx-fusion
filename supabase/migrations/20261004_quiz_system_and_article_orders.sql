-- =======================================================
-- RXFUSION: YEAR-WISE QUIZZES, DAILY QUIZZES & ARTICLE ORDERS MIGRATION
-- Official Support Email: rxfusion.support@gmail.com
-- =======================================================

-- 1. Create quizzes table
create table if not exists public.quizzes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  academic_year text not null check (academic_year in ('1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year')),
  subject text not null,
  topic text,
  description text,
  difficulty text not null default 'Medium' check (difficulty in ('Easy', 'Medium', 'Hard')),
  quiz_date date not null default current_date,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  time_limit_mins integer not null default 15,
  passing_percentage integer not null default 50 check (passing_percentage between 1 and 100),
  status text not null default 'draft' check (status in ('draft', 'published', 'scheduled', 'closed')),
  is_daily boolean not null default false,
  is_leaderboard_enabled boolean not null default true,
  allow_multiple_attempts boolean not null default false,
  author text not null default 'RxFusion Admin',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Alter quiz_questions to support quiz linking and ordering
alter table public.quiz_questions 
  add column if not exists quiz_id uuid references public.quizzes(id) on delete cascade,
  add column if not exists image_url text,
  add column if not exists marks integer default 1,
  add column if not exists difficulty text default 'Medium' check (difficulty in ('Easy', 'Medium', 'Hard')),
  add column if not exists order_index integer default 0;

-- 3. Create quiz_student_attempts for full session submissions & analytics
create table if not exists public.quiz_student_attempts (
  id uuid default gen_random_uuid() primary key,
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  student_id uuid references public.student_profiles(id) on delete set null,
  student_name text not null,
  academic_year text not null,
  quiz_date date not null,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  time_taken_seconds integer not null default 0,
  score numeric not null default 0,
  total_marks numeric not null default 0,
  percentage numeric not null default 0,
  correct_count integer not null default 0,
  incorrect_count integer not null default 0,
  total_questions integer not null default 0,
  status text not null default 'completed' check (status in ('completed', 'timed_out')),
  responses jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create article_orders table
create table if not exists public.article_orders (
  id uuid default gen_random_uuid() primary key,
  order_number text not null unique,
  service_type text not null check (service_type in ('Review Article', 'Research Article / Research Paper')),
  name text not null,
  email text not null,
  mobile text not null,
  topic text not null,
  course text not null,
  institution text not null,
  word_count integer not null,
  references_count integer not null,
  citation_style text not null check (citation_style in ('Vancouver', 'APA', 'Other')),
  deadline text not null,
  target_journal text,
  additional_requirements text,
  brief text,
  status text not null default 'New' check (status in ('New', 'Contacted', 'In Progress', 'Waiting for Information', 'Completed', 'Cancelled')),
  internal_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Enable Row-Level Security
alter table public.quizzes enable row level security;
alter table public.quiz_student_attempts enable row level security;
alter table public.article_orders enable row level security;

-- Quizzes policies
create policy "Published quizzes are viewable by everyone"
  on public.quizzes for select
  using (status = 'published' or public.is_admin());

create policy "Admins can do everything on quizzes"
  on public.quizzes for all
  using (public.is_admin())
  with check (public.is_admin());

-- Quiz questions policy update (for linked quizzes)
drop policy if exists "Published quiz questions are viewable by everyone" on public.quiz_questions;
create policy "Published quiz questions are viewable by everyone"
  on public.quiz_questions for select
  using (is_published = true or public.is_admin());

-- Attempts policies
create policy "Students can view their own attempts or public leaderboard data"
  on public.quiz_student_attempts for select
  using (true);

create policy "Anyone can insert quiz attempts"
  on public.quiz_student_attempts for insert
  with check (true);

create policy "Admins can do everything on quiz_student_attempts"
  on public.quiz_student_attempts for all
  using (public.is_admin())
  with check (public.is_admin());

-- Article orders policies
create policy "Anyone can insert article orders"
  on public.article_orders for insert
  with check (true);

create policy "Admins can do everything on article_orders"
  on public.article_orders for all
  using (public.is_admin())
  with check (public.is_admin());

-- 6. Performance Indexes
create index if not exists idx_quizzes_year_status on public.quizzes(academic_year, status);
create index if not exists idx_quizzes_date_daily on public.quizzes(quiz_date, is_daily);
create index if not exists idx_quiz_questions_quiz_id on public.quiz_questions(quiz_id);
create index if not exists idx_quiz_questions_order on public.quiz_questions(quiz_id, order_index);
create index if not exists idx_quiz_student_attempts_quiz on public.quiz_student_attempts(quiz_id);
create index if not exists idx_quiz_student_attempts_student on public.quiz_student_attempts(student_id);
create index if not exists idx_quiz_student_attempts_year_date on public.quiz_student_attempts(academic_year, quiz_date);
create index if not exists idx_article_orders_status on public.article_orders(status);
create index if not exists idx_article_orders_created on public.article_orders(created_at desc);
