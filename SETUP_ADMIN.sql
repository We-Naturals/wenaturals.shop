-- 1. Create Profiles Table (if not exists)
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  role text not null default 'customer',
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 3. Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer');
  return new;
end;
$$;

-- Drop trigger if exists to avoid duplication errors on re-run
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. COMMAND TO MAKE YOURSELF ADMIN
-- Replace 'YOUR_EMAIL@gmail.com' with your actual email
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL@gmail.com';
