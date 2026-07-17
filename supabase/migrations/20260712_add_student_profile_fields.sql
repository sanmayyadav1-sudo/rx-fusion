-- =======================================================
-- ADD STUDENT PROFILE FIELDS & PRIVILEGE ESCALATION SHIELD
-- =======================================================

-- 1. Add student profile fields to the existing profiles table
alter table public.profiles 
  add column if not exists full_name text,
  add column if not exists course text,
  add column if not exists custom_course text,
  add column if not exists current_year text,
  add column if not exists college_name text,
  add column if not exists mobile_number text;

-- 2. Create trigger function to shield the 'role' column from unauthorized client-side updates
create or replace function public.check_profile_role_update()
returns trigger as $$
begin
  -- Prevent role modification unless the active editor is an admin
  if new.role <> old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- 3. Bind the shield trigger
drop trigger if exists before_profile_update on public.profiles;
create trigger before_profile_update
  before update on public.profiles
  for each row execute procedure public.check_profile_role_update();
