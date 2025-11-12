import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductRating {
  productId: string;
  averageRating: number;
  reviewCount: number;
}

export const useProductRatings = (productIds: string[]) => {
  return useQuery({
    queryKey: ['product-ratings', productIds],
    queryFn: async () => {
      if (!productIds.length) return [];

      const { data, error } = await supabase
        .from('reviews')
        .select('product_id, rating')
        .in('product_id', productIds)
        .eq('is_approved', true);

      if (error) throw error;

      const ratingsMap = new Map<string, { total: number; count: number }>();

      data?.forEach((review) => {
        const current = ratingsMap.get(review.product_id) || { total: 0, count: 0 };
        ratingsMap.set(review.product_id, {
          total: current.total + review.rating,
          count: current.count + 1,
        });
      });

      return productIds.map((productId) => {
        const rating = ratingsMap.get(productId);
        return {
          productId,
          averageRating: rating ? rating.total / rating.count : 0,
          reviewCount: rating ? rating.count : 0,
        };
      });
    },
    enabled: productIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProductRating = (productId: string) => {
  return useQuery({
    queryKey: ['product-rating', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId)
        .eq('is_approved', true);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { averageRating: 0, reviewCount: 0 };
      }

      const total = data.reduce((sum, review) => sum + review.rating, 0);
      return {
        averageRating: total / data.length,
        reviewCount: data.length,
      };
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};
