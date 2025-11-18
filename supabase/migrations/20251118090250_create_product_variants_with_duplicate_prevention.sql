/*
  # Create Product Variants System with Duplicate Prevention

  1. New Tables
    - `product_variants` - Stores product variant information (size, color, etc.)
    - `product_variant_images` - Stores variant-specific images

  2. Constraints
    - Unique constraint on (product_id, normalized_name) to prevent duplicate variant names per product
    - Unique constraint on SKU (when not null)
    - Foreign key constraints with cascade delete

  3. Security
    - Enable RLS on both tables
    - Public read access for active variants
    - Admin-only write access
*/

-- Create product_variants table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price > 0),
  compare_price NUMERIC CHECK (compare_price IS NULL OR compare_price >= price),
  sku TEXT,
  inventory_quantity INTEGER NOT NULL DEFAULT 0 CHECK (inventory_quantity >= 0),
  weight NUMERIC CHECK (weight IS NULL OR weight >= 0),
  variant_options JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_variant_images table
CREATE TABLE IF NOT EXISTS public.product_variant_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_product_variants_product_id'
  ) THEN
    ALTER TABLE public.product_variants 
    ADD CONSTRAINT fk_product_variants_product_id 
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_product_variant_images_variant_id'
  ) THEN
    ALTER TABLE public.product_variant_images 
    ADD CONSTRAINT fk_product_variant_images_variant_id 
    FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create unique index to prevent duplicate variant names per product (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_unique_name_per_product 
ON public.product_variants (product_id, LOWER(TRIM(name)));

-- Create unique index for SKU (only when SKU is not null and not empty)
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_unique_sku 
ON public.product_variants (sku) 
WHERE sku IS NOT NULL AND sku != '';

-- Create regular indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id 
ON public.product_variants(product_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id_active 
ON public.product_variants(product_id, is_active);

CREATE INDEX IF NOT EXISTS idx_product_variants_sku 
ON public.product_variants(sku) 
WHERE sku IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_product_variant_images_variant_id 
ON public.product_variant_images(variant_id);

-- Add variant_id column to cart_items if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'cart_items' 
    AND column_name = 'variant_id'
  ) THEN
    ALTER TABLE public.cart_items ADD COLUMN variant_id UUID;
    ALTER TABLE public.cart_items ADD CONSTRAINT fk_cart_items_variant_id 
      FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;
    CREATE INDEX idx_cart_items_variant_id ON public.cart_items(variant_id);
  END IF;
END $$;

-- Add variant_id column to order_items if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'order_items' 
    AND column_name = 'variant_id'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN variant_id UUID;
    ALTER TABLE public.order_items ADD CONSTRAINT fk_order_items_variant_id 
      FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;
    CREATE INDEX idx_order_items_variant_id ON public.order_items(variant_id);
  END IF;
END $$;

-- Create function to validate and normalize variants before insert/update
CREATE OR REPLACE FUNCTION public.validate_product_variant()
RETURNS TRIGGER AS $$
BEGIN
  -- Trim and normalize the name
  NEW.name := TRIM(NEW.name);
  
  -- Ensure name is not empty
  IF NEW.name = '' OR NEW.name IS NULL THEN
    RAISE EXCEPTION 'Variant name cannot be empty';
  END IF;
  
  -- Ensure price is positive
  IF NEW.price <= 0 THEN
    RAISE EXCEPTION 'Variant price must be greater than 0';
  END IF;
  
  -- Auto-generate SKU if not provided
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    SELECT CONCAT(
      COALESCE(p.sku, 'PROD'),
      '-',
      UPPER(REPLACE(REPLACE(REPLACE(NEW.name, ' ', ''), '.', ''), '/', '-'))
    )
    INTO NEW.sku
    FROM public.products p
    WHERE p.id = NEW.product_id;
  END IF;
  
  -- Update the updated_at timestamp
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate variants
DROP TRIGGER IF EXISTS trigger_validate_product_variant ON public.product_variants;
CREATE TRIGGER trigger_validate_product_variant
  BEFORE INSERT OR UPDATE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_product_variant();

-- Enable RLS on both tables
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_variants
DROP POLICY IF EXISTS "Product variants are publicly readable" ON public.product_variants;
CREATE POLICY "Product variants are publicly readable"
ON public.product_variants
FOR SELECT
USING (is_active = true);

-- RLS policies for product_variant_images
DROP POLICY IF EXISTS "Product variant images are publicly readable" ON public.product_variant_images;
CREATE POLICY "Product variant images are publicly readable"
ON public.product_variant_images
FOR SELECT
USING (true);