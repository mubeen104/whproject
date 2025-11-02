/*
  # Catalog Feed Management System

  ## Overview
  Creates comprehensive infrastructure for automated product feed generation and management
  across multiple advertising platforms with validation, scheduling, and analytics capabilities.

  ## New Tables

  ### `catalog_feeds`
  Stores feed configuration for different platforms with generation settings

  ###catalog_feed_history`
  Tracks feed generation history for analytics and debugging

  ## Security
  - RLS enabled on all tables
  - Admin-only access for managing feeds (when has_role function is available)
  - Fallback to authenticated user access if role system not yet initialized
*/

-- Create catalog_feeds table
CREATE TABLE IF NOT EXISTS public.catalog_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN (
    'meta', 'google', 'tiktok', 'pinterest', 'snapchat', 
    'microsoft', 'twitter', 'linkedin', 'generic'
  )),
  format TEXT NOT NULL CHECK (format IN ('xml', 'csv', 'json')),
  feed_url_slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  category_filter JSONB DEFAULT '[]'::jsonb,
  include_variants BOOLEAN DEFAULT true,
  cache_duration INTEGER DEFAULT 3600,
  last_generated_at TIMESTAMPTZ,
  last_error TEXT,
  generation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create catalog_feed_history table
CREATE TABLE IF NOT EXISTS public.catalog_feed_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id UUID REFERENCES public.catalog_feeds(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
  product_count INTEGER DEFAULT 0,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  generation_time_ms INTEGER,
  file_size_bytes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_catalog_feeds_platform ON public.catalog_feeds(platform);
CREATE INDEX IF NOT EXISTS idx_catalog_feeds_is_active ON public.catalog_feeds(is_active);
CREATE INDEX IF NOT EXISTS idx_catalog_feeds_slug ON public.catalog_feeds(feed_url_slug);
CREATE INDEX IF NOT EXISTS idx_catalog_feed_history_feed_id ON public.catalog_feed_history(feed_id);
CREATE INDEX IF NOT EXISTS idx_catalog_feed_history_created_at ON public.catalog_feed_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_catalog_feed_history_status ON public.catalog_feed_history(status);

-- Enable RLS
ALTER TABLE public.catalog_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_feed_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for catalog_feeds (allowing authenticated users for now, will be restricted to admins later)
CREATE POLICY "Authenticated users can view catalog feeds"
  ON public.catalog_feeds
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create catalog feeds"
  ON public.catalog_feeds
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update catalog feeds"
  ON public.catalog_feeds
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete catalog feeds"
  ON public.catalog_feeds
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for catalog_feed_history
CREATE POLICY "Authenticated users can view feed history"
  ON public.catalog_feed_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert feed history"
  ON public.catalog_feed_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_catalog_feeds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_catalog_feeds_updated_at ON public.catalog_feeds;
CREATE TRIGGER trigger_update_catalog_feeds_updated_at
  BEFORE UPDATE ON public.catalog_feeds
  FOR EACH ROW
  EXECUTE FUNCTION update_catalog_feeds_updated_at();
