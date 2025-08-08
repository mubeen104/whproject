import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  price: number;
  compare_price?: number;
  sku?: string;
  inventory_quantity: number;
  weight?: number;
  variant_options: Record<string, any>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  product_variant_images: Array<{
    id: string;
    image_url: string;
    alt_text?: string;
    sort_order: number;
  }>;
}

export const useProductVariants = (productId: string) => {
  return useQuery({
    queryKey: ['product-variants', productId],
    queryFn: async (): Promise<ProductVariant[]> => {
      const { data, error } = await supabase
        .from('product_variants')
        .select(`
          *,
          product_variant_images (
            id,
            image_url,
            alt_text,
            sort_order
          )
        `)
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []) as ProductVariant[];
    },
    enabled: !!productId,
  });
};

export const useCreateProductVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at' | 'product_variant_images'>) => {
      // Prevent duplicate variants by name for the same product (case-insensitive)
      const { data: existing, error: checkError } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', variant.product_id)
        .ilike('name', variant.name);

      if (checkError) {
        throw checkError;
      }

      if (existing && existing.length > 0) {
        throw new Error('A variant with this name already exists for this product.');
      }

      const { data, error } = await supabase
        .from('product_variants')
        .insert(variant)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', variables.product_id] });
    },
  });
};

export const useUpdateProductVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductVariant> & { id: string }) => {
      const { data, error } = await supabase
        .from('product_variants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', data.product_id] });
    },
  });
};

export const useDeleteProductVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
    },
  });
};

export const useVariantImages = (variantId: string) => {
  return useQuery({
    queryKey: ['variant-images', variantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variant_images')
        .select('*')
        .eq('variant_id', variantId)
        .order('sort_order', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!variantId,
  });
};