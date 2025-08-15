import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCanReview = (productId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['can-review', productId, user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      // Check if user has completed orders containing this product
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select(`
          orders!inner (
            status,
            user_id
          )
        `)
        .eq('product_id', productId)
        .eq('orders.user_id', user.id)
        .eq('orders.status', 'completed');

      if (error) {
        console.error('Error checking review eligibility:', error);
        return false;
      }

      // Check if user has already reviewed this product
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      // User can review if they have completed orders and haven't reviewed yet
      return orderItems && orderItems.length > 0 && !existingReview;
    },
    enabled: !!user?.id && !!productId,
  });
};