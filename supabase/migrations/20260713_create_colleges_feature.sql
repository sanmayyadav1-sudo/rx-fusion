-- =======================================================
-- COLLEGES FEATURE SCHEMA
-- =======================================================

-- Create Colleges Table
create table if not exists public.colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text null,
  overview text null,
  city text not null,
  state text not null,
  college_type text null,
  logo_url text null,
  address text null,
  official_website text null,
  admission_website text null,
  contact_number text null,
  admission_email text null,
  admission_status text not null default 'not_updated',
  admission_session text null,
  eligibility text null,
  admission_process text null,
  entrance_exam text null,
  fees_information text null,
  hostel_information text null,
  clinical_training_information text null,
  placement_information text null,
  pci_status text not null default 'not_verified',
  pci_reference_url text null,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Create College Courses Table
create table if not exists public.college_courses (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  course_name text not null,
  course_duration text null,
  intake text null,
  course_fee text null,
  eligibility text null,
  is_active boolean not null default true,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table public.colleges enable row level security;
alter table public.college_courses enable row level security;

-- Drop existing policies if they exist (for idempotency)
drop policy if exists "Published colleges are viewable by everyone" on public.colleges;
drop policy if exists "Admins can do everything on colleges" on public.colleges;
drop policy if exists "Courses of published colleges are viewable by everyone" on public.college_courses;
drop policy if exists "Admins can do everything on college_courses" on public.college_courses;

-- Colleges Policies
create policy "Published colleges are viewable by everyone"
  on public.colleges for select
  using (is_published = true or public.is_admin());

create policy "Admins can do everything on colleges"
  on public.colleges for all
  using (public.is_admin());

-- College Courses Policies
create policy "Courses of published colleges are viewable by everyone"
  on public.college_courses for select
  using (
    exists (
      select 1 from public.colleges
      where colleges.id = college_courses.college_id
      and (colleges.is_published = true or public.is_admin())
    )
  );

create policy "Admins can do everything on college_courses"
  on public.college_courses for all
  using (public.is_admin());

-- Indexes for performance
create index if not exists idx_colleges_slug on public.colleges(slug);
create index if not exists idx_colleges_is_published on public.colleges(is_published);
create index if not exists idx_colleges_is_featured on public.colleges(is_featured);
create index if not exists idx_college_courses_college_id on public.college_courses(college_id);

-- Storage bucket configuration for college logos
insert into storage.buckets (id, name, public)
values ('college-logos', 'college-logos', true)
on conflict (id) do nothing;

-- Drop storage policies if they exist
drop policy if exists "Public college logos read access" on storage.objects;
drop policy if exists "Admin college logos insert access" on storage.objects;
drop policy if exists "Admin college logos update access" on storage.objects;
drop policy if exists "Admin college logos delete access" on storage.objects;

-- Storage Read Policy for college-logos
create policy "Public college logos read access"
  on storage.objects for select
  using (bucket_id = 'college-logos');

-- Storage Write Policies for admin users
create policy "Admin college logos insert access"
  on storage.objects for insert
  with check (bucket_id = 'college-logos' and public.is_admin());

create policy "Admin college logos update access"
  on storage.objects for update
  using (bucket_id = 'college-logos' and public.is_admin());

create policy "Admin college logos delete access"
  on storage.objects for delete
  using (bucket_id = 'college-logos' and public.is_admin());

-- =======================================================
-- INITIAL SEED RECORDS (Conflict-Safe)
-- =======================================================
insert into public.colleges (name, slug, city, state, admission_status, pci_status, is_featured, is_published, display_order)
values
  ('Manipal College of Pharmaceutical Sciences', 'manipal-college-of-pharmaceutical-sciences', 'Manipal', 'Karnataka', 'not_updated', 'not_verified', true, true, 1),
  ('JSS College of Pharmacy, Mysuru', 'jss-college-of-pharmacy-mysuru', 'Mysuru', 'Karnataka', 'not_updated', 'not_verified', true, true, 2),
  ('JSS College of Pharmacy, Ooty', 'jss-college-of-pharmacy-ooty', 'Ooty', 'Tamil Nadu', 'not_updated', 'not_verified', true, true, 3),
  ('Poona College of Pharmacy', 'poona-college-of-pharmacy', 'Pune', 'Maharashtra', 'not_updated', 'not_verified', false, true, 4),
  ('Bombay College of Pharmacy', 'bombay-college-of-pharmacy', 'Mumbai', 'Maharashtra', 'not_updated', 'not_verified', false, true, 5),
  ('Bharati Vidyapeeth College of Pharmacy', 'bharati-vidyapeeth-college-of-pharmacy', 'Kolhapur', 'Maharashtra', 'not_updated', 'not_verified', false, true, 6),
  ('Tatyasaheb Kore College of Pharmacy', 'tatyasaheb-kore-college-of-pharmacy', 'Warananagar', 'Maharashtra', 'not_updated', 'not_verified', false, true, 7),
  ('Sinhgad College of Pharmacy', 'sinhgad-college-of-pharmacy', 'Pune', 'Maharashtra', 'not_updated', 'not_verified', false, true, 8),
  ('Dr. D. Y. Patil College of Pharmacy', 'dr-d-y-patil-college-of-pharmacy', 'Pune', 'Maharashtra', 'not_updated', 'not_verified', false, true, 9),
  ('AISSMS College of Pharmacy', 'aissms-college-of-pharmacy', 'Pune', 'Maharashtra', 'not_updated', 'not_verified', false, true, 10),
  ('Al-Ameen College of Pharmacy', 'al-ameen-college-of-pharmacy', 'Bengaluru', 'Karnataka', 'not_updated', 'not_verified', false, true, 11),
  ('N.G.S.M. Institute of Pharmaceutical Sciences', 'n-g-s-m-institute-of-pharmaceutical-sciences', 'Mangaluru', 'Karnataka', 'not_updated', 'not_verified', false, true, 12),
  ('KLE College of Pharmacy', 'kle-college-of-pharmacy', 'Belagavi', 'Karnataka', 'not_updated', 'not_verified', false, true, 13),
  ('PSG College of Pharmacy', 'psg-college-of-pharmacy', 'Coimbatore', 'Tamil Nadu', 'not_updated', 'not_verified', false, true, 14),
  ('SRM College of Pharmacy', 'srm-college-of-pharmacy', 'Chennai', 'Tamil Nadu', 'not_updated', 'not_verified', false, true, 15),
  ('Amrita School of Pharmacy', 'amrita-school-of-pharmacy', 'Kochi', 'Kerala', 'not_updated', 'not_verified', false, true, 16),
  ('Andhra University College of Pharmaceutical Sciences', 'andhra-university-college-of-pharmaceutical-sciences', 'Visakhapatnam', 'Andhra Pradesh', 'not_updated', 'not_verified', false, true, 17),
  ('Annamalai University Department of Pharmacy', 'annamalai-university-department-of-pharmacy', 'Chidambaram', 'Tamil Nadu', 'not_updated', 'not_verified', false, true, 18),
  ('Sri Ramachandra Faculty of Pharmacy', 'sri-ramachandra-faculty-of-pharmacy', 'Chennai', 'Tamil Nadu', 'not_updated', 'not_verified', false, true, 19),
  ('Nirma University Institute of Pharmacy', 'nirma-university-institute-of-pharmacy', 'Ahmedabad', 'Gujarat', 'not_updated', 'not_verified', false, true, 20),
  ('L. M. College of Pharmacy', 'l-m-college-of-pharmacy', 'Ahmedabad', 'Gujarat', 'not_updated', 'not_verified', false, true, 21),
  ('Ramanbhai Patel College of Pharmacy', 'ramanbhai-patel-college-of-pharmacy', 'Changa', 'Gujarat', 'not_updated', 'not_verified', false, true, 22),
  ('ISF College of Pharmacy', 'isf-college-of-pharmacy', 'Moga', 'Punjab', 'not_updated', 'not_verified', false, true, 23),
  ('Chitkara College of Pharmacy', 'chitkara-college-of-pharmacy', 'Rajpura', 'Punjab', 'not_updated', 'not_verified', false, true, 24),
  ('Shoolini University School of Pharmaceutical Sciences', 'shoolini-university-school-of-pharmaceutical-sciences', 'Solan', 'Himachal Pradesh', 'not_updated', 'not_verified', false, true, 25),
  ('Lovely Professional University School of Pharmaceutical Sciences', 'lovely-professional-university-school-of-pharmaceutical-sciences', 'Phagwara', 'Punjab', 'not_updated', 'not_verified', false, true, 26),
  ('Jaipur National University School of Pharmaceutical Sciences', 'jaipur-national-university-school-of-pharmaceutical-sciences', 'Jaipur', 'Rajasthan', 'not_updated', 'not_verified', false, true, 27),
  ('NIMS Institute of Pharmacy', 'nims-institute-of-pharmacy', 'Jaipur', 'Rajasthan', 'not_updated', 'not_verified', false, true, 28),
  ('GITAM School of Pharmacy', 'gitam-school-of-pharmacy', 'Visakhapatnam', 'Andhra Pradesh', 'not_updated', 'not_verified', false, true, 29),
  ('M.S. Ramaiah University of Applied Sciences – Faculty of Pharmacy', 'ms-ramaiah-university-of-applied-sciences-faculty-of-pharmacy', 'Bengaluru', 'Karnataka', 'not_updated', 'not_verified', false, true, 30)
on conflict (slug) do nothing;
