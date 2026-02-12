-- Add 'out_for_delivery' to allowed statuses
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'));

COMMENT ON COLUMN public.orders.status IS 'Allowed values: pending, paid, processing, shipped, out_for_delivery, delivered, cancelled, returned';
