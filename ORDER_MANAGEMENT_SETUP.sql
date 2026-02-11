-- 0. CLEANUP (WARNING: DELETES ALL ORDER DATA)
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.addresses cascade;

-- 1. Create ORDERS Table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  customer_email text not null,
  customer_name text not null,
  customer_phone text not null,
  shipping_address jsonb not null, -- Stores snapshot of address { street, city, state, pincode, country }
  total_amount numeric not null,
  status text default 'pending' check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  payment_id text, -- For Razorpay/Stripe ID later
  tracking_number text -- For shipping updates
);

-- 2. Create ORDER_ITEMS Table
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id), -- Optional: keep null if product deleted
  product_name text not null, -- Store name snapshot
  quantity int not null,
  price_at_purchase numeric not null,
  image_url text -- Helper to show image in history without joining products
);

-- 3. Create ADDRESSES Table (Address Book)
create table public.addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text not null,
  street text not null,
  city text not null,
  district text, -- Added District field
  state text not null,
  pincode text not null,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable RLS
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.addresses enable row level security;

-- 5. RLS Policies

-- ORDERS: Users can view their own orders
create policy "Users can view own orders"
  on public.orders for select
  using ( auth.uid() = user_id );

-- ORDERS: Users can create orders
create policy "Users can create orders"
  on public.orders for insert
  with check ( auth.uid() = user_id );

-- ORDERS: Admins can view all orders
create policy "Admins can view all orders"
  on public.orders for select
  using ( 
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
  
-- ORDERS: Admins can update orders (e.g. status)
create policy "Admins can update orders"
  on public.orders for update
  using ( 
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ORDER_ITEMS: Users can view own order items via order_id
create policy "Users can view own order items"
  on public.order_items for select
  using ( 
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- ORDER_ITEMS: Users can insert order items
create policy "Users can insert order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );
  
-- ORDER_ITEMS: Admins can view all order items
create policy "Admins can view all order items"
  on public.order_items for select
  using ( 
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ADDRESSES: Users can perform all actions on their own addresses
create policy "Users can manage own addresses"
  on public.addresses for all
  using ( auth.uid() = user_id );
