import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EventFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  eventTypes?: string[];
  platforms?: string[];
  productId?: string;
  userId?: string;
  sessionId?: string;
  minValue?: number;
  maxValue?: number;
}

export interface DetailedPixelEvent {
  id: string;
  created_at: string;
  event_type: string;
  event_value: number;
  currency: string;
  session_id: string | null;
  user_id: string | null;
  order_id: string | null;
  metadata: any;
  pixel_platform: string;
  tracking_id: string;
  pixel_enabled: boolean;
  product_id: string | null;
  product_name: string | null;
  product_slug: string | null;
  product_price: number | null;
  product_sku: string | null;
  product_image: string | null;
  user_email: string | null;
  user_name: string;
  order_number: string | null;
  order_total: number | null;
  order_status: string | null;
}

export const usePixelEventDetails = (
  filters: EventFilters = {},
  page: number = 1,
  pageSize: number = 50
) => {
  return useQuery({
    queryKey: ['pixel-event-details', filters, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('pixel_events_detailed')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end);
      }

      if (filters.eventTypes && filters.eventTypes.length > 0) {
        query = query.in('event_type', filters.eventTypes);
      }

      if (filters.platforms && filters.platforms.length > 0) {
        query = query.in('pixel_platform', filters.platforms);
      }

      if (filters.productId) {
        query = query.eq('product_id', filters.productId);
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.sessionId) {
        query = query.eq('session_id', filters.sessionId);
      }

      if (filters.minValue !== undefined) {
        query = query.gte('event_value', filters.minValue);
      }

      if (filters.maxValue !== undefined) {
        query = query.lte('event_value', filters.maxValue);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      // Execute query
      const { data, error, count } = await query;

      if (error) throw error;

      return {
        events: data as DetailedPixelEvent[],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    }
  });
};

export const usePixelEventById = (eventId: string) => {
  return useQuery({
    queryKey: ['pixel-event-detail', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pixel_events_detailed')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data as DetailedPixelEvent;
    },
    enabled: !!eventId
  });
};
