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

interface ProductWithRecommendations {
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
  tags: string[] | null;
  category_ids: string[];
}

function calculateRecommendationScore(
  currentProduct: ProductWithRecommendations,
  candidateProduct: ProductWithRecommendations
): number {
  let score = 0;

  // Category match: 10 points per shared category
  const sharedCategories = currentProduct.category_ids.filter(
    catId => candidateProduct.category_ids.includes(catId)
  );
  score += sharedCategories.length * 10;

  // Price similarity: 8 points if within ±30%
  const priceRatio = candidateProduct.price / currentProduct.price;
  if (priceRatio >= 0.7 && priceRatio <= 1.3) {
    score += 8;
  }

  // Tag overlap: 6 points per shared tag
  if (currentProduct.tags && candidateProduct.tags) {
    const sharedTags = currentProduct.tags.filter(
      tag => candidateProduct.tags?.includes(tag)
    );
    score += sharedTags.length * 6;
  }

  // Best seller bonus: 5 points
  if (candidateProduct.is_best_seller) {
    score += 5;
  }

  // Featured bonus: 3 points
  if (candidateProduct.is_featured) {
    score += 3;
  }

  return score;
}

export const useRelatedProducts = (
  productId: string,
  limit: number = 6,
  excludeIds: string[] = []
): UseRelatedProductsResult => {
  const result = useQuery({
    queryKey: ['related-products', productId, limit, excludeIds],
    queryFn: async (): Promise<RelatedProduct[]> => {
      if (!productId) {
        return [];
      }

      try {
        // Get current product details
        const { data: currentProductData, error: currentProductError } = await supabase
          .from('products_with_recommendations')
          .select('*')
          .eq('id', productId)
          .single();

        if (currentProductError) {
          console.error('Error fetching current product:', currentProductError);
          throw currentProductError;
        }

        if (!currentProductData) {
          return [];
        }

        // Get all other active products
        let query = supabase
          .from('products_with_recommendations')
          .select('*')
          .neq('id', productId);

        // Exclude specified IDs
        if (excludeIds.length > 0) {
          query = query.not('id', 'in', `(${excludeIds.join(',')})`);
        }

        const { data: candidateProducts, error: candidatesError } = await query;

        if (candidatesError) {
          console.error('Error fetching candidate products:', candidatesError);
          throw candidatesError;
        }

        if (!candidateProducts || candidateProducts.length === 0) {
          return [];
        }

        // Calculate scores for all candidates
        const scoredProducts = candidateProducts.map(candidate => ({
          id: candidate.id,
          name: candidate.name,
          slug: candidate.slug,
          price: candidate.price,
          compare_price: candidate.compare_price,
          inventory_quantity: candidate.inventory_quantity,
          is_best_seller: candidate.is_best_seller,
          is_featured: candidate.is_featured,
          image_url: candidate.image_url,
          image_alt: candidate.image_alt,
          recommendation_score: calculateRecommendationScore(
            currentProductData as ProductWithRecommendations,
            candidate as ProductWithRecommendations
          ),
        }));

        // Filter products with score > 0, sort by score, and limit
        const topRecommendations = scoredProducts
          .filter(p => p.recommendation_score > 0)
          .sort((a, b) => b.recommendation_score - a.recommendation_score)
          .slice(0, limit);

        return topRecommendations;
      } catch (error) {
        console.error('Unexpected error in useRelatedProducts:', error);
        throw error;
      }
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error) {
        if (error.message?.includes('permission denied')) return false;
        if (error.message?.includes('does not exist')) return false;
      }
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Related products query failed:', error);
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
