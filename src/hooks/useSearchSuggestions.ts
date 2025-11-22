import { useMemo } from 'react';
import { useProducts } from './useProducts';

export interface SearchSuggestion {
  id: string;
  name: string;
  price: number;
  image_url?: string;
}

export const useSearchSuggestions = (query: string, limit: number = 6) => {
  const { data: products = [] } = useProducts();

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];

    const searchQuery = query.toLowerCase().trim();

    const results = products
      .filter((product: any) => {
        const name = product.name.toLowerCase();
        const description = product.description?.toLowerCase() || '';
        const tags = product.tags?.map((tag: string) => tag.toLowerCase()) || [];

        return (
          name.includes(searchQuery) ||
          description.includes(searchQuery) ||
          tags.some(tag => tag.includes(searchQuery))
        );
      })
      .map((product: any) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.product_images?.[0]?.image_url,
      }))
      .slice(0, limit);

    return results;
  }, [query, products, limit]);

  return { suggestions, isLoading: false };
};
