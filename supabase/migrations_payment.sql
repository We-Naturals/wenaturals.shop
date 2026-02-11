-- Add payment columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cod',
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_id text;

-- Add check constraints for valid values
ALTER TABLE public.orders 
ADD CONSTRAINT orders_payment_method_check 
CHECK (payment_method IN ('cod', 'upi', 'razorpay'));

ALTER TABLE public.orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'failed'));
