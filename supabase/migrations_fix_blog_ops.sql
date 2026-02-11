-- Migration: Fix Blog Operations
-- Description: Adds missing columns to blogs table to match BlogForm.tsx payload.

ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS excerpt text,
ADD COLUMN IF NOT EXISTS category text DEFAULT 'General',
ADD COLUMN IF NOT EXISTS author text DEFAULT 'Admin',
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Draft';

-- Ensure alchemical_properties exists (in case previous migration failed or was partial)
ALTER TABLE public.blogs
ADD COLUMN IF NOT EXISTS alchemical_properties jsonb DEFAULT '{}'::jsonb;
