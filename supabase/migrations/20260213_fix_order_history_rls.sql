-- Fix RLS violations on order_history table
-- The previous migration enabled RLS but didn't add INSERT policies.
-- This caused the trigger 'fn_log_order_status_change' to fail when updating orders.

-- 1. Allow Admins to INSERT into order_history (Critical for Admin Dashboard)
CREATE POLICY "Admins can insert order history"
    ON public.order_history FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 2. Allow Users to INSERT into order_history (Critical for 'User verifies payment' or 'User cancels order' flows)
-- We strictly limit this to history for their OWN orders.
CREATE POLICY "Users can insert own order history"
    ON public.order_history FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_history.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- 3. (Optional Safety) Grant usage if not already present
GRANT ALL ON public.order_history TO authenticated;
GRANT ALL ON public.order_history TO service_role;
