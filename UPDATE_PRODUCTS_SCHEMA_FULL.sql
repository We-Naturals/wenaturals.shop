-- Comprehensive Schema Update for Products Table
-- Adds all columns used in ProductForm if they don't exist.

-- 1. categories (Array of strings)
-- Requires Postgres 9.6+ (Supabase is usually v15+)
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE public.products ADD COLUMN categories text[] DEFAULT '{}';
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column categories already exists in products.';
    END;
END $$;

-- 2. variants (JSONB for keeping weight, price, stock variations)
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE public.products ADD COLUMN variants jsonb DEFAULT '[]';
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column variants already exists in products.';
    END;
END $$;

-- 3. Bundle fields
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE public.products ADD COLUMN is_bundle boolean DEFAULT false;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column is_bundle already exists in products.';
    END;
    BEGIN
        ALTER TABLE public.products ADD COLUMN bundle_items jsonb DEFAULT '[]';
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column bundle_items already exists in products.';
    END;
END $$;

-- 4. Rarity and Properties
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE public.products ADD COLUMN rarity_level text DEFAULT 'Common';
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column rarity_level already exists in products.';
    END;
    BEGIN
        ALTER TABLE public.products ADD COLUMN alchemical_properties jsonb DEFAULT '{}';
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column alchemical_properties already exists in products.';
    END;
END $$;

-- 5. Affiliate/External Links
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE public.products ADD COLUMN amazon_link text;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column amazon_link already exists in products.';
    END;
    BEGIN
        ALTER TABLE public.products ADD COLUMN flipkart_link text;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column flipkart_link already exists in products.';
    END;
    BEGIN
        ALTER TABLE public.products ADD COLUMN meesho_link text;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column meesho_link already exists in products.';
    END;
END $$;

-- 6. Migrate data for categories (Safety check included)
-- This moves data from old 'category' column to 'categories' array if array is empty
DO $$ 
BEGIN 
    -- Check if 'category' column exists before trying to access it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category') THEN
        UPDATE public.products 
        SET categories = ARRAY[category] 
        WHERE (categories IS NULL OR cardinality(categories) = 0) 
          AND category IS NOT NULL 
          AND category != '';
    END IF;
END $$;
