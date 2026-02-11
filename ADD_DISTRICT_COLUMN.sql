-- Add district column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_district TEXT;

-- Add district column to addresses table
ALTER TABLE addresses 
ADD COLUMN IF NOT EXISTS district TEXT;

-- Update RLS policies if necessary (usually column additions don't break existing policies unless they are strict)
-- Re-grant permissions just in case (optional but safe)
GRANT ALL ON orders TO authenticated;
GRANT ALL ON addresses TO authenticated;
