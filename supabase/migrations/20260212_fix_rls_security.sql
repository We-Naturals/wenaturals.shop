-- 1. Fix RPC Security Context
-- Set create_order_v1 to SECURITY DEFINER so it runs with creator privileges (superuser/service role)
-- This bypasses RLS on the "products" table, ensuring the function can always read stock/price.
CREATE OR REPLACE FUNCTION create_order_v1(
    p_user_id UUID,
    p_customer_email TEXT,
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_shipping_address JSONB,
    p_payment_method TEXT,
    p_payment_status TEXT,
    p_payment_id TEXT DEFAULT NULL,
    p_items order_item_input[] DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_item order_item_input;
    v_calculated_total NUMERIC := 0;
    v_product_stock INTEGER;
    v_product_name TEXT;
    v_product_price NUMERIC;
    v_result JSONB;
BEGIN
    -- 1. Calculate Total and Validate Stock
    FOREACH v_item IN ARRAY p_items LOOP
        -- Get current stock and details to verify
        SELECT stock, name, price INTO v_product_stock, v_product_name, v_product_price 
        FROM public.products 
        WHERE id = v_item.product_id 
        FOR UPDATE; -- Lock rows to prevent race conditions

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % not found.', v_item.product_id;
        END IF;

        IF v_product_stock < v_item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for %. Only % left.', v_product_name, v_product_stock;
        END IF;

        -- Accumulate total using database prices for security
        v_calculated_total := v_calculated_total + (v_product_price * v_item.quantity);
        
        -- Decrement stock
        UPDATE public.products 
        SET stock = stock - v_item.quantity 
        WHERE id = v_item.product_id;
    END LOOP;

    -- 2. Insert Order
    INSERT INTO public.orders (
        user_id,
        customer_email,
        customer_name,
        customer_phone,
        shipping_address,
        total_amount,
        payment_method,
        payment_status,
        payment_id,
        status
    ) VALUES (
        p_user_id,
        p_customer_email,
        p_customer_name,
        p_customer_phone,
        p_shipping_address,
        v_calculated_total,
        p_payment_method,
        p_payment_status,
        p_payment_id,
        'pending'
    ) RETURNING id INTO v_order_id;

    -- 3. Insert Order Items
    FOREACH v_item IN ARRAY p_items LOOP
        INSERT INTO public.order_items (
            order_id,
            product_id,
            product_name,
            quantity,
            price_at_purchase
        ) VALUES (
            v_order_id,
            v_item.product_id,
            v_item.product_name,
            v_item.quantity,
            v_item.price_at_purchase
        );
    END LOOP;

    -- 4. Construct Result
    SELECT jsonb_build_object(
        'id', o.id,
        'created_at', o.created_at,
        'total_amount', o.total_amount,
        'status', o.status,
        'items', (
            SELECT jsonb_agg(jsonb_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'quantity', oi.quantity,
                'price_at_purchase', oi.price_at_purchase
            ))
            FROM public.order_items oi
            WHERE oi.order_id = o.id
        )
    ) INTO v_result
    FROM public.orders o
    WHERE o.id = v_order_id;

    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    -- Transaction automatically rolls back on exception
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- Critical change here

-- 2. Ensure Products are Readable by Everyone (Public Catalog)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);

-- 3. Ensure Orders can be updated by Service Role (for webhooks) 
--    and Users (but strictly for their own if needed, though webhooks usually use Service Role)
--    Note: The 'create_order_v1' RPC handles insertion. Updates (payment status) usually come from the client or webhook.
--    Client-side updates to 'payment_status' should be restricted or handled via another RPC/Webhook.
--    If the client is calling update, they need policy.

DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);

