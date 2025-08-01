import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_price: number;
  sku: string;
  inventory_quantity: number;
  is_featured: boolean;
  is_kits_deals?: boolean;
  tags: string[];
  features: string;
  ingredients: string;
  usage_instructions: string;
  created_at: string;
  product_images: Array<{
    id: string;
    image_url: string;
    alt_text: string;
    sort_order: number;
  }>;
  product_categories?: Array<{
    category_id: string;
    categories: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            image_url,
            alt_text,
            sort_order
          ),
          product_categories (
            category_id,
            categories (
              id,
              name,
              slug
            )
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            image_url,
            alt_text,
            sort_order
          ),
          product_categories (
            category_id,
            categories (
              id,
              name,
              slug
            )
          )
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
};