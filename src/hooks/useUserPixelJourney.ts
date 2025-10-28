import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DetailedPixelEvent } from './usePixelEventDetails';

export interface UserJourneyStep extends DetailedPixelEvent {
  timeFromPrevious?: number;
  stepNumber: number;
}

export const useUserPixelJourney = (userId?: string, sessionId?: string) => {
  return useQuery({
    queryKey: ['user-pixel-journey', userId, sessionId],
    queryFn: async () => {
      let query = supabase
        .from('pixel_events_detailed')
        .select('*')
        .order('created_at', { ascending: true });

      if (userId) {
        query = query.eq('user_id', userId);
      } else if (sessionId) {
        query = query.eq('session_id', sessionId);
      } else {
        return { steps: [], totalDuration: 0, conversionFunnel: {} };
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate time between steps
      const steps: UserJourneyStep[] = data.map((event, index) => {
        const step: UserJourneyStep = {
          ...event,
          stepNumber: index + 1
        };

        if (index > 0) {
          const prevTime = new Date(data[index - 1].created_at).getTime();
          const currTime = new Date(event.created_at).getTime();
          step.timeFromPrevious = Math.round((currTime - prevTime) / 1000); // seconds
        }

        return step;
      });

      // Calculate funnel progression
      const funnel = {
        page_views: steps.filter(s => s.event_type === 'page_view').length,
        product_views: steps.filter(s => s.event_type === 'view_content').length,
        add_to_carts: steps.filter(s => s.event_type === 'add_to_cart').length,
        checkouts: steps.filter(s => s.event_type === 'initiate_checkout').length,
        purchases: steps.filter(s => s.event_type === 'purchase').length
      };

      // Calculate total journey duration
      const totalDuration = steps.length > 0
        ? new Date(steps[steps.length - 1].created_at).getTime() - new Date(steps[0].created_at).getTime()
        : 0;

      return {
        steps,
        totalDuration: Math.round(totalDuration / 1000), // seconds
        conversionFunnel: funnel
      };
    },
    enabled: !!(userId || sessionId)
  });
};

export const useSessionSummary = (sessionId: string) => {
  return useQuery({
    queryKey: ['session-summary', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pixel_events_detailed')
        .select('*')
        .eq('session_id', sessionId);

      if (error) throw error;

      const events = data || [];
      const productsViewed = new Set(events.filter(e => e.product_id).map(e => e.product_id));
      const totalValue = events.reduce((sum, e) => sum + (e.event_value || 0), 0);

      return {
        totalEvents: events.length,
        uniqueProducts: productsViewed.size,
        totalValue,
        hasCheckout: events.some(e => e.event_type === 'initiate_checkout'),
        hasPurchase: events.some(e => e.event_type === 'purchase'),
        userId: events.find(e => e.user_id)?.user_id || null,
        userName: events.find(e => e.user_name)?.user_name || 'Guest User'
      };
    },
    enabled: !!sessionId
  });
};
