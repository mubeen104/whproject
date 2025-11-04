-- Create catalog_feeds table
CREATE TABLE IF NOT EXISTS public.catalog_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'xml',
  feed_url_slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  category_filter TEXT[] DEFAULT '{}',
  include_variants BOOLEAN NOT NULL DEFAULT true,
  cache_duration INTEGER NOT NULL DEFAULT 3600,
  last_generated_at TIMESTAMPTZ,
  last_error TEXT,
  generation_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create catalog_feed_history table
CREATE TABLE IF NOT EXISTS public.catalog_feed_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id UUID NOT NULL REFERENCES public.catalog_feeds(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'success',
  product_count INTEGER NOT NULL DEFAULT 0,
  validation_errors JSONB DEFAULT '[]',
  generation_time_ms INTEGER,
  file_size_bytes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.catalog_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_feed_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for catalog_feeds
CREATE POLICY "Admins can manage catalog feeds"
  ON public.catalog_feeds
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Active feeds are publicly readable"
  ON public.catalog_feeds
  FOR SELECT
  USING (is_active = true);

-- RLS Policies for catalog_feed_history
CREATE POLICY "Admins can view feed history"
  ON public.catalog_feed_history
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert feed history"
  ON public.catalog_feed_history
  FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_catalog_feeds_slug ON public.catalog_feeds(feed_url_slug);
CREATE INDEX idx_catalog_feeds_active ON public.catalog_feeds(is_active);
CREATE INDEX idx_catalog_feed_history_feed_id ON public.catalog_feed_history(feed_id);

-- Add trigger for updated_at
CREATE TRIGGER update_catalog_feeds_updated_at
  BEFORE UPDATE ON public.catalog_feeds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();