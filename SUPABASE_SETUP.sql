-- 1. Create Orders Table
create table public.orders (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  user_id uuid not null, -- MANDATORY for this flow
  customer_email text not null,
  customer_name text not null,
  customer_phone text not null, -- New Field
  shipping_address jsonb not null, -- Stores snapshot: { street, city, state, pincode, country: 'India' }
  total_amount numeric not null,
  status text not null default 'pending'::text,
  constraint orders_pkey primary key (id),
  constraint orders_user_id_fkey foreign key (user_id) references auth.users (id),
  constraint status_check check (status in ('pending', 'paid', 'shipped', 'cancelled'))
);

-- 2. Create Order Items Table
create table public.order_items (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  order_id uuid not null,
  product_id uuid not null,
  quantity integer not null,
  price_at_purchase numeric not null,
  product_name text not null,
  constraint order_items_pkey primary key (id),
  constraint order_items_order_id_fkey foreign key (order_id) references orders (id) on delete cascade,
  constraint order_items_product_id_fkey foreign key (product_id) references products (id)
);

-- 3. Create Addresses Table (Address Book)
create table public.addresses (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  user_id uuid not null,
  name text not null,
  phone text not null,
  street text not null,
  city text not null,
  state text not null,
  pincode text not null,
  country text not null default 'India',
  is_default boolean default false,
  constraint addresses_pkey primary key (id),
  constraint addresses_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

-- 4. Enable RLS
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.addresses enable row level security;

-- 5. RLS Policies

-- ORDERS
create policy "Admins can view all orders" on orders
  for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Users can view own orders" on orders
  for select using (auth.uid() = user_id);

create policy "Users can insert own orders" on orders
  for insert with check (auth.uid() = user_id);

-- ORDER ITEMS
create policy "Admins can view all order items" on order_items
  for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Users can view own order items" on order_items
  for select using (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

create policy "Users can insert own order items" on order_items
  for insert with check (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

-- ADDRESSES
create policy "Users can view own addresses" on addresses
  for select using (auth.uid() = user_id);

create policy "Users can insert own addresses" on addresses
  for insert with check (auth.uid() = user_id);

create policy "Users can update own addresses" on addresses
  for update using (auth.uid() = user_id);

create policy "Users can delete own addresses" on addresses
  for delete using (auth.uid() = user_id);
