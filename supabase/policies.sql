-- Enable RLS on tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- PRODUCTS POLICIES
-- 1. Everyone can view products (Public Read)
CREATE POLICY "Public products view" 
ON products FOR SELECT 
USING (true);

-- 2. Only Admins can insert/update/delete products
-- Note: Requires a 'profiles' table with a 'role' column. 
-- Adjust the subquery if your roles are stored elsewhere (e.g. auth.users metadata)
CREATE POLICY "Admins manage products" 
ON products FOR ALL 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- ORDERS POLICIES
-- 1. Users can view their own orders
CREATE POLICY "Users view own orders" 
ON orders FOR SELECT 
USING (
  auth.uid() = user_id
);

-- 2. Admins can view all orders
CREATE POLICY "Admins view all orders" 
ON orders FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- 3. Authenticated users can create orders (for themselves)
CREATE POLICY "Users create orders" 
ON orders FOR INSERT 
WITH CHECK (
  auth.uid() = user_id
);

-- ORDER ITEMS POLICIES
-- 1. Users view their own order items
CREATE POLICY "Users view own order items" 
ON order_items FOR SELECT 
USING (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);

-- 2. Admins view all order items
CREATE POLICY "Admins view all order items" 
ON order_items FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- 3. Users can insert items for their orders
-- (Often handled by backend, but if inserting from client, this is needed)
CREATE POLICY "Users create order items" 
ON order_items FOR INSERT 
WITH CHECK (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);
