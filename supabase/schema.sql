-- =======================================================
-- RXFUSION DATABASE SCHEMA
-- =======================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Clean tables (optional, for safety)
-- drop table if exists public.contact_messages cascade;
-- drop table if exists public.downloads cascade;
-- drop table if exists public.resources cascade;
-- drop table if exists public.news cascade;
-- drop table if exists public.blogs cascade;
-- drop table if exists public.notes cascade;
-- drop table if exists public.categories cascade;
-- drop table if exists public.profiles cascade;

-- =======================================================
-- 1. PROFILES TABLE (Linked to Auth.Users)
-- =======================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- =======================================================
-- 2. CATEGORIES TABLE
-- =======================================================
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  type text not null check (type in ('notes', 'blogs', 'resources')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;

-- =======================================================
-- 3. NOTES TABLE
-- =======================================================
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  course text not null check (course in ('Pharm D', 'B Pharm', 'D Pharm')),
  semester integer not null,
  subject text not null,
  file_url text not null,
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notes enable row level security;

-- =======================================================
-- 4. BLOGS TABLE
-- =======================================================
create table public.blogs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  featured_image text,
  content text not null,
  author text not null default 'RxFusion Admin',
  category_id uuid references public.categories(id) on delete set null,
  published_date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.blogs enable row level security;

-- =======================================================
-- 5. NEWS TABLE
-- =======================================================
create table public.news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  source text,
  published_date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.news enable row level security;

-- =======================================================
-- 6. RESOURCES TABLE
-- =======================================================
create table public.resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  file_url text not null,
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.resources enable row level security;

-- =======================================================
-- 7. DOWNLOADS TABLE
-- =======================================================
create table public.downloads (
  id uuid default gen_random_uuid() primary key,
  note_id uuid references public.notes(id) on delete cascade not null,
  downloaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.downloads enable row level security;

-- =======================================================
-- 8. CONTACT MESSAGES TABLE
-- =======================================================
create table public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.contact_messages enable row level security;


-- =======================================================
-- HELPER FUNCTIONS & TRIGGERS
-- =======================================================

-- Helper to check if current request user is an admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    -- If first user, make them admin, otherwise default user (or manually override in console)
    case 
      when not exists (select 1 from public.profiles) then 'admin'
      else 'user'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =======================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =======================================================

-- Profiles Policies
create policy "Public profiles are viewable by owner and admin" 
  on public.profiles for select 
  using (auth.uid() = id or public.is_admin());

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Admins can do everything on profiles"
  on public.profiles for all
  using (public.is_admin());

-- Categories Policies
create policy "Categories are viewable by everyone" 
  on public.categories for select 
  using (true);

create policy "Admins can insert categories" 
  on public.categories for insert 
  with check (public.is_admin());

create policy "Admins can update categories" 
  on public.categories for update 
  using (public.is_admin());

create policy "Admins can delete categories" 
  on public.categories for delete 
  using (public.is_admin());

-- Notes Policies
create policy "Notes are viewable by everyone" 
  on public.notes for select 
  using (true);

create policy "Admins can insert notes" 
  on public.notes for insert 
  with check (public.is_admin());

create policy "Admins can update notes" 
  on public.notes for update 
  using (public.is_admin());

create policy "Admins can delete notes" 
  on public.notes for delete 
  using (public.is_admin());

-- Blogs Policies
create policy "Blogs are viewable by everyone" 
  on public.blogs for select 
  using (true);

create policy "Admins can insert blogs" 
  on public.blogs for insert 
  with check (public.is_admin());

create policy "Admins can update blogs" 
  on public.blogs for update 
  using (public.is_admin());

create policy "Admins can delete blogs" 
  on public.blogs for delete 
  using (public.is_admin());

-- News Policies
create policy "News is viewable by everyone" 
  on public.news for select 
  using (true);

create policy "Admins can insert news" 
  on public.news for insert 
  with check (public.is_admin());

create policy "Admins can update news" 
  on public.news for update 
  using (public.is_admin());

create policy "Admins can delete news" 
  on public.news for delete 
  using (public.is_admin());

-- Resources Policies
create policy "Resources are viewable by everyone" 
  on public.resources for select 
  using (true);

create policy "Admins can insert resources" 
  on public.resources for insert 
  with check (public.is_admin());

create policy "Admins can update resources" 
  on public.resources for update 
  using (public.is_admin());

create policy "Admins can delete resources" 
  on public.resources for delete 
  using (public.is_admin());

-- Downloads Policies
create policy "Anyone can insert download logs" 
  on public.downloads for insert 
  with check (true);

create policy "Admins can view download logs" 
  on public.downloads for select 
  using (public.is_admin());

-- Contact Messages Policies
create policy "Anyone can insert contact messages" 
  on public.contact_messages for insert 
  with check (true);

create policy "Admins can view contact messages" 
  on public.contact_messages for select 
  using (public.is_admin());

create policy "Admins can delete contact messages" 
  on public.contact_messages for delete 
  using (public.is_admin());


-- =======================================================
-- INDEXES FOR PERFORMANCE
-- =======================================================
create index idx_categories_slug on public.categories(slug);
create index idx_categories_type on public.categories(type);
create index idx_notes_course_semester on public.notes(course, semester);
create index idx_notes_category_id on public.notes(category_id);
create index idx_blogs_slug on public.blogs(slug);
create index idx_blogs_category_id on public.blogs(category_id);
create index idx_resources_category_id on public.resources(category_id);
create index idx_downloads_note_id on public.downloads(note_id);


-- =======================================================
-- STORAGE BUCKETS SETUP & POLICIES
-- =======================================================

-- Create Buckets
insert into storage.buckets (id, name, public)
values 
  ('notes', 'notes', true),
  ('blogs', 'blogs', true),
  ('news', 'news', true),
  ('resources', 'resources', true),
  ('images', 'images', true)
on conflict (id) do nothing;

-- Storage Read Policy for public buckets
create policy "Public buckets read access"
  on storage.objects for select
  using (bucket_id in ('notes', 'blogs', 'news', 'resources', 'images'));

-- Storage Write Policy for admin users
create policy "Admin buckets write access"
  on storage.objects for insert
  with check (bucket_id in ('notes', 'blogs', 'news', 'resources', 'images') and public.is_admin());

create policy "Admin buckets update access"
  on storage.objects for update
  using (bucket_id in ('notes', 'blogs', 'news', 'resources', 'images') and public.is_admin());

create policy "Admin buckets delete access"
  on storage.objects for delete
  using (bucket_id in ('notes', 'blogs', 'news', 'resources', 'images') and public.is_admin());


-- =======================================================
-- 9. SUBJECTS TABLE (Linked to Notes)
-- =======================================================
create table public.subjects (
  id uuid default gen_random_uuid() primary key,
  course text not null check (course in ('Pharm D', 'B Pharm', 'D Pharm')),
  year_number integer not null check (year_number between 1 and 8),
  subject_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(course, year_number, subject_name)
);

alter table public.notes add column subject_id uuid references public.subjects(id) on delete set null;

alter table public.subjects enable row level security;

create policy "Public subjects are viewable by everyone" 
  on public.subjects for select 
  using (true);

create policy "Only admins can insert subjects" 
  on public.subjects for insert 
  with check (public.is_admin());

create policy "Only admins can delete subjects" 
  on public.subjects for delete 
  using (public.is_admin());

create index idx_subjects_course_year on public.subjects(course, year_number);
create index idx_notes_subject_id on public.notes(subject_id);


-- =======================================================
-- 10. DRUG OF THE DAY TABLE
-- =======================================================
create table public.drug_of_the_day (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  drug_name text not null,
  generic_name text not null,
  drug_class text not null,
  image_url text,
  moa text,
  uses text,
  side_effects text,
  contraindications text,
  interactions text,
  clinical_pearl text,
  viva_questions text,
  exam_point text,
  status text not null check (status in ('draft', 'published', 'scheduled')) default 'draft',
  author text not null default 'RxFusion Admin',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.drug_of_the_day enable row level security;

create policy "Drugs are viewable by everyone" 
  on public.drug_of_the_day for select 
  using (status = 'published' or status = 'scheduled' or public.is_admin());

create policy "Admins can do everything on drug_of_the_day"
  on public.drug_of_the_day for all
  using (public.is_admin());

create index idx_drug_of_the_day_slug on public.drug_of_the_day(slug);
create index idx_drug_of_the_day_status on public.drug_of_the_day(status);


-- =======================================================
-- 11. CLINICAL CASES TABLE
-- =======================================================
create table public.clinical_cases (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  department text not null,
  disease text not null,
  age integer not null,
  gender text not null,
  chief_complaint text,
  history text,
  medication_history text,
  findings text,
  diagnosis text,
  treatment text,
  monitoring text,
  outcome text,
  subjective text,
  objective text,
  assessment text,
  plan text,
  discussion text,
  learning_points text,
  attachments text[],
  status text not null check (status in ('draft', 'published')) default 'draft',
  author text not null default 'RxFusion Admin',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.clinical_cases enable row level security;

create policy "Cases are viewable by everyone" 
  on public.clinical_cases for select 
  using (status = 'published' or public.is_admin());

create policy "Admins can do everything on clinical_cases"
  on public.clinical_cases for all
  using (public.is_admin());

create index idx_clinical_cases_slug on public.clinical_cases(slug);
create index idx_clinical_cases_status on public.clinical_cases(status);


-- =======================================================
-- 12. ANNOUNCEMENTS TABLE
-- =======================================================
create table public.announcements (
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
  auto_hide_duration integer,
  show_once_per_session boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.announcements enable row level security;

create policy "Announcements are viewable by everyone" 
  on public.announcements for select 
  using (is_active = true or public.is_admin());

create policy "Admins can do everything on announcements"
  on public.announcements for all
  using (public.is_admin());

create index idx_announcements_is_active on public.announcements(is_active);
create index idx_announcements_priority on public.announcements(priority);
create index idx_announcements_dates on public.announcements(start_date, end_date);
create index idx_announcements_created_at on public.announcements(created_at);
