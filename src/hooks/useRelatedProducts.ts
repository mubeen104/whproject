import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price: number | null;
  inventory_quantity: number;
  is_best_seller: boolean;
  is_featured: boolean;
  image_url: string;
  image_alt: string;
  recommendation_score: number;
}

export const useRelatedProducts = (productId: string, limit: number = 6, excludeIds: string[] = []) => {
  return useQuery({
    queryKey: ['related-products', productId, limit, excludeIds],
    queryFn: async (): Promise<RelatedProduct[]> => {
      if (!productId) {
        return [];
      }

      const { data, error } = await supabase
        .rpc('get_related_products', {
          p_product_id: productId,
          p_limit: limit,
          p_exclude_ids: excludeIds
        });

      if (error) {
        console.error('Error fetching related products:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};

export const trackRelatedProductView = async (
  productId: string,
  recommendedProductId: string,
  sessionId: string,
  userId?: string
) => {
  try {
    await supabase
      .from('product_recommendation_views')
      .insert({
        product_id: productId,
        recommended_product_id: recommendedProductId,
        session_id: sessionId,
        user_id: userId || null,
        source: 'product_page'
      });
  } catch (error) {
    console.error('Error tracking related product view:', error);
  }
};

export const trackRelatedProductConversion = async (
  productId: string,
  recommendedProductId: string,
  sessionId: string,
  userId?: string
) => {
  try {
    await supabase
      .from('product_recommendation_conversions')
      .insert({
        product_id: productId,
        recommended_product_id: recommendedProductId,
        session_id: sessionId,
        user_id: userId || null,
        source: 'product_page'
      });
  } catch (error) {
    console.error('Error tracking related product conversion:', error);
  }
};
