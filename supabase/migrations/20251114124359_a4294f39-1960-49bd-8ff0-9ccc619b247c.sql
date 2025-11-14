-- Add new columns to categories table for enhanced category pages
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS banner_image_url text,
ADD COLUMN IF NOT EXISTS color_scheme text DEFAULT 'from-green-400 to-green-600',
ADD COLUMN IF NOT EXISTS icon_name text;

-- Add index for featured categories
CREATE INDEX IF NOT EXISTS idx_categories_is_featured ON public.categories(is_featured) WHERE is_featured = true;

-- Add index for parent categories
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id) WHERE parent_id IS NOT NULL;

-- Update some sample categories to be featured (using subquery instead of LIMIT in UPDATE)
UPDATE public.categories
SET is_featured = true,
    color_scheme = CASE 
      WHEN slug LIKE '%tea%' THEN 'from-green-500 to-emerald-600'
      WHEN slug LIKE '%supplement%' THEN 'from-amber-500 to-orange-600'
      WHEN slug LIKE '%skin%' OR slug LIKE '%beauty%' THEN 'from-pink-500 to-rose-600'
      WHEN slug LIKE '%oil%' THEN 'from-purple-500 to-violet-600'
      ELSE 'from-green-400 to-green-600'
    END
WHERE id IN (
  SELECT id FROM public.categories 
  WHERE is_active = true 
  ORDER BY sort_order 
  LIMIT 6
);