import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: number;
  created_at: string;
  is_featured?: boolean;
  banner_image_url?: string;
  color_scheme?: string;
  icon_name?: string;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
};

export const useFeaturedCategories = () => {
  return useQuery({
    queryKey: ['featured-categories'],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
};

export const useCategoryBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (categoryError) {
        throw categoryError;
      }

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          product_variants(*),
          product_categories!inner(category_id)
        `)
        .eq('product_categories.category_id', category.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (productsError) {
        throw productsError;
      }

      const { data: relatedCategories, error: relatedError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .neq('id', category.id)
        .order('sort_order', { ascending: true })
        .limit(6);

      if (relatedError) {
        throw relatedError;
      }

      return {
        category,
        products: products || [],
        relatedCategories: relatedCategories || [],
      };
    },
    enabled: !!slug,
  });
};