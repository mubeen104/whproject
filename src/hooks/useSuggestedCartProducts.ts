import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SuggestedProduct {
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
  suggestion_score: number;
}

export interface UseSuggestedCartProductsResult {
  data: SuggestedProduct[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  refetch: () => void;
}

interface CartItem {
  product_id?: string;
  products?: { id: string };
  product?: { id: string };
}

export const useSuggestedCartProducts = (cartItems: CartItem[], limit: number = 4): UseSuggestedCartProductsResult => {
  const cartProductIds = cartItems.map(item =>
    item.product_id || item.products?.id || item.product?.id
  ).filter(Boolean) as string[];

  const result = useQuery({
    queryKey: ['cart-suggestions', cartProductIds, limit],
    queryFn: async (): Promise<SuggestedProduct[]> => {
      if (!cartProductIds || cartProductIds.length === 0) {
        return [];
      }

      try {
        const { data, error } = await supabase
          .rpc('get_cart_suggestions_json', {
            p_cart_product_ids: cartProductIds,
            p_limit: limit
          });

        if (error) {
          console.error('Error fetching cart suggestions:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('Unexpected error in useSuggestedCartProducts:', error);
        throw error;
      }
    },
    enabled: cartProductIds.length > 0,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes (shorter for cart)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on validation errors or function not found
      if (error instanceof Error) {
        if (error.message?.includes('p_cart_product_ids is required')) return false;
        if (error.message?.includes('function not found')) return false;
        if (error.message?.includes('permission denied')) return false;
        if (error.message?.includes('42703')) return false; // Column does not exist
      }
      // Retry on network/database errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff, max 30s
    onError: (error) => {
      console.error('Cart suggestions query failed:', error);
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

export const trackCartSuggestionView = async (
  cartProductIds: string[],
  suggestedProductId: string,
  sessionId: string,
  userId?: string
) => {
  try {
    // Track view from first cart item for simplicity
    if (cartProductIds.length > 0) {
      await supabase
        .from('product_recommendation_views')
        .insert({
          product_id: cartProductIds[0],
          recommended_product_id: suggestedProductId,
          session_id: sessionId,
          user_id: userId || null,
          source: 'cart_page'
        });
    }
  } catch (error) {
    console.error('Error tracking cart suggestion view:', error);
  }
};

export const trackCartSuggestionConversion = async (
  cartProductIds: string[],
  suggestedProductId: string,
  sessionId: string,
  userId?: string
) => {
  try {
    // Track conversion from first cart item for simplicity
    if (cartProductIds.length > 0) {
      await supabase
        .from('product_recommendation_conversions')
        .insert({
          product_id: cartProductIds[0],
          recommended_product_id: suggestedProductId,
          session_id: sessionId,
          user_id: userId || null,
          source: 'cart_page'
        });
    }
  } catch (error) {
    console.error('Error tracking cart suggestion conversion:', error);
  }
};
