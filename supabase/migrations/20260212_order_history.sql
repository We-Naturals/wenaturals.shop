-- 1. Create Order History Table
CREATE TABLE IF NOT EXISTS public.order_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add updated_at to Orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 3. Function to log status changes
CREATE OR REPLACE FUNCTION fn_log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.order_history (
            order_id,
            old_status,
            new_status,
            changed_by,
            note
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            auth.uid(), -- Captured from the active session if available
            'Status updated automatically or via service.'
        );
    END IF;
    
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger for status changes
DROP TRIGGER IF EXISTS tr_order_status_logger ON public.orders;
CREATE TRIGGER tr_order_status_logger
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION fn_log_order_status_change();

-- 5. Enable RLS on History
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
CREATE POLICY "Users can view own order history"
    ON public.order_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_history.order_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all order history"
    ON public.order_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
