import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchPixels,
  fetchEnabledPixels,
  createPixel,
  updatePixel,
  deletePixel,
  AdvertisingPixel,
} from '@/utils/pixelClient';
import { toast } from 'sonner';

export const PLATFORM_OPTIONS = [
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'meta_pixel', label: 'Meta (Facebook) Pixel' },
  { value: 'tiktok_pixel', label: 'TikTok Pixel' },
] as const;

// Pixel ID validation patterns
export const PIXEL_ID_PATTERNS = {
  google_ads: /^AW-\d{10,11}$/,
  meta_pixel: /^\d{15,16}$/,
  tiktok_pixel: /^[A-Z0-9]{20}$/,
};

export const validatePixelId = (platform: string, pixelId: string): boolean => {
  const pattern = PIXEL_ID_PATTERNS[platform as keyof typeof PIXEL_ID_PATTERNS];
  return pattern ? pattern.test(pixelId) : false;
};

/**
 * Hook for managing advertising pixels
 */
export const useAdvertisingPixels = () => {
  const queryClient = useQueryClient();

  const { data: pixels = [], isLoading } = useQuery({
    queryKey: ['advertising-pixels'],
    queryFn: fetchPixels,
    retry: 2,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const createPixelMutation = useMutation({
    mutationFn: (pixel: { platform: string; pixel_id: string; is_enabled: boolean }) =>
      createPixel(pixel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertising-pixels'] });
      toast.success('Advertising pixel added successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to add pixel';
      toast.error(message);
    },
  });

  const updatePixelMutation = useMutation({
    mutationFn: ({
      id,
      ...updates
    }: { id: string; pixel_id?: string; is_enabled?: boolean }) =>
      updatePixel(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertising-pixels'] });
      toast.success('Pixel updated successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update pixel';
      toast.error(message);
    },
  });

  const deletePixelMutation = useMutation({
    mutationFn: deletePixel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertising-pixels'] });
      toast.success('Pixel deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete pixel';
      toast.error(message);
    },
  });

  return {
    pixels,
    isLoading,
    createPixel: createPixelMutation,
    updatePixel: updatePixelMutation,
    deletePixel: deletePixelMutation,
  };
};

/**
 * Hook to get enabled pixels for frontend tracking
 */
export const useEnabledPixels = () => {
  return useQuery({
    queryKey: ['enabled-pixels'],
    queryFn: fetchEnabledPixels,
    retry: 2,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
