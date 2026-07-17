-- =======================================================
-- CREATE ANNOUNCEMENTS TABLE
-- =======================================================

-- 1. Create announcements table
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  message text not null,
  type text not null check (type in ('announcement', 'exam_update', 'new_notes', 'news_update', 'important_notice', 'event', 'general')) default 'announcement',
  banner_url text,
  button_text text,
  button_url text,
  pdf_url text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  priority text not null check (priority in ('high', 'medium', 'low')) default 'medium',
  is_active boolean not null default true,
  auto_hide_duration integer, -- in seconds
  show_once_per_session boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.announcements enable row level security;

-- 3. Create RLS Policies
drop policy if exists "Announcements are viewable by everyone" on public.announcements;
create policy "Announcements are viewable by everyone"
  on public.announcements for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admins can do everything on announcements" on public.announcements;
create policy "Admins can do everything on announcements"
  on public.announcements for all
  using (public.is_admin());

-- 4. Performance Indexes
create index if not exists idx_announcements_is_active on public.announcements(is_active);
create index if not exists idx_announcements_priority on public.announcements(priority);
create index if not exists idx_announcements_dates on public.announcements(start_date, end_date);
create index if not exists idx_announcements_created_at on public.announcements(created_at);
