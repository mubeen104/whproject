-- Create enriched pixel events view with product, user, and order details
CREATE OR REPLACE VIEW pixel_events_detailed AS
SELECT 
  pe.id,
  pe.created_at,
  pe.event_type,
  pe.event_value,
  pe.currency,
  pe.session_id,
  pe.user_id,
  pe.order_id,
  pe.metadata,
  
  -- Pixel info
  ap.platform as pixel_platform,
  ap.pixel_id as tracking_id,
  ap.is_enabled as pixel_enabled,
  
  -- Product info
  p.id as product_id,
  p.name as product_name,
  p.slug as product_slug,
  p.price as product_price,
  p.sku as product_sku,
  (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order LIMIT 1) as product_image,
  
  -- User info (if authenticated)
  pr.email as user_email,
  COALESCE(pr.first_name || ' ' || pr.last_name, 'Guest User') as user_name,
  
  -- Order info (if purchase)
  o.order_number,
  o.total_amount as order_total,
  o.status as order_status
  
FROM pixel_events pe
LEFT JOIN advertising_pixels ap ON pe.pixel_id = ap.id
LEFT JOIN products p ON pe.product_id = p.id
LEFT JOIN profiles pr ON pe.user_id = pr.user_id
LEFT JOIN orders o ON pe.order_id = o.id
WHERE has_role(auth.uid(), 'admin')
ORDER BY pe.created_at DESC;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pixel_events_created_at ON pixel_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pixel_events_event_type ON pixel_events(event_type);
CREATE INDEX IF NOT EXISTS idx_pixel_events_pixel_id ON pixel_events(pixel_id);
CREATE INDEX IF NOT EXISTS idx_pixel_events_product_id ON pixel_events(product_id);
CREATE INDEX IF NOT EXISTS idx_pixel_events_user_id ON pixel_events(user_id);
CREATE INDEX IF NOT EXISTS idx_pixel_events_session_id ON pixel_events(session_id);
CREATE INDEX IF NOT EXISTS idx_pixel_events_order_id ON pixel_events(order_id);