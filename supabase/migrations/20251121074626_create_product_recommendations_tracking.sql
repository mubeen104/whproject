/*
  # Product Recommendations Tracking System

  1. New Tables
    - `product_recommendation_views` - Tracks when users view recommended products
    - `product_recommendation_conversions` - Tracks when users add recommended products to cart

  2. Indexes
    - Performance indexes for fast recommendation queries
    - Indexes on product_categories for category-based recommendations

  3. Functions
    - `get_related_products` - Smart algorithm to find related products
    - `get_cart_suggestions` - Find complementary products based on cart

  4. Security
    - Enable RLS on tracking tables
    - Public write access for tracking (anonymous + authenticated)
    - Admin read access for analytics
*/

-- Create product recommendation views tracking table
CREATE TABLE IF NOT EXISTS public.product_recommendation_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  recommended_product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('product_page', 'cart_page')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create product recommendation conversions tracking table
CREATE TABLE IF NOT EXISTS public.product_recommendation_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  recommended_product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('product_page', 'cart_page')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recommendation_views_product 
ON public.product_recommendation_views(product_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recommendation_views_recommended 
ON public.product_recommendation_views(recommended_product_id);

CREATE INDEX IF NOT EXISTS idx_recommendation_conversions_product 
ON public.product_recommendation_conversions(product_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recommendation_conversions_recommended 
ON public.product_recommendation_conversions(recommended_product_id);

-- Add index on product_categories for faster category lookups
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id 
ON public.product_categories(product_id);

CREATE INDEX IF NOT EXISTS idx_product_categories_category_id 
ON public.product_categories(category_id);

-- Function to get related products using smart algorithm
CREATE OR REPLACE FUNCTION public.get_related_products(
  p_product_id UUID,
  p_limit INTEGER DEFAULT 6,
  p_exclude_ids UUID[] DEFAULT ARRAY[]::UUID[]
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
) AS $$
BEGIN
  RETURN QUERY
  WITH product_info AS (
    SELECT 
      p.id,
      p.price,
      ARRAY_AGG(DISTINCT pc.category_id) as category_ids,
      p.tags,
      p.keywords
    FROM products p
    LEFT JOIN product_categories pc ON p.id = pc.product_id
    WHERE p.id = p_product_id
    GROUP BY p.id, p.price, p.tags, p.keywords
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
      -- Calculate recommendation score
      (
        -- Category match: 10 points per matching category
        COALESCE(
          (SELECT COUNT(*)::INTEGER * 10 
           FROM product_categories pc 
           WHERE pc.product_id = p.id 
           AND pc.category_id = ANY(
             SELECT UNNEST(pi.category_ids) FROM product_info pi
           )
          ), 0
        ) +
        -- Price similarity: 8 points if within 30% price range
        CASE 
          WHEN p.price BETWEEN (SELECT pi.price * 0.7 FROM product_info pi) 
               AND (SELECT pi.price * 1.3 FROM product_info pi)
          THEN 8
          ELSE 0
        END +
        -- Tag/keyword overlap: 6 points per match
        COALESCE(
          (SELECT (
            CARDINALITY(
              ARRAY(
                SELECT UNNEST(p.tags || p.keywords) 
                INTERSECT 
                SELECT UNNEST(pi.tags || pi.keywords)
              )
            )
          )::INTEGER * 6 FROM product_info pi), 0
        ) +
        -- Best seller boost: 5 points
        CASE WHEN p.is_best_seller THEN 5 ELSE 0 END +
        -- Featured boost: 3 points
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
$$ LANGUAGE plpgsql STABLE;

-- Function to get cart suggestions based on cart items
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
) AS $$
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
      -- Calculate suggestion score
      (
        -- Same category as cart items: 15 points
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM product_categories pc
            WHERE pc.product_id = p.id
            AND pc.category_id IN (SELECT category_id FROM cart_categories)
          )
          THEN 15
          ELSE 0
        END +
        -- Complementary price range: 10 points if similar to cart average
        CASE 
          WHEN p.price BETWEEN (SELECT avg_price * 0.5 FROM cart_price_range) 
               AND (SELECT avg_price * 1.5 FROM cart_price_range)
          THEN 10
          ELSE 0
        END +
        -- Best seller priority: 8 points
        CASE WHEN p.is_best_seller THEN 8 ELSE 0 END +
        -- Featured boost: 5 points
        CASE WHEN p.is_featured THEN 5 ELSE 0 END +
        -- Lower price items get slight boost for cross-sell: 3 points
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
$$ LANGUAGE plpgsql STABLE;

-- Enable RLS on tracking tables
ALTER TABLE public.product_recommendation_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_recommendation_conversions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recommendation views
DROP POLICY IF EXISTS "Anyone can insert recommendation views" ON public.product_recommendation_views;
CREATE POLICY "Anyone can insert recommendation views"
ON public.product_recommendation_views
FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own recommendation views" ON public.product_recommendation_views;
CREATE POLICY "Users can view own recommendation views"
ON public.product_recommendation_views
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for recommendation conversions
DROP POLICY IF EXISTS "Anyone can insert recommendation conversions" ON public.product_recommendation_conversions;
CREATE POLICY "Anyone can insert recommendation conversions"
ON public.product_recommendation_conversions
FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own recommendation conversions" ON public.product_recommendation_conversions;
CREATE POLICY "Users can view own recommendation conversions"
ON public.product_recommendation_conversions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
