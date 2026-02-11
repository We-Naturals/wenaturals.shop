-- Add Marketplace URL columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS amazon_url text,
ADD COLUMN IF NOT EXISTS flipkart_url text,
ADD COLUMN IF NOT EXISTS meesho_url text;
