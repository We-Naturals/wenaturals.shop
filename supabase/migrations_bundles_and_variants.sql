-- Expand Products for Ritual Bundles and Advanced Variants
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_bundle boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS bundle_items jsonb DEFAULT '[]'::jsonb, -- Array of product IDs and quantities
ADD COLUMN IF NOT EXISTS rarity_level text DEFAULT 'Common', -- For the 'Rarity' feature
ADD COLUMN IF NOT EXISTS batch_info text; -- Specific batch/vintage information
