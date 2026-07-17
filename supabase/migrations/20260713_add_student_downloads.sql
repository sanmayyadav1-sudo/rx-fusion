-- 1. Create student_profiles table (independent of auth.users for passwordless/OTP-less logins)
create table if not exists public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  course text not null,
  custom_course text,
  current_year text not null,
  college_name text not null,
  mobile_number text not null,
  email text not null unique,
  free_downloads_used integer not null default 0,
  download_limit integer not null default 2,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_seen timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Create note_downloads log table
create table if not exists public.note_downloads (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.student_profiles(id) on delete cascade not null,
  note_identifier text not null,
  note_title text,
  downloaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row-Level Security (RLS) on both tables
alter table public.student_profiles enable row level security;
alter table public.note_downloads enable row level security;

-- NOTE ON POLICIES:
-- Since all queries and transactions on student_profiles and note_downloads are 
-- executed securely on the server-side via Next.js API endpoints using the 
-- SUPABASE_SERVICE_ROLE_KEY, no public RLS policies (SELECT/INSERT/UPDATE) 
-- need to be defined. The service role client automatically bypasses RLS. 
-- This completely protects student details and download counters from being 
-- modified or read through client-side browser console injection.
