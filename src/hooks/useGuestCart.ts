import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart as useAuthCart } from './useCart';
import { supabase } from '@/integrations/supabase/client';

export interface GuestCartItem {
  id: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  product?: {
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
  products?: {
    id: string;
    name: string;
    sku?: string; // Added SKU for pixel tracking
    price: number;
  };
  product_variants?: {
    id: string;
    name: string;
    price: number;
    sku?: string; // Added SKU for pixel tracking
    inventory_quantity: number;
    product_variant_images: Array<{
      id: string;
      image_url: string;
      alt_text: string;
      sort_order: number;
    }>;
  };
}

const GUEST_CART_KEY = 'guest_cart_items';

export const useGuestCart = () => {
  const { user } = useAuth();
  const authCart = useAuthCart();
  const [guestCartItems, setGuestCartItems] = useState<GuestCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load guest cart from localStorage
  useEffect(() => {
    if (!user) {
      const savedCart = localStorage.getItem(GUEST_CART_KEY);
      if (savedCart) {
        try {
          const items = JSON.parse(savedCart);
          setGuestCartItems(items);
          // Fetch product details for guest cart items
          fetchProductDetails(items);
        } catch (error) {
          console.error('Error parsing guest cart:', error);
          localStorage.removeItem(GUEST_CART_KEY);
        }
      }
    }
  }, [user]);

  const fetchProductDetails = async (items: GuestCartItem[]) => {
    if (items.length === 0) return;
    
    setIsLoading(true);
    try {
      const productIds = items.map(item => item.product_id);
      const variantIds = items.map(item => item.variant_id).filter(Boolean) as string[];

      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
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
        `)
        .in('id', productIds);

      if (productsError) throw productsError;

      // Fetch variants if there are variant IDs
      let variants: any[] = [];
      if (variantIds.length > 0) {
        const { data: variantsData, error: variantsError } = await supabase
          .from('product_variants')
          .select(`
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
          `)
          .in('id', variantIds);

        if (variantsError) throw variantsError;
        variants = variantsData || [];
      }

      // Combine products and variants with cart items
      const updatedItems = items.map(item => ({
        ...item,
        product: products?.find(p => p.id === item.product_id),
        product_variants: item.variant_id ? variants.find(v => v.id === item.variant_id) : undefined
      }));

      setGuestCartItems(updatedItems);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToLocalStorage = useCallback((items: GuestCartItem[]) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  }, []);

  const addToGuestCart = useCallback(async (productId: string, quantity: number = 1, variantId?: string) => {
    setIsLoading(true);
    try {
      console.log('Adding to guest cart:', { productId, quantity, variantId, user });
      
      // Fetch product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          product_images (
            id,
            image_url,
            alt_text,
            sort_order
          )
        `)
        .eq('id', productId)
        .single();

      if (productError) {
        console.error('Error fetching product:', productError);
        throw productError;
      }
      
      console.log('Product fetched successfully:', product);

      // Fetch variant details if variantId is provided
      let variant = undefined;
      if (variantId) {
        const { data: variantData, error: variantError } = await supabase
          .from('product_variants')
          .select(`
            id,
            name,
            price,
            inventory_quantity,
            product_variant_images (
              id,
              image_url,
              alt_text,
              sort_order
            )
          `)
          .eq('id', variantId)
          .single();

        if (variantError) {
          console.error('Error fetching variant:', variantError);
        } else {
          variant = variantData;
          console.log('Variant fetched successfully:', variant);
        }
      }

      setGuestCartItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(item => 
          item.product_id === productId && item.variant_id === variantId
        );
        let newItems;

        if (existingItemIndex >= 0) {
          // Update existing item
          newItems = [...prevItems];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + quantity
          };
        } else {
          // Add new item
          const newItem: GuestCartItem = {
            id: `guest_${Date.now()}_${productId}_${variantId || 'default'}`,
            product_id: productId,
            variant_id: variantId || null,
            quantity,
            product,
            product_variants: variant
          };
          newItems = [...prevItems, newItem];
        }

        saveToLocalStorage(newItems);
        console.log('Updated guest cart items:', newItems);
        return newItems;
      });
    } catch (error) {
      console.error('Error adding to guest cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [saveToLocalStorage, user]);

  const updateGuestQuantity = useCallback((itemId: string, quantity: number) => {
    setGuestCartItems(prevItems => {
      let newItems;
      if (quantity <= 0) {
        newItems = prevItems.filter(item => item.id !== itemId);
      } else {
        newItems = prevItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
      }
      saveToLocalStorage(newItems);
      return newItems;
    });
  }, [saveToLocalStorage]);

  const removeFromGuestCart = useCallback((itemId: string) => {
    setGuestCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== itemId);
      saveToLocalStorage(newItems);
      return newItems;
    });
  }, [saveToLocalStorage]);

  const clearGuestCart = useCallback(() => {
    setGuestCartItems([]);
    localStorage.removeItem(GUEST_CART_KEY);
  }, []);

  // Transfer guest cart to authenticated cart when user logs in
  const transferGuestCartToAuth = useCallback(async () => {
    if (user && guestCartItems.length > 0) {
      try {
        for (const item of guestCartItems) {
          await authCart.addToCart.mutateAsync({
            productId: item.product_id,
            variantId: item.variant_id,
            quantity: item.quantity
          });
        }
        clearGuestCart();
      } catch (error) {
        console.error('Error transferring guest cart:', error);
      }
    }
  }, [user, guestCartItems, authCart.addToCart, clearGuestCart]);

  // Return appropriate cart based on auth state
  if (user) {
    return {
      cartItems: authCart.cartItems || [],
      cartCount: authCart.cartCount,
      cartTotal: authCart.cartTotal,
      isLoading: authCart.isLoading,
      addToCart: (productId: string, quantity: number = 1, variantId?: string) => 
        authCart.addToCart.mutateAsync({ productId, variantId, quantity }),
      updateQuantity: ({ itemId, quantity }: { itemId: string; quantity: number }) => 
        authCart.updateQuantity.mutateAsync({ itemId, quantity }),
      removeFromCart: (itemId: string) => authCart.removeFromCart.mutateAsync(itemId),
      clearCart: () => authCart.clearCart.mutateAsync(),
      transferGuestCartToAuth,
      isGuest: false
    };
  }

  // Guest cart - calculate totals
  const guestCartCount = guestCartItems.reduce((total, item) => total + item.quantity, 0);
  const guestCartTotal = guestCartItems.reduce((total, item) => {
    // Use variant price if available, otherwise use product price
    const price = item.product_variants?.price || item.product?.price || 0;
    return total + (price * item.quantity);
  }, 0);

  return {
    cartItems: guestCartItems,
    cartCount: guestCartCount,
    cartTotal: guestCartTotal,
    isLoading,
    addToCart: addToGuestCart,
    updateQuantity: ({ itemId, quantity }: { itemId: string; quantity: number }) => 
      Promise.resolve(updateGuestQuantity(itemId, quantity)),
    removeFromCart: (itemId: string) => Promise.resolve(removeFromGuestCart(itemId)),
    clearCart: () => Promise.resolve(clearGuestCart()),
    transferGuestCartToAuth,
    isGuest: true
  };
};