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

export interface UseRelatedProductsResult {
  data: RelatedProduct[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  refetch: () => void;
}

export const useRelatedProducts = (productId: string, limit: number = 6, excludeIds: string[] = []): UseRelatedProductsResult => {
  const result = useQuery({
    queryKey: ['related-products', productId, limit, excludeIds],
    queryFn: async (): Promise<RelatedProduct[]> => {
      if (!productId) {
        return [];
      }

      try {
        // Call with parameters in alphabetical order as separate arguments
        const { data, error } = await supabase
          .rpc('get_related_products', {
            p_exclude_ids: excludeIds,
            p_limit: limit,
            p_product_id: productId
          });

        if (error) {
          console.error('Error fetching related products:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('Unexpected error in useRelatedProducts:', error);
        throw error;
      }
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on validation errors or function not found
      if (error instanceof Error) {
        if (error.message?.includes('p_product_id is required')) return false;
        if (error.message?.includes('function not found')) return false;
        if (error.message?.includes('permission denied')) return false;
        if (error.message?.includes('42703')) return false; // Column does not exist
      }
      // Retry on network/database errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff, max 30s
    onError: (error) => {
      console.error('Related products query failed:', error);
      // Global error logging could go here
    }
  });

  return {
    data: result.data || [],
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error || null,
    isSuccess: result.isSuccess,
    refetch: result.refetch,
  };
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
