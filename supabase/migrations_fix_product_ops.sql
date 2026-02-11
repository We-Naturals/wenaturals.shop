-- Migration: Fix Product & Blog Operations
-- Description: Adds missing columns to products and blogs tables, and relaxes order_items FK constraint.

-- 1. Update Products Table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS category text, -- Support for text category names from form
ADD COLUMN IF NOT EXISTS alchemical_properties jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS amazon_link text,
ADD COLUMN IF NOT EXISTS flipkart_link text,
ADD COLUMN IF NOT EXISTS meesho_link text;

-- 2. Update Blogs Table
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS alchemical_properties jsonb DEFAULT '{}'::jsonb;

-- 3. Relax Order Items Foreign Key
-- First, drop the existing constraint if it exists (standard name usually order_items_product_id_fkey)
ALTER TABLE public.order_items 
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Re-add with ON DELETE SET NULL
ALTER TABLE public.order_items
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES public.products(id) 
ON DELETE SET NULL;
