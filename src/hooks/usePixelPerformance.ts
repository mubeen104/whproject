import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PixelPerformance {
  platform: string;
  tracking_id: string;
  page_views: number;
  content_views: number;
  add_to_carts: number;
  checkouts: number;
  purchases: number;
  unique_users: number;
  total_revenue: number;
  conversion_rate: number;
  add_to_cart_rate: number;
  checkout_rate: number;
  purchase_rate: number;
  average_order_value: number;
  total_events: number;
}

export function usePixelPerformance(pixelId?: string) {
  return useQuery({
    queryKey: ['pixel-performance', pixelId],
    queryFn: async (): Promise<PixelPerformance[]> => {
      // This is a placeholder - in production you'd fetch from pixel_events table
      // and aggregate the data by platform
      const { data: pixels, error } = await supabase
        .from('advertising_pixels')
        .select('*')
        .eq('is_enabled', true);

      if (error) throw error;

      // Return mock performance data based on enabled pixels
      return (pixels || []).map(pixel => ({
        platform: pixel.platform,
        tracking_id: pixel.pixel_id,
        page_views: 0,
        content_views: 0,
        add_to_carts: 0,
        checkouts: 0,
        purchases: 0,
        unique_users: 0,
        total_revenue: 0,
        conversion_rate: 0,
        add_to_cart_rate: 0,
        checkout_rate: 0,
        purchase_rate: 0,
        average_order_value: 0,
        total_events: 0,
      }));
    },
    enabled: true,
  });
}
