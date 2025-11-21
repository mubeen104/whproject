/*
  # Force PostgREST Schema Reload

  1. Purpose
    - Force PostgREST to reload schema cache
    - Drop and recreate functions with identical signatures
    - This triggers a schema version change

  2. Approach
    - Drop existing recommendation functions
    - Recreate with exact same signatures
    - PostgREST will detect schema change
*/

-- Drop all recommendation functions
DROP FUNCTION IF EXISTS public.get_related_products_json(jsonb);
DROP FUNCTION IF EXISTS public.get_cart_suggestions_json(jsonb);
DROP FUNCTION IF EXISTS public.get_related_products(uuid[], integer, uuid);
DROP FUNCTION IF EXISTS public.get_cart_suggestions(uuid[], integer);

-- Recreate get_related_products with alphabetical parameters
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
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_product_id IS NULL THEN
    RAISE EXCEPTION 'p_product_id is required';
  END IF;

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
        COALESCE(
          (SELECT COUNT(*)::INTEGER * 10 
           FROM product_categories pc 
           WHERE pc.product_id = p.id 
           AND pc.category_id = ANY(
             SELECT UNNEST(pi.category_ids) FROM product_info pi
           )
          ), 0
        ) +
        CASE 
          WHEN p.price BETWEEN (SELECT pi.price * 0.7 FROM product_info pi) 
               AND (SELECT pi.price * 1.3 FROM product_info pi)
          THEN 8
          ELSE 0
        END +
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
        CASE WHEN p.is_best_seller THEN 5 ELSE 0 END +
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

-- Recreate get_cart_suggestions with alphabetical parameters
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
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM product_categories pc
            WHERE pc.product_id = p.id
            AND pc.category_id IN (SELECT category_id FROM cart_categories)
          )
          THEN 15
          ELSE 0
        END +
        CASE 
          WHEN p.price BETWEEN (SELECT avg_price * 0.5 FROM cart_price_range) 
               AND (SELECT avg_price * 1.5 FROM cart_price_range)
          THEN 10
          ELSE 0
        END +
        CASE WHEN p.is_best_seller THEN 8 ELSE 0 END +
        CASE WHEN p.is_featured THEN 5 ELSE 0 END +
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_related_products TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_cart_suggestions TO anon, authenticated;

-- Force schema reload
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Add comments
COMMENT ON FUNCTION public.get_related_products IS 'Returns related products - parameters in alphabetical order - RECREATED to force PostgREST reload';
COMMENT ON FUNCTION public.get_cart_suggestions IS 'Returns cart suggestions - parameters in alphabetical order - RECREATED to force PostgREST reload';
