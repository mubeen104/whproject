-- Add detailed product information fields to products table
ALTER TABLE public.products 
ADD COLUMN features TEXT,
ADD COLUMN ingredients TEXT,
ADD COLUMN usage_instructions TEXT;