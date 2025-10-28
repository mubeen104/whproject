-- Drop and recreate pixel_performance_summary view with correct calculations
DROP VIEW IF EXISTS pixel_performance_summary;

CREATE OR REPLACE VIEW pixel_performance_summary AS
SELECT 
  pe.pixel_id,
  ap.platform,
  ap.pixel_id as tracking_id,
  ap.is_enabled as pixel_enabled,
  
  -- Event counts
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE pe.event_type = 'page_view') as page_views,
  COUNT(*) FILTER (WHERE pe.event_type IN ('view_content', 'view_item')) as content_views,
  COUNT(*) FILTER (WHERE pe.event_type = 'add_to_cart') as add_to_carts,
  COUNT(*) FILTER (WHERE pe.event_type IN ('initiate_checkout', 'begin_checkout')) as checkouts,
  COUNT(*) FILTER (WHERE pe.event_type = 'purchase') as purchases,
  
  -- Revenue calculations
  COALESCE(SUM(pe.event_value) FILTER (WHERE pe.event_type = 'purchase'), 0) as total_revenue,
  
  -- Unique counts
  COUNT(DISTINCT pe.session_id) as unique_sessions,
  COUNT(DISTINCT pe.user_id) FILTER (WHERE pe.user_id IS NOT NULL) as unique_users,
  
  -- Conversion rate (purchases / unique sessions)
  CASE 
    WHEN COUNT(DISTINCT pe.session_id) > 0 THEN 
      (COUNT(*) FILTER (WHERE pe.event_type = 'purchase')::numeric / COUNT(DISTINCT pe.session_id)::numeric) * 100
    ELSE 0
  END as conversion_rate,
  
  -- Average order value
  CASE 
    WHEN COUNT(*) FILTER (WHERE pe.event_type = 'purchase') > 0 THEN
      COALESCE(SUM(pe.event_value) FILTER (WHERE pe.event_type = 'purchase'), 0) / 
      NULLIF(COUNT(*) FILTER (WHERE pe.event_type = 'purchase'), 0)
    ELSE 0
  END as average_order_value,
  
  -- Add to cart rate (add_to_cart / content_views)
  CASE 
    WHEN COUNT(*) FILTER (WHERE pe.event_type IN ('view_content', 'view_item')) > 0 THEN
      (COUNT(*) FILTER (WHERE pe.event_type = 'add_to_cart')::numeric / 
       COUNT(*) FILTER (WHERE pe.event_type IN ('view_content', 'view_item'))::numeric) * 100
    ELSE 0
  END as add_to_cart_rate,
  
  -- Checkout rate (checkouts / add_to_cart)
  CASE 
    WHEN COUNT(*) FILTER (WHERE pe.event_type = 'add_to_cart') > 0 THEN
      (COUNT(*) FILTER (WHERE pe.event_type IN ('initiate_checkout', 'begin_checkout'))::numeric / 
       COUNT(*) FILTER (WHERE pe.event_type = 'add_to_cart')::numeric) * 100
    ELSE 0
  END as checkout_rate,
  
  -- Purchase rate (purchase / checkouts)
  CASE 
    WHEN COUNT(*) FILTER (WHERE pe.event_type IN ('initiate_checkout', 'begin_checkout')) > 0 THEN
      (COUNT(*) FILTER (WHERE pe.event_type = 'purchase')::numeric / 
       COUNT(*) FILTER (WHERE pe.event_type IN ('initiate_checkout', 'begin_checkout'))::numeric) * 100
    ELSE 0
  END as purchase_rate

FROM pixel_events pe
JOIN advertising_pixels ap ON pe.pixel_id = ap.id
GROUP BY pe.pixel_id, ap.platform, ap.pixel_id, ap.is_enabled;

-- Grant select permission to authenticated users
GRANT SELECT ON pixel_performance_summary TO authenticated;