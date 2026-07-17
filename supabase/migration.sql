-- =======================================================
-- ADD SUBJECTS TABLE AND LINK TO NOTES
-- =======================================================

-- 1. Create subjects table
create table public.subjects (
  id uuid default gen_random_uuid() primary key,
  course text not null check (course in ('Pharm D', 'B Pharm', 'D Pharm')),
  year_number integer not null check (year_number between 1 and 8),
  subject_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(course, year_number, subject_name)
);

-- 2. Alter notes table to add subject_id column
alter table public.notes add column subject_id uuid references public.subjects(id) on delete set null;

-- 3. Enable RLS on subjects
alter table public.subjects enable row level security;

-- 4. Create RLS policies for subjects table (using is_admin helper for security)
create policy "Public subjects are viewable by everyone" 
  on public.subjects for select 
  using (true);

create policy "Only admins can insert subjects" 
  on public.subjects for insert 
  with check (public.is_admin());

create policy "Only admins can delete subjects" 
  on public.subjects for delete 
  using (public.is_admin());

-- 5. Add index for performance on subject lookup
create index idx_subjects_course_year on public.subjects(course, year_number);
create index idx_notes_subject_id on public.notes(subject_id);
