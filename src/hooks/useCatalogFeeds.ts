import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type CatalogPlatform =
  | 'meta'
  | 'google'
  | 'tiktok'
  | 'pinterest'
  | 'snapchat'
  | 'microsoft'
  | 'twitter'
  | 'linkedin'
  | 'generic';

export type FeedFormat = 'xml' | 'csv' | 'json';

export interface CatalogFeed {
  id: string;
  name: string;
  platform: CatalogPlatform;
  format: FeedFormat;
  feed_url_slug: string;
  is_active: boolean;
  category_filter: string[];
  include_variants: boolean;
  cache_duration: number;
  last_generated_at: string | null;
  last_error: string | null;
  generation_count: number;
  created_at: string;
  updated_at: string;
}

export interface FeedHistory {
  id: string;
  feed_id: string;
  status: 'success' | 'failed' | 'partial';
  product_count: number;
  validation_errors: any[];
  generation_time_ms: number | null;
  file_size_bytes: number | null;
  created_at: string;
}

export const useCatalogFeeds = () => {
  const queryClient = useQueryClient();

  const { data: feeds = [], isLoading } = useQuery({
    queryKey: ['catalog-feeds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog_feeds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CatalogFeed[];
    }
  });

  const createFeed = useMutation({
    mutationFn: async (feed: Omit<CatalogFeed, 'id' | 'created_at' | 'updated_at' | 'last_generated_at' | 'last_error' | 'generation_count'>) => {
      const { data, error } = await supabase
        .from('catalog_feeds')
        .insert({
          ...feed,
          category_filter: feed.category_filter || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-feeds'] });
      toast.success('Feed created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create feed');
    }
  });

  const updateFeed = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CatalogFeed> & { id: string }) => {
      const { data, error } = await supabase
        .from('catalog_feeds')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-feeds'] });
      toast.success('Feed updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update feed');
    }
  });

  const deleteFeed = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('catalog_feeds')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-feeds'] });
      toast.success('Feed deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete feed');
    }
  });

  const getFeedUrl = (feedSlug: string, format: FeedFormat = 'xml') => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/catalog-feed/${feedSlug}`;
  };

  const testFeed = async (feedSlug: string) => {
    try {
      const url = getFeedUrl(feedSlug);
      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Feed test failed');
      }

      const productCount = response.headers.get('X-Product-Count');
      const generationTime = response.headers.get('X-Generation-Time-Ms');

      toast.success(`Feed test successful! ${productCount} products generated in ${generationTime}ms`);
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Feed test failed');
      return false;
    }
  };

  return {
    feeds,
    isLoading,
    createFeed,
    updateFeed,
    deleteFeed,
    getFeedUrl,
    testFeed,
  };
};

export const useFeedHistory = (feedId: string) => {
  return useQuery({
    queryKey: ['catalog-feed-history', feedId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog_feed_history')
        .select('*')
        .eq('feed_id', feedId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as FeedHistory[];
    },
    enabled: !!feedId,
  });
};

export const PLATFORM_OPTIONS = [
  { value: 'meta', label: 'Meta (Facebook/Instagram)', icon: '📱' },
  { value: 'google', label: 'Google Merchant Center', icon: '🔍' },
  { value: 'tiktok', label: 'TikTok Ads', icon: '🎵' },
  { value: 'pinterest', label: 'Pinterest Catalogs', icon: '📌' },
  { value: 'snapchat', label: 'Snapchat Ads', icon: '👻' },
  { value: 'microsoft', label: 'Microsoft Advertising', icon: '🔷' },
  { value: 'twitter', label: 'Twitter/X Ads', icon: '🐦' },
  { value: 'linkedin', label: 'LinkedIn Ads', icon: '💼' },
  { value: 'generic', label: 'Generic Format', icon: '📦' }
] as const;

export const FORMAT_OPTIONS = [
  { value: 'xml', label: 'XML', description: 'Best for Google, Meta, Pinterest' },
  { value: 'csv', label: 'CSV', description: 'Best for bulk imports, spreadsheets' },
  { value: 'json', label: 'JSON', description: 'Best for TikTok, LinkedIn, custom APIs' }
] as const;
