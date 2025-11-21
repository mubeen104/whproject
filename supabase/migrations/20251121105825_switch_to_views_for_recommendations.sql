/*
  # Switch Recommendations to Views Instead of Functions

  1. Problem
    - PostgREST schema cache not recognizing RPC functions
    - Multiple attempts to fix have failed
    - RPC approach is unreliable on hosted Supabase

  2. Solution
    - Drop RPC functions entirely
    - Create materialized views for recommendations
    - Use direct table queries with filters
    - Much more reliable with PostgREST

  3. Changes
    - Drop all recommendation RPC functions
    - Create products_with_metadata view
    - Frontend will use .from() instead of .rpc()
    - Score calculation done client-side
*/

-- ============================================================================
-- Drop ALL RPC functions - they're unreliable
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_related_products(uuid[], integer, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_cart_suggestions(uuid[], integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_related_products_json(jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.get_cart_suggestions_json(jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.notify_postgrest_reload() CASCADE;
DROP EVENT TRIGGER IF EXISTS trigger_postgrest_reload_on_ddl;

-- ============================================================================
-- Create a rich view with all product data needed for recommendations
-- ============================================================================

CREATE OR REPLACE VIEW public.products_with_recommendations AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.description,
  p.price,
  p.compare_price,
  p.inventory_quantity,
  p.is_active,
  p.is_featured,
  p.is_best_seller,
  p.tags,
  p.created_at,
  -- Get primary image
  COALESCE(
    (SELECT pi.image_url 
     FROM product_images pi 
     WHERE pi.product_id = p.id 
     ORDER BY pi.sort_order 
     LIMIT 1),
    '/placeholder.svg'
  ) as image_url,
  COALESCE(
    (SELECT pi.alt_text 
     FROM product_images pi 
     WHERE pi.product_id = p.id 
     ORDER BY pi.sort_order 
     LIMIT 1),
    p.name
  ) as image_alt,
  -- Get categories as array
  COALESCE(
    (SELECT json_agg(json_build_object(
      'id', c.id,
      'name', c.name,
      'slug', c.slug
    ))
    FROM categories c
    INNER JOIN product_categories pc ON pc.category_id = c.id
    WHERE pc.product_id = p.id),
    '[]'::json
  ) as categories,
  -- Get category IDs for filtering
  COALESCE(
    ARRAY(
      SELECT pc.category_id
      FROM product_categories pc
      WHERE pc.product_id = p.id
    ),
    ARRAY[]::uuid[]
  ) as category_ids
FROM products p
WHERE p.is_active = true
  AND p.inventory_quantity > 0;

-- Grant access to the view
GRANT SELECT ON public.products_with_recommendations TO anon, authenticated;

-- Add comment
COMMENT ON VIEW public.products_with_recommendations IS 'Materialized product data for recommendations - use with filters for related products and cart suggestions';

-- ============================================================================
-- Create tracking table access policies (if not exists)
-- ============================================================================

-- Ensure recommendation tracking tables exist and are accessible
DO $$
BEGIN
  -- Allow inserts to tracking tables
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_recommendation_views' 
    AND policyname = 'Allow anonymous inserts'
  ) THEN
    CREATE POLICY "Allow anonymous inserts"
      ON product_recommendation_views
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'product_recommendation_conversions' 
    AND policyname = 'Allow anonymous inserts'
  ) THEN
    CREATE POLICY "Allow anonymous inserts"
      ON product_recommendation_conversions
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- Force schema reload one final time
-- ============================================================================

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
