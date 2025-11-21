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

interface CartItem {
  product_id?: string;
  products?: { id: string };
  product?: { id: string };
}

export const useSuggestedCartProducts = (cartItems: CartItem[], limit: number = 4) => {
  const cartProductIds = cartItems.map(item =>
    item.product_id || item.products?.id || item.product?.id
  ).filter(Boolean) as string[];

  return useQuery({
    queryKey: ['cart-suggestions', cartProductIds, limit],
    queryFn: async (): Promise<SuggestedProduct[]> => {
      if (!cartProductIds || cartProductIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .rpc('get_cart_suggestions', {
          p_cart_product_ids: cartProductIds,
          p_limit: limit
        });

      if (error) {
        console.error('Error fetching cart suggestions:', error);
        throw error;
      }

      return data || [];
    },
    enabled: cartProductIds.length > 0,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes (shorter for cart)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
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
