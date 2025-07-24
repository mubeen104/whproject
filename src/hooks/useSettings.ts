import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Setting {
  id: string;
  key: string;
  value: any;
  category: string;
  description?: string;
}

export const useSettings = (category?: string) => {
  return useQuery({
    queryKey: ['settings', category],
    queryFn: async () => {
      let query = supabase.from('settings').select('*');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Convert to key-value format for easier use
      const settingsMap: Record<string, any> = {};
      data?.forEach((setting: Setting) => {
        settingsMap[setting.key] = setting.value;
      });
      
      return settingsMap;
    },
  });
};

export const useUpdateSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Array<{ key: string; value: any; category: string }>) => {
      const updates = settings.map(async (setting) => {
        const { error } = await supabase
          .from('settings')
          .upsert({
            key: setting.key,
            value: setting.value,
            category: setting.category,
          }, {
            onConflict: 'key'
          });

        if (error) throw error;
      });

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: 'Success',
        description: 'Settings updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Settings update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    },
  });
};