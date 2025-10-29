-- Generate SKUs for all product variants based on parent product SKU
-- Format: PARENT-SKU-VARIANT-NAME (e.g., TUR-CAP-022-100G)

UPDATE product_variants pv
SET sku = CONCAT(
  p.sku, 
  '-', 
  UPPER(REPLACE(REPLACE(REPLACE(pv.name, ' ', ''), '.', ''), '/', '-'))
)
FROM products p
WHERE pv.product_id = p.id 
  AND pv.sku IS NULL 
  AND p.sku IS NOT NULL;

-- Add index for faster variant SKU lookups
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

-- Verify the update
SELECT 
  p.name as product_name,
  p.sku as product_sku,
  pv.name as variant_name,
  pv.sku as variant_sku
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
WHERE p.is_active = true
ORDER BY p.name, pv.sort_order
LIMIT 30;