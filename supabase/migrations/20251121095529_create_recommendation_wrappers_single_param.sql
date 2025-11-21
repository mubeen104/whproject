/*
  # Create Single-Parameter Wrapper Functions for Recommendations

  1. Issue
    - PostgREST schema cache not refreshing for multi-parameter functions
    - Tried alphabetical ordering but cache still stale

  2. Solution
    - Create wrapper functions with single JSONB parameter
    - PostgREST handles single-parameter functions differently
    - More reliable schema cache behavior

  3. Changes
    - Keep existing functions as-is
    - Add new wrapper functions with _json suffix
    - Extract parameters from JSONB
*/

-- Wrapper for get_related_products with single JSONB parameter
CREATE OR REPLACE FUNCTION public.get_related_products_json(params JSONB)
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
AS $$
DECLARE
  v_product_id UUID;
  v_limit INTEGER;
  v_exclude_ids UUID[];
BEGIN
  -- Extract parameters from JSONB
  v_product_id := (params->>'p_product_id')::UUID;
  v_limit := COALESCE((params->>'p_limit')::INTEGER, 6);
  v_exclude_ids := COALESCE(
    ARRAY(SELECT jsonb_array_elements_text(params->'p_exclude_ids'))::UUID[],
    ARRAY[]::UUID[]
  );

  -- Validate
  IF v_product_id IS NULL THEN
    RAISE EXCEPTION 'p_product_id is required';
  END IF;

  -- Call the existing function
  RETURN QUERY
  SELECT * FROM get_related_products(v_exclude_ids, v_limit, v_product_id);
END;
$$;

-- Wrapper for get_cart_suggestions with single JSONB parameter
CREATE OR REPLACE FUNCTION public.get_cart_suggestions_json(params JSONB)
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
AS $$
DECLARE
  v_cart_product_ids UUID[];
  v_limit INTEGER;
BEGIN
  -- Extract parameters from JSONB
  v_cart_product_ids := ARRAY(
    SELECT jsonb_array_elements_text(params->'p_cart_product_ids')
  )::UUID[];
  v_limit := COALESCE((params->>'p_limit')::INTEGER, 4);

  -- Call the existing function
  RETURN QUERY
  SELECT * FROM get_cart_suggestions(v_cart_product_ids, v_limit);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_related_products_json(jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.get_related_products_json(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cart_suggestions_json(jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.get_cart_suggestions_json(jsonb) TO authenticated;

-- Comments
COMMENT ON FUNCTION public.get_related_products_json IS 'Wrapper for get_related_products using single JSONB parameter for better PostgREST compatibility';
COMMENT ON FUNCTION public.get_cart_suggestions_json IS 'Wrapper for get_cart_suggestions using single JSONB parameter for better PostgREST compatibility';
