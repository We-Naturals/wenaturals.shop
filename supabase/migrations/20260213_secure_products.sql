-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 1. Allow Public Read Access (Catalog)
-- Drop existing policy if any to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
CREATE POLICY "Enable read access for all users" 
ON public.products FOR SELECT 
USING (true);

-- 2. Allow Admin Write Access
-- (Insert, Update, Delete)
DROP POLICY IF EXISTS "Enable insert for admins" ON public.products;
CREATE POLICY "Enable insert for admins" 
ON public.products FOR INSERT 
WITH CHECK (
    auth.uid() IN (
        SELECT id FROM public.profiles WHERE role = 'admin'
    )
);

DROP POLICY IF EXISTS "Enable update for admins" ON public.products;
CREATE POLICY "Enable update for admins" 
ON public.products FOR UPDATE 
USING (
    auth.uid() IN (
        SELECT id FROM public.profiles WHERE role = 'admin'
    )
)
WITH CHECK (
    auth.uid() IN (
        SELECT id FROM public.profiles WHERE role = 'admin'
    )
);

DROP POLICY IF EXISTS "Enable delete for admins" ON public.products;
CREATE POLICY "Enable delete for admins" 
ON public.products FOR DELETE 
USING (
    auth.uid() IN (
        SELECT id FROM public.profiles WHERE role = 'admin'
    )
);
