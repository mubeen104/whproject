/*
  # Complete Product Recommendations System Fix

  1. Purpose
    - Clean up all previous recommendation function attempts
    - Create fresh functions with proper signatures for PostgREST
    - Add automatic schema reload triggers
    - Ensure proper permissions and discoverability

  2. Changes
    - Drop ALL previous recommendation functions (all exact variations)
    - Create new functions with alphabetically ordered parameters
    - Add event triggers for automatic schema cache reload
    - Grant proper permissions to anon and authenticated roles
    - Add function comments for PostgREST discoverability

  3. Function Signatures (NEW - alphabetically ordered for PostgREST)
    - get_related_products(p_exclude_ids, p_limit, p_product_id)
    - get_cart_suggestions(p_cart_product_ids, p_limit)

  4. Security
    - Functions use SECURITY INVOKER for better cache behavior
    - Proper RLS policies already exist on underlying tables
    - Explicit grants to anon and authenticated roles
*/

-- ============================================================================
-- STEP 1: Drop ALL existing recommendation function variations
-- ============================================================================

-- Drop with exact signatures found in database
DROP FUNCTION IF EXISTS public.get_related_products(p_limit integer, p_product_id uuid, p_exclude_ids uuid[]) CASCADE;
DROP FUNCTION IF EXISTS public.get_cart_suggestions(p_limit integer, p_cart_product_ids uuid[]) CASCADE;

-- Drop any other possible variations
DROP FUNCTION IF EXISTS public.get_related_products_json(jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.get_cart_suggestions_json(jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.get_related_products(uuid[], integer, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_related_products(p_exclude_ids uuid[], p_limit integer, p_product_id uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_cart_suggestions(uuid[], integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_cart_suggestions(p_cart_product_ids uuid[], p_limit integer) CASCADE;

-- ============================================================================
-- STEP 2: Create get_related_products with ALPHABETICAL parameter order
-- ============================================================================
-- PostgREST matches parameters alphabetically: e, l, p

CREATE OR REPLACE FUNCTION public.get_related_products(
  p_exclude_ids UUID[] DEFAULT ARRAY[]::UUID[],
  p_limit INTEGER DEFAULT 6,
  p_product_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  price NUMERIC,
  compare_price NUMERIC,
  inventory_quantity INTEGER,
  is_best_seller BOOLEAN,
  is_featured BOOLEAN,
  image_url TEXT,
  image_alt TEXT,
  recommendation_score INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
BEGIN
  -- Validate required parameter
  IF p_product_id IS NULL THEN
    RAISE EXCEPTION 'p_product_id is required';
  END IF;

  -- Return scored related products
  RETURN QUERY
  WITH product_info AS (
    SELECT 
      p.id,
      p.price,
      COALESCE(ARRAY_AGG(DISTINCT pc.category_id) FILTER (WHERE pc.category_id IS NOT NULL), ARRAY[]::UUID[]) as category_ids,
      COALESCE(p.tags, ARRAY[]::TEXT[]) as tags
    FROM products p
    LEFT JOIN product_categories pc ON p.id = pc.product_id
    WHERE p.id = p_product_id
    GROUP BY p.id, p.price, p.tags
  ),
  scored_products AS (
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.price,
      p.compare_price,
      p.inventory_quantity,
      p.is_best_seller,
      p.is_featured,
      (
        -- Category match score (10 points per matching category)
        COALESCE(
          (SELECT COUNT(*)::INTEGER * 10 
           FROM product_categories pc 
           WHERE pc.product_id = p.id 
           AND pc.category_id = ANY(
             SELECT UNNEST(pi.category_ids) FROM product_info pi
           )
          ), 0
        ) +
        -- Price similarity score (8 points if within 30% of original)
        CASE 
          WHEN p.price BETWEEN (SELECT pi.price * 0.7 FROM product_info pi) 
               AND (SELECT pi.price * 1.3 FROM product_info pi)
          THEN 8
          ELSE 0
        END +
        -- Tag match score (6 points per matching tag)
        COALESCE(
          (SELECT (
            CARDINALITY(
              ARRAY(
                SELECT UNNEST(COALESCE(p.tags, ARRAY[]::TEXT[])) 
                INTERSECT 
                SELECT UNNEST(pi.tags)
              )
            )
          )::INTEGER * 6 FROM product_info pi), 0
        ) +
        -- Best seller bonus (5 points)
        CASE WHEN p.is_best_seller THEN 5 ELSE 0 END +
        -- Featured bonus (3 points)
        CASE WHEN p.is_featured THEN 3 ELSE 0 END
      ) as score
    FROM products p
    WHERE p.is_active = true
      AND p.inventory_quantity > 0
      AND p.id != p_product_id
      AND NOT (p.id = ANY(p_exclude_ids))
  )
  SELECT 
    sp.id,
    sp.name,
    sp.slug,
    sp.price,
    sp.compare_price,
    sp.inventory_quantity,
    sp.is_best_seller,
    sp.is_featured,
    COALESCE(
      (SELECT pi.image_url 
       FROM product_images pi 
       WHERE pi.product_id = sp.id 
       ORDER BY pi.sort_order 
       LIMIT 1),
      '/placeholder.svg'
    ) as image_url,
    COALESCE(
      (SELECT pi.alt_text 
       FROM product_images pi 
       WHERE pi.product_id = sp.id 
       ORDER BY pi.sort_order 
       LIMIT 1),
      sp.name
    ) as image_alt,
    sp.score as recommendation_score
  FROM scored_products sp
  WHERE sp.score > 0
  ORDER BY sp.score DESC, RANDOM()
  LIMIT p_limit;
END;
$$;

-- ============================================================================
-- STEP 3: Create get_cart_suggestions with ALPHABETICAL parameter order
-- ============================================================================
-- PostgREST matches parameters alphabetically: c, l

CREATE OR REPLACE FUNCTION public.get_cart_suggestions(
  p_cart_product_ids UUID[],
  p_limit INTEGER DEFAULT 4
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  price NUMERIC,
  compare_price NUMERIC,
  inventory_quantity INTEGER,
  is_best_seller BOOLEAN,
  is_featured BOOLEAN,
  image_url TEXT,
  image_alt TEXT,
  suggestion_score INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
BEGIN
  -- Return scored cart suggestions
  RETURN QUERY
  WITH cart_categories AS (
    SELECT DISTINCT pc.category_id
    FROM product_categories pc
    WHERE pc.product_id = ANY(p_cart_product_ids)
  ),
  cart_price_range AS (
    SELECT 
      MIN(p.price) as min_price,
      MAX(p.price) as max_price,
      AVG(p.price) as avg_price
    FROM products p
    WHERE p.id = ANY(p_cart_product_ids)
  ),
  scored_suggestions AS (
    SELECT 
      p.id,
      p.name,
      p.slug,
      p.price,
      p.compare_price,
      p.inventory_quantity,
      p.is_best_seller,
      p.is_featured,
      (
        -- Same category bonus (15 points)
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM product_categories pc
            WHERE pc.product_id = p.id
            AND pc.category_id IN (SELECT category_id FROM cart_categories)
          )
          THEN 15
          ELSE 0
        END +
        -- Price compatibility (10 points if within reasonable range)
        CASE 
          WHEN p.price BETWEEN (SELECT avg_price * 0.5 FROM cart_price_range) 
               AND (SELECT avg_price * 1.5 FROM cart_price_range)
          THEN 10
          ELSE 0
        END +
        -- Best seller bonus (8 points)
        CASE WHEN p.is_best_seller THEN 8 ELSE 0 END +
        -- Featured bonus (5 points)
        CASE WHEN p.is_featured THEN 5 ELSE 0 END +
        -- Lower price preference (3 points for affordable items)
        CASE 
          WHEN p.price < (SELECT avg_price * 0.7 FROM cart_price_range)
          THEN 3
          ELSE 0
        END
      ) as score
    FROM products p
    WHERE p.is_active = true
      AND p.inventory_quantity > 0
      AND NOT (p.id = ANY(p_cart_product_ids))
  )
  SELECT 
    ss.id,
    ss.name,
    ss.slug,
    ss.price,
    ss.compare_price,
    ss.inventory_quantity,
    ss.is_best_seller,
    ss.is_featured,
    COALESCE(
      (SELECT pi.image_url 
       FROM product_images pi 
       WHERE pi.product_id = ss.id 
       ORDER BY pi.sort_order 
       LIMIT 1),
      '/placeholder.svg'
    ) as image_url,
    COALESCE(
      (SELECT pi.alt_text 
       FROM product_images pi 
       WHERE pi.product_id = ss.id 
       ORDER BY pi.sort_order 
       LIMIT 1),
      ss.name
    ) as image_alt,
    ss.score as suggestion_score
  FROM scored_suggestions ss
  WHERE ss.score > 0
  ORDER BY ss.score DESC, RANDOM()
  LIMIT p_limit;
END;
$$;

-- ============================================================================
-- STEP 4: Grant permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.get_related_products(uuid[], integer, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_cart_suggestions(uuid[], integer) TO anon, authenticated;

-- ============================================================================
-- STEP 5: Add comments for PostgREST discoverability
-- ============================================================================

COMMENT ON FUNCTION public.get_related_products(uuid[], integer, uuid) IS 'Returns related products scored by category, price, tags, and popularity. Alphabetically ordered parameters: p_exclude_ids, p_limit, p_product_id.';
COMMENT ON FUNCTION public.get_cart_suggestions(uuid[], integer) IS 'Returns cart suggestions scored by category match and price compatibility. Alphabetically ordered parameters: p_cart_product_ids, p_limit.';

-- ============================================================================
-- STEP 6: Create automatic schema reload trigger
-- ============================================================================

-- Create function to notify PostgREST of schema changes
CREATE OR REPLACE FUNCTION public.notify_postgrest_reload()
RETURNS event_trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Notify PostgREST to reload its schema cache
  NOTIFY pgrst, 'reload schema';
END;
$$;

-- Drop existing trigger if it exists
DROP EVENT TRIGGER IF EXISTS trigger_postgrest_reload_on_ddl;

-- Create event trigger that fires on DDL commands
CREATE EVENT TRIGGER trigger_postgrest_reload_on_ddl
  ON ddl_command_end
  WHEN TAG IN ('CREATE FUNCTION', 'ALTER FUNCTION', 'DROP FUNCTION',
               'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE',
               'CREATE VIEW', 'ALTER VIEW', 'DROP VIEW')
  EXECUTE FUNCTION public.notify_postgrest_reload();

-- ============================================================================
-- STEP 7: Force immediate schema reload
-- ============================================================================

-- Send multiple reload signals
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Increment schema version to force PostgREST cache invalidation
DO $$
DECLARE
  v_count INT;
BEGIN
  -- Create temp table to force schema version bump
  CREATE TEMP TABLE _schema_reload_trigger_temp (reload_time TIMESTAMP DEFAULT NOW());
  INSERT INTO _schema_reload_trigger_temp DEFAULT VALUES;
  SELECT COUNT(*) INTO v_count FROM _schema_reload_trigger_temp;
  DROP TABLE _schema_reload_trigger_temp;
  
  -- Log the reload
  RAISE NOTICE 'Schema reload triggered at %. PostgREST should detect this change.', NOW();
END $$;
