-- Add best seller and new arrival flags to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_best_seller boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_new_arrival boolean DEFAULT false;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller) WHERE is_best_seller = true AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(is_new_arrival) WHERE is_new_arrival = true AND is_active = true;

-- Add comment for documentation
COMMENT ON COLUMN products.is_best_seller IS 'Flag to mark product as best seller for homepage display';
COMMENT ON COLUMN products.is_new_arrival IS 'Flag to mark product as new arrival for homepage display';