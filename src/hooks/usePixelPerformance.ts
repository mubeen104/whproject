import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PixelPerformance {
  pixel_id: string;
  platform: string;
  tracking_id: string;
  pixel_enabled: boolean;
  total_events: number;
  page_views: number;
  content_views: number;
  add_to_carts: number;
  checkouts: number;
  purchases: number;
  total_revenue: number;
  unique_sessions: number;
  unique_users: number;
  conversion_rate: number;
  average_order_value: number;
  add_to_cart_rate: number;
  checkout_rate: number;
  purchase_rate: number;
}

export interface PixelEventDetail {
  id: string;
  pixel_id: string;
  event_type: string;
  event_value: number;
  currency: string;
  product_id: string | null;
  order_id: string | null;
  user_id: string | null;
  session_id: string | null;
  metadata: any;
  created_at: string;
}

export const usePixelPerformance = () => {
  return useQuery({
    queryKey: ['pixel-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pixel_performance_summary')
        .select('*')
        .order('total_events', { ascending: false });
      
      if (error) throw error;
      return data as PixelPerformance[];
    }
  });
};

export const usePixelEvents = (pixelId?: string, limit = 100) => {
  return useQuery({
    queryKey: ['pixel-events', pixelId],
    queryFn: async () => {
      let query = supabase
        .from('pixel_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (pixelId) {
        query = query.eq('pixel_id', pixelId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as PixelEventDetail[];
    },
    enabled: !!pixelId
  });
};

export const usePixelEventsByDateRange = (
  pixelId: string,
  startDate: string,
  endDate: string
) => {
  return useQuery({
    queryKey: ['pixel-events-range', pixelId, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pixel_events')
        .select('*')
        .eq('pixel_id', pixelId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PixelEventDetail[];
    },
    enabled: !!pixelId && !!startDate && !!endDate
  });
};

export const trackPixelEvent = async (data: {
  pixelId: string;
  eventType: string;
  eventValue?: number;
  currency?: string;
  productId?: string;
  orderId?: string;
  userId?: string;
  sessionId?: string;
  metadata?: any;
}) => {
  const { error } = await supabase.from('pixel_events').insert({
    pixel_id: data.pixelId,
    event_type: data.eventType,
    event_value: data.eventValue || 0,
    currency: data.currency || 'USD',
    product_id: data.productId,
    order_id: data.orderId,
    user_id: data.userId,
    session_id: data.sessionId,
    metadata: data.metadata || {}
  });

  if (error) throw error;
};
