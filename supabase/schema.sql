-- 1. Create a table to track user roles and profile data
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  role text default 'customer' check (role in ('customer', 'admin')),
  full_name text,
  created_at timestamptz default now(),
  primary key (id)
);

-- 2. Enable Row Level Security (Security is paramount)
alter table public.profiles enable row level security;

-- 3. Create policies
-- Public can read basic profile info (useful for comments/reviews later)
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- Users can insert their own profile
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 4. Create a trigger to automatically create a profile entry when a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (new.id, new.email, 'customer', new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- GOD MODE: RUN THIS COMMAND MANUALLY TO MAKE YOURSELF ADMIN
-- Replace 'your_email@example.com' with your actual email address
-- ==============================================================================
-- update public.profiles set role = 'admin' where email = 'your_email@example.com';
