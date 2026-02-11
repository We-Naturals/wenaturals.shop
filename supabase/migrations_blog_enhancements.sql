-- Create Blog Categories Table
create table public.blog_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  created_at timestamptz default now()
);

-- Enable RLS for Blog Categories
alter table public.blog_categories enable row level security;

-- Policies for Blog Categories
create policy "Public blog categories are viewable by everyone."
  on blog_categories for select
  using ( true );

create policy "Admins can manage blog categories."
  on blog_categories for all
  using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Update Blogs Table: Add Category FK
alter table public.blogs
  add column category_id uuid references public.blog_categories(id) on delete set null;

-- Update Blogs Table: Add Related Products Array
alter table public.blogs
  add column related_product_ids uuid[];

-- Seed Initial Categories
insert into public.blog_categories (name, slug) values
('Wellness', 'wellness'),
('Science', 'science'),
('Simplicity', 'simplicity'),
('Rituals', 'rituals')
on conflict do nothing;
