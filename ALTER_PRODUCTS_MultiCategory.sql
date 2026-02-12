-- Migration to support multiple categories for products

-- 1. Add new 'categories' column as text array
ALTER TABLE public.products ADD COLUMN categories text[] DEFAULT '{}';

-- 2. Migrate existing 'category' data to 'categories'
-- Note: schema_inventory.sql showed 'category_id' uuid relation but ProductForm uses 'category' string.
-- Based on ProductForm.tsx: "category: initialData.category || categories[0] || "","
-- And InventoryPage.tsx: "const { data: products ... } = await supabase.from('products').select('*')"
-- It seems 'category' column exists on 'products' table and contains the category Name (string).
-- However, schema_inventory.sql defined: `category_id uuid references public.categories(id)`
-- This suggests a discrepancy between the schema file and the actual running DB/Code. 
-- The code definitely uses a string `category`. 
-- I will assume there is a `category` column (text) on `products` based on the code.

UPDATE public.products 
SET categories = ARRAY[category] 
WHERE category IS NOT NULL;

-- 3. (Optional) Remove old 'category' column
-- ALTER TABLE public.products DROP COLUMN category;
-- Keeping it for now for safety or backward compatibility if needed, 
-- but ideally we should switch entirely to 'categories'.

-- 4. Update RLS policies if any depend on category (none found in provided schema).
