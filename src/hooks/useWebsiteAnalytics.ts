import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useWebsiteAnalytics = (dateRange: { from: Date; to: Date }) => {
  return useQuery({
    queryKey: ['website-analytics', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('website_analytics')
        .select('*')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useAnalyticsSummary = (days: number = 30) => {
  return useQuery({
    queryKey: ['analytics-summary', days],
    queryFn: async () => {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('analytics_summary')
        .select('*')
        .gte('date', fromDate.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(days);

      if (error) throw error;
      return data || [];
    },
  });
};

export const useTrafficByDevice = (days: number = 30) => {
  return useQuery({
    queryKey: ['traffic-by-device', days],
    queryFn: async () => {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('website_analytics')
        .select('device_type')
        .gte('created_at', fromDate.toISOString());

      if (error) throw error;
      
      const deviceCounts = data.reduce((acc: Record<string, number>, item) => {
        const device = item.device_type || 'unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(deviceCounts).map(([device, count]) => ({
        device,
        count,
        percentage: Math.round((count / data.length) * 100)
      }));
    },
  });
};

export const useTopPages = (days: number = 30) => {
  return useQuery({
    queryKey: ['top-pages', days],
    queryFn: async () => {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('website_analytics')
        .select('page_url, page_title')
        .gte('created_at', fromDate.toISOString());

      if (error) throw error;
      
      const pageCounts = data.reduce((acc: Record<string, { title: string; count: number }>, item) => {
        const url = item.page_url || 'unknown';
        const title = item.page_title || url;
        if (!acc[url]) {
          acc[url] = { title, count: 0 };
        }
        acc[url].count += 1;
        return acc;
      }, {});

      return Object.entries(pageCounts)
        .map(([url, data]) => ({
          url,
          title: data.title,
          visits: data.count
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);
    },
  });
};

export const useReferrerSources = (days: number = 30) => {
  return useQuery({
    queryKey: ['referrer-sources', days],
    queryFn: async () => {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('website_analytics')
        .select('referrer_domain')
        .gte('created_at', fromDate.toISOString());

      if (error) throw error;
      
      const referrerCounts = data.reduce((acc: Record<string, number>, item) => {
        const referrer = item.referrer_domain || 'direct';
        acc[referrer] = (acc[referrer] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(referrerCounts)
        .map(([source, visits]) => ({
          source,
          visits,
          percentage: Math.round((visits / data.length) * 100)
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);
    },
  });
};