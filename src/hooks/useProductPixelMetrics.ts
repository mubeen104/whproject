import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductPixelMetrics {
  product_id: string;
  product_name: string;
  product_image: string | null;
  total_views: number;
  total_add_to_carts: number;
  total_purchases: number;
  total_revenue: number;
  add_to_cart_rate: number;
  purchase_conversion_rate: number;
  average_order_value: number;
}

export interface PixelProductPerformance {
  pixel_platform: string;
  tracking_id: string;
  views: number;
  add_to_carts: number;
  purchases: number;
  revenue: number;
}

export const useProductPixelMetrics = (productId?: string) => {
  return useQuery({
    queryKey: ['product-pixel-metrics', productId],
    queryFn: async () => {
      // Use manual aggregation since RPC doesn't exist
      {
        let eventsQuery = supabase
          .from('pixel_events_detailed')
          .select('*');
        
        if (productId) {
          eventsQuery = eventsQuery.eq('product_id', productId);
        }

        const { data: events, error } = await eventsQuery;
        
        if (error) throw error;

        // Aggregate metrics manually
        const productMetrics = new Map<string, any>();

        events?.forEach(event => {
          if (!event.product_id) return;

          if (!productMetrics.has(event.product_id)) {
            productMetrics.set(event.product_id, {
              product_id: event.product_id,
              product_name: event.product_name,
              product_image: event.product_image,
              total_views: 0,
              total_add_to_carts: 0,
              total_purchases: 0,
              total_revenue: 0
            });
          }

          const metrics = productMetrics.get(event.product_id);

          if (event.event_type === 'view_content' || event.event_type === 'page_view') {
            metrics.total_views++;
          } else if (event.event_type === 'add_to_cart') {
            metrics.total_add_to_carts++;
          } else if (event.event_type === 'purchase') {
            metrics.total_purchases++;
            metrics.total_revenue += event.event_value || 0;
          }
        });

        const result = Array.from(productMetrics.values()).map(m => ({
          ...m,
          add_to_cart_rate: m.total_views > 0 ? (m.total_add_to_carts / m.total_views) * 100 : 0,
          purchase_conversion_rate: m.total_views > 0 ? (m.total_purchases / m.total_views) * 100 : 0,
          average_order_value: m.total_purchases > 0 ? m.total_revenue / m.total_purchases : 0
        }));

        return result as ProductPixelMetrics[];
      }
    }
  });
};

export const usePixelPerformanceByProduct = (productId: string) => {
  return useQuery({
    queryKey: ['pixel-performance-by-product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pixel_events_detailed')
        .select('*')
        .eq('product_id', productId);

      if (error) throw error;

      // Aggregate by pixel
      const pixelMetrics = new Map<string, any>();

      data?.forEach(event => {
        const key = `${event.pixel_platform}-${event.tracking_id}`;
        
        if (!pixelMetrics.has(key)) {
          pixelMetrics.set(key, {
            pixel_platform: event.pixel_platform,
            tracking_id: event.tracking_id,
            views: 0,
            add_to_carts: 0,
            purchases: 0,
            revenue: 0
          });
        }

        const metrics = pixelMetrics.get(key);

        if (event.event_type === 'view_content' || event.event_type === 'page_view') {
          metrics.views++;
        } else if (event.event_type === 'add_to_cart') {
          metrics.add_to_carts++;
        } else if (event.event_type === 'purchase') {
          metrics.purchases++;
          metrics.revenue += event.event_value || 0;
        }
      });

      return Array.from(pixelMetrics.values()) as PixelProductPerformance[];
    },
    enabled: !!productId
  });
};
