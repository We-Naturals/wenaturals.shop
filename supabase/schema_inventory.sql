-- ==============================================================================
-- 1. CATEGORIES TABLE
-- ==============================================================================
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;

-- Everyone can read categories
create policy "Public categories are viewable by everyone."
  on categories for select
  using ( true );

-- Only admins can insert/update/delete
create policy "Admins can manage categories."
  on categories for all
  using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );


-- ==============================================================================
-- 2. PRODUCTS TABLE
-- ==============================================================================
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  price numeric not null,
  currency text default 'USD',
  stock integer default 100,
  media text[], -- Array of image/video URLs
  category_id uuid references public.categories(id) on delete set null,
  related_blog_ids uuid[], -- Array of references to blog posts (we'll implement blogs table next)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.products enable row level security;

-- Everyone can read products
create policy "Public products are viewable by everyone."
  on products for select
  using ( true );

-- Only admins can insert/update/delete
create policy "Admins can manage products."
  on products for all
  using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- ==============================================================================
-- 3. BLOGS TABLE (Needed for linking)
-- ==============================================================================
create table public.blogs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  content text,
  image text, -- Hero image
  author_id uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.blogs enable row level security;

create policy "Public blogs are viewable by everyone."
  on blogs for select
  using ( true );

create policy "Admins can manage blogs."
  on blogs for all
  using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- ==============================================================================
-- INITIAL SEED DATA (To get you started)
-- ==============================================================================

-- Create default categories
insert into public.categories (name, slug) values
('Skincare', 'skincare'),
('Moisturizers', 'moisturizers'),
('Toners', 'toners'),
('Essences', 'essences')
on conflict do nothing;
