DO $$ 
BEGIN 
    -- 1. Add categories column if it doesn't exist. Using exception handling for safety.
    BEGIN
        ALTER TABLE public.products ADD COLUMN categories text[] DEFAULT '{}';
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column categories already exists in products.';
    END;
END $$;

-- 2. Migrate existing data from the old 'category' column to the new 'categories' array
-- Only update if categories is empty or null to avoid overwriting existing array data
UPDATE public.products 
SET categories = ARRAY[category] 
WHERE (categories IS NULL OR cardinality(categories) = 0) 
  AND category IS NOT NULL 
  AND category != '';

-- Note: The old 'category' column is kept for now to avoid breaking other parts of the app that rely on it unexpectedly.
