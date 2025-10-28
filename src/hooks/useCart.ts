import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  products?: {
    id: string;
    name: string;
    sku?: string; // Added SKU for pixel tracking
    price: number;
    product_images: Array<{
      id: string;
      image_url: string;
      alt_text: string;
      sort_order: number;
    }>;
  };
  product_variants?: {
    id: string;
    name: string;
    sku?: string; // Added SKU for pixel tracking
    price: number;
    inventory_quantity: number;
    product_variant_images: Array<{
      id: string;
      image_url: string;
      alt_text: string;
      sort_order: number;
    }>;
  };
}

export const useCart = () => {
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async (): Promise<CartItem[]> => {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            sku,
            price,
            product_images (
              id,
              image_url,
              alt_text,
              sort_order
            )
          ),
          product_variants (
            id,
            name,
            sku,
            price,
            inventory_quantity,
            product_variant_images (
              id,
              image_url,
              alt_text,
              sort_order
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const addToCart = useMutation({
    mutationFn: async ({ productId, variantId, quantity = 1 }: { productId: string; variantId?: string | null; quantity?: number }) => {
      // Check if item already exists in cart (same product and variant combination)
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('product_id', productId)
        .eq('variant_id', variantId || null)
        .maybeSingle();

      if (existingItem) {
        // Update existing item
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new item
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
          .from('cart_items')
          .insert({ 
            product_id: productId, 
            variant_id: variantId || null,
            quantity, 
            user_id: user.user.id 
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId);

        if (error) throw error;
        return null;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const clearCart = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all items

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const cartCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;
  const cartTotal = cartItems?.reduce((total, item) => {
    // Use variant price if available, otherwise use product price
    const price = item.product_variants?.price || item.products?.price || 0;
    return total + (price * item.quantity);
  }, 0) || 0;

  return {
    cartItems,
    cartCount,
    cartTotal,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
};