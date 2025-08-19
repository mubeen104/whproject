import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdvertisingPixel {
  id: string;
  platform: 'google_ads' | 'meta_pixel' | 'tiktok_pixel' | 'linkedin_insight' | 'twitter_pixel' | 'pinterest_tag' | 'snapchat_pixel' | 'microsoft_advertising' | 'reddit_pixel' | 'quora_pixel';
  pixel_id: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const PLATFORM_OPTIONS = [
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'meta_pixel', label: 'Meta (Facebook) Pixel' },
  { value: 'tiktok_pixel', label: 'TikTok Pixel' },
  { value: 'linkedin_insight', label: 'LinkedIn Insight Tag' },
  { value: 'twitter_pixel', label: 'Twitter/X Pixel' },
  { value: 'pinterest_tag', label: 'Pinterest Tag' },
  { value: 'snapchat_pixel', label: 'Snapchat Pixel' },
  { value: 'microsoft_advertising', label: 'Microsoft Advertising' },
  { value: 'reddit_pixel', label: 'Reddit Pixel' },
  { value: 'quora_pixel', label: 'Quora Pixel' }
] as const;

// Pixel ID validation patterns
export const PIXEL_ID_PATTERNS = {
  google_ads: /^AW-\d{10,11}$/,
  meta_pixel: /^\d{15,16}$/,
  tiktok_pixel: /^[A-Z0-9]{20}$/,
  linkedin_insight: /^\d{6,8}$/,
  twitter_pixel: /^[a-z0-9]{5,10}$/,
  pinterest_tag: /^\d{13}$/,
  snapchat_pixel: /^[a-z0-9-]{36}$/,
  microsoft_advertising: /^\d{8,9}$/,
  reddit_pixel: /^t2_[a-zA-Z0-9]{6,8}$/,
  quora_pixel: /^[a-f0-9]{32}$/
};

export const validatePixelId = (platform: string, pixelId: string): boolean => {
  const pattern = PIXEL_ID_PATTERNS[platform as keyof typeof PIXEL_ID_PATTERNS];
  return pattern ? pattern.test(pixelId) : false;
};

export const useAdvertisingPixels = () => {
  const queryClient = useQueryClient();

  const { data: pixels = [], isLoading } = useQuery({
    queryKey: ['advertising-pixels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advertising_pixels')
        .select('*')
        .order('platform');
      
      if (error) throw error;
      return data as AdvertisingPixel[];
    }
  });

  const createPixel = useMutation({
    mutationFn: async (pixel: Omit<AdvertisingPixel, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('advertising_pixels')
        .insert(pixel)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertising-pixels'] });
      toast.success('Advertising pixel added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add pixel');
    }
  });

  const updatePixel = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AdvertisingPixel> & { id: string }) => {
      const { data, error } = await supabase
        .from('advertising_pixels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertising-pixels'] });
      toast.success('Pixel updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update pixel');
    }
  });

  const deletePixel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('advertising_pixels')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertising-pixels'] });
      toast.success('Pixel deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete pixel');
    }
  });

  return {
    pixels,
    isLoading,
    createPixel,
    updatePixel,
    deletePixel
  };
};

// Hook to get enabled pixels for frontend tracking
export const useEnabledPixels = () => {
  return useQuery({
    queryKey: ['enabled-pixels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advertising_pixels')
        .select('*')
        .eq('is_enabled', true);
      
      if (error) throw error;
      return data as AdvertisingPixel[];
    }
  });
};