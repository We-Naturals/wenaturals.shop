-- Add Foreign Key to allow joining order_items with products
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'order_items_product_id_fkey'
    ) THEN
        ALTER TABLE "public"."order_items"
        ADD CONSTRAINT "order_items_product_id_fkey"
        FOREIGN KEY ("product_id")
        REFERENCES "public"."products" ("id")
        ON DELETE SET NULL;
    END IF;
END $$;
