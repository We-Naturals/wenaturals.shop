-- Add Variants JSONB column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb;

-- Comment on column using standard SQL syntax if supported, or skip. 
-- For Supabase/Postgres, JSONB is perfect for flexible array data.
