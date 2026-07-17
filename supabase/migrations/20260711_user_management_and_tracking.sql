-- =======================================================
-- USER MANAGEMENT & LIVE ACTIVE USER TRACKING MIGRATION
-- =======================================================

-- 1. Create user_activity table
create table if not exists public.user_activity (
  user_id uuid references auth.users on delete cascade primary key,
  email text not null,
  last_seen timestamp with time zone default timezone('utc'::text, now()),
  last_login_at timestamp with time zone default timezone('utc'::text, now()),
  login_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Establish foreign key relationship to profiles for query resolver convenience
alter table public.user_activity 
  drop constraint if exists user_activity_user_id_profiles_fkey,
  add constraint user_activity_user_id_profiles_fkey 
  foreign key (user_id) references public.profiles(id) on delete cascade;

-- Enable RLS
alter table public.user_activity enable row level security;

-- 2. Define RLS Policies for user_activity
create policy "Admins can do everything on user_activity"
  on public.user_activity for all
  using (public.is_admin());

create policy "Users can read their own activity"
  on public.user_activity for select
  using (auth.uid() = user_id);

-- 3. Modify handle_new_user() trigger function to also initialize user_activity
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insert profile
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case 
      when not exists (select 1 from public.profiles) then 'admin'
      else 'user'
    end
  );

  -- Insert initial user activity
  insert into public.user_activity (user_id, email, last_seen, last_login_at, login_count, created_at, updated_at)
  values (
    new.id,
    new.email,
    now(),
    now(),
    0, -- login_count starts at 0, incremented upon verification
    now(),
    now()
  );

  return new;
end;
$$ language plpgsql security definer;

-- 4. Create secure atomic function to increment login count upon genuine OTP verification
create or replace function public.increment_login_count(user_id_arg uuid)
returns void as $$
begin
  if auth.uid() = user_id_arg then
    insert into public.user_activity (user_id, email, last_login_at, login_count, last_seen, updated_at)
    values (
      user_id_arg,
      (select email from auth.users where id = user_id_arg),
      now(),
      1,
      now(),
      now()
    )
    on conflict (user_id) do update set
      login_count = public.user_activity.login_count + 1,
      last_login_at = now(),
      last_seen = now(),
      updated_at = now();
  end if;
end;
$$ language plpgsql security definer;

-- 5. Create secure atomic function to update last seen without client-side parameters
create or replace function public.update_last_seen()
returns void as $$
begin
  if auth.uid() is not null then
    insert into public.user_activity (user_id, email, last_seen, updated_at)
    values (
      auth.uid(),
      (select email from auth.users where id = auth.uid()),
      now(),
      now()
    )
    on conflict (user_id) do update set
      last_seen = now(),
      updated_at = now();
  end if;
end;
$$ language plpgsql security definer;

-- 6. Populate user_activity for existing users who registered before this migration
insert into public.user_activity (user_id, email, last_seen, last_login_at, login_count, created_at, updated_at)
select id, email, updated_at, updated_at, 1, updated_at, updated_at
from public.profiles
on conflict (user_id) do nothing;
