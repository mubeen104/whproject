-- Create analytics table for website traffic monitoring
CREATE TABLE public.website_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_ip TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser_name TEXT,
  os_name TEXT,
  country TEXT,
  city TEXT,
  referrer_url TEXT,
  referrer_domain TEXT,
  page_url TEXT NOT NULL,
  page_title TEXT,
  session_id TEXT,
  is_unique_visitor BOOLEAN DEFAULT true,
  visit_duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.website_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for website analytics
CREATE POLICY "Admins can view all analytics" 
ON public.website_analytics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can insert analytics data" 
ON public.website_analytics 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_website_analytics_created_at ON public.website_analytics(created_at DESC);
CREATE INDEX idx_website_analytics_country ON public.website_analytics(country);
CREATE INDEX idx_website_analytics_device_type ON public.website_analytics(device_type);
CREATE INDEX idx_website_analytics_referrer_domain ON public.website_analytics(referrer_domain);
CREATE INDEX idx_website_analytics_page_url ON public.website_analytics(page_url);

-- Create function to update visit duration (fixed syntax)
CREATE OR REPLACE FUNCTION public.update_visit_duration(
  p_session_id TEXT,
  p_duration INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.website_analytics
  SET visit_duration = p_duration
  WHERE session_id = p_session_id
    AND visit_duration IS NULL;
END;
$$;

-- Create analytics summary view for easier querying
CREATE OR REPLACE VIEW public.analytics_summary AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_visits,
  COUNT(DISTINCT visitor_ip) as unique_visitors,
  COUNT(CASE WHEN device_type = 'mobile' THEN 1 END) as mobile_visits,
  COUNT(CASE WHEN device_type = 'desktop' THEN 1 END) as desktop_visits,
  COUNT(CASE WHEN device_type = 'tablet' THEN 1 END) as tablet_visits,
  AVG(visit_duration) as avg_duration
FROM public.website_analytics
GROUP BY DATE(created_at)
ORDER BY date DESC;