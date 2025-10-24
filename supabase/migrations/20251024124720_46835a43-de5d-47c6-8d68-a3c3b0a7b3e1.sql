-- Create function to decrement product inventory
CREATE OR REPLACE FUNCTION public.decrement_product_inventory(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE products
  SET inventory_quantity = inventory_quantity - p_quantity
  WHERE id = p_product_id;
END;
$$;

-- Create function to decrement variant inventory
CREATE OR REPLACE FUNCTION public.decrement_variant_inventory(
  p_variant_id UUID,
  p_quantity INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE product_variants
  SET inventory_quantity = inventory_quantity - p_quantity
  WHERE id = p_variant_id;
END;
$$;