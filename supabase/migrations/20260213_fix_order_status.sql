-- Fix for "violates check constraint" error
-- The code tries to set status to 'processing', but the database didn't allow it.

-- 1. Drop the old restricted constraint
-- We attempt to drop typically named constraints. 
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS status_check;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- 2. Add the new flexible constraint
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'));

-- 3. Comment explaining the statuses
COMMENT ON COLUMN public.orders.status IS 'Allowed values: pending, paid, processing, shipped, delivered, cancelled, returned';
