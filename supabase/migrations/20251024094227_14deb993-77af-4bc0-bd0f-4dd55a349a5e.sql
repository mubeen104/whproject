-- Create pixel performance tracking table
CREATE TABLE public.pixel_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pixel_id UUID NOT NULL REFERENCES public.advertising_pixels(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_value NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  product_id UUID,
  order_id UUID,
  user_id UUID,
  session_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_pixel_events_pixel_id ON public.pixel_events(pixel_id);
CREATE INDEX idx_pixel_events_event_type ON public.pixel_events(event_type);
CREATE INDEX idx_pixel_events_created_at ON public.pixel_events(created_at DESC);
CREATE INDEX idx_pixel_events_user_id ON public.pixel_events(user_id);

-- Enable RLS
ALTER TABLE public.pixel_events ENABLE ROW LEVEL SECURITY;

-- Admin can view all pixel events
CREATE POLICY "Admins can view all pixel events"
ON public.pixel_events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can insert pixel events (for tracking)
CREATE POLICY "Public can insert pixel events"
ON public.pixel_events
FOR INSERT
WITH CHECK (true);

-- Create view for pixel performance summary
CREATE OR REPLACE VIEW public.pixel_performance_summary AS
SELECT 
  p.id as pixel_id,
  p.platform,
  p.pixel_id as tracking_id,
  COUNT(DISTINCT pe.id) as total_events,
  COUNT(DISTINCT CASE WHEN pe.event_type = 'page_view' THEN pe.id END) as page_views,
  COUNT(DISTINCT CASE WHEN pe.event_type = 'view_content' THEN pe.id END) as content_views,
  COUNT(DISTINCT CASE WHEN pe.event_type = 'add_to_cart' THEN pe.id END) as add_to_carts,
  COUNT(DISTINCT CASE WHEN pe.event_type = 'initiate_checkout' THEN pe.id END) as checkouts,
  COUNT(DISTINCT CASE WHEN pe.event_type = 'purchase' THEN pe.id END) as purchases,
  COALESCE(SUM(CASE WHEN pe.event_type = 'purchase' THEN pe.event_value ELSE 0 END), 0) as total_revenue,
  COUNT(DISTINCT pe.session_id) as unique_sessions,
  COUNT(DISTINCT pe.user_id) as unique_users,
  CASE 
    WHEN COUNT(DISTINCT CASE WHEN pe.event_type = 'page_view' THEN pe.id END) > 0 
    THEN (COUNT(DISTINCT CASE WHEN pe.event_type = 'purchase' THEN pe.id END)::NUMERIC / 
          COUNT(DISTINCT CASE WHEN pe.event_type = 'page_view' THEN pe.id END)::NUMERIC * 100)
    ELSE 0 
  END as conversion_rate
FROM public.advertising_pixels p
LEFT JOIN public.pixel_events pe ON p.id = pe.pixel_id
GROUP BY p.id, p.platform, p.pixel_id;

-- Grant access to view
GRANT SELECT ON public.pixel_performance_summary TO authenticated, anon;