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

      // Client-side deduplication as extra safety layer
      // Remove duplicates by name (case-insensitive) - keep the first occurrence
      const variants = (data || []) as ProductVariant[];
      const seen = new Map<string, ProductVariant>();
      const deduplicatedVariants: ProductVariant[] = [];

      for (const variant of variants) {
        const normalizedName = variant.name.toLowerCase().trim();

        if (!seen.has(normalizedName)) {
          seen.set(normalizedName, variant);
          deduplicatedVariants.push(variant);
        }
      }

      return deduplicatedVariants;
    },
    enabled: !!productId,
  });
};

export const useCreateProductVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at' | 'product_variant_images'>) => {
      // Normalize variant name before checking/inserting
      const normalizedVariant = {
        ...variant,
        name: variant.name.trim()
      };

      // Validate variant name is not empty
      if (!normalizedVariant.name || normalizedVariant.name.length < 2) {
        throw new Error('Variant name must be at least 2 characters long.');
      }

      // Prevent duplicate variants by name, price and options for the same product
      const { data: existing, error: checkError } = await supabase
        .from('product_variants')
        .select('id, name, price, variant_options, sku')
        .eq('product_id', normalizedVariant.product_id);

      if (checkError) {
        throw checkError;
      }

      if (existing && existing.length > 0) {
        // Check for exact match by name (case-insensitive)
        const nameMatch = existing.find(v =>
          v.name.toLowerCase().trim() === normalizedVariant.name.toLowerCase()
        );

        if (nameMatch) {
          throw new Error(`A variant with the name "${normalizedVariant.name}" already exists for this product.`);
        }

        // Check for near-duplicate (same price and similar options)
        const priceMatch = existing.find(v =>
          Math.abs(v.price - normalizedVariant.price) < 0.01 &&
          JSON.stringify(v.variant_options || {}) === JSON.stringify(normalizedVariant.variant_options || {})
        );

        if (priceMatch) {
          throw new Error('A variant with the same price and options already exists for this product.');
        }
      }

      const { data, error } = await supabase
        .from('product_variants')
        .insert(normalizedVariant)
        .select()
        .single();

      if (error) {
        // Handle unique constraint violations with user-friendly messages
        if (error.code === '23505') {
          if (error.message.includes('idx_product_variants_unique_name_per_product')) {
            throw new Error(`A variant with this name already exists for this product.`);
          }
          if (error.message.includes('idx_product_variants_unique_sku')) {
            throw new Error(`A variant with this SKU already exists.`);
          }
        }
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
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
    onSuccess: () => {
      // Invalidate all product-variants queries to ensure cache consistency
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
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