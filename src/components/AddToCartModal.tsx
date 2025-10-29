import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { ProductVariantSelector } from '@/components/ProductVariantSelector';
import { useProductVariants, ProductVariant } from '@/hooks/useProductVariants';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedTracking } from '@/hooks/useEnhancedTracking';

interface Product {
  id: string;
  name: string;
  sku?: string; // Added SKU for pixel tracking
  price: number;
  compare_price?: number;
  inventory_quantity: number;
  product_images?: Array<{
    id: string;
    image_url: string;
    alt_text: string;
    sort_order: number;
  }>;
}

interface AddToCartModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  isLoading?: boolean;
}

export const AddToCartModal: React.FC<AddToCartModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isLoading = false
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const { data: variants } = useProductVariants(product.id);
  const { currency } = useStoreSettings();
  const { toast } = useToast();
  const { trackAddToCart } = useEnhancedTracking();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedVariant(null);
    }
  }, [isOpen]);

  const getCurrentPrice = () => selectedVariant?.price || product.price;
  const getCurrentComparePrice = () => selectedVariant?.compare_price || product.compare_price;
  const getCurrentInventory = () => selectedVariant?.inventory_quantity || product.inventory_quantity;

  const getMainImage = () => {
    if (selectedVariant?.product_variant_images && selectedVariant.product_variant_images.length > 0) {
      return selectedVariant.product_variant_images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))[0]?.image_url;
    }
    
    if (product.product_images && product.product_images.length > 0) {
      return product.product_images.sort((a, b) => a.sort_order - b.sort_order)[0].image_url;
    }
    
    return '/logo.png';
  };

  const handleAddToCart = async () => {
    try {
      await onAddToCart(product.id, quantity, selectedVariant?.id);
      
      // Track add to cart event with SKU for catalog matching (required for Meta Pixel)
      trackAddToCart({
        product_id: selectedVariant?.sku || product.sku || product.id, // Priority: variant SKU → parent SKU → UUID
        product_name: product.name,
        price: getCurrentPrice(),
        currency: currency === 'Rs' ? 'PKR' : 'USD',
        quantity: quantity,
        category: 'Herbal Products'
      });
      
      const displayName = selectedVariant ? 
        `${product.name} - ${selectedVariant.name}` : 
        product.name;
      toast({
        title: "Added to cart",
        description: `${quantity} x ${displayName} added to your cart.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const maxQuantity = getCurrentInventory();
  const isOutOfStock = maxQuantity <= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-sm rounded-xl p-0 overflow-hidden mx-2 border-0 shadow-xl bg-background max-h-[85vh]">
        {/* Minimal Header */}
        <div className="relative bg-gradient-to-r from-primary/5 to-primary-glow/5 px-3 py-2 border-b border-border/20">
          <DialogHeader className="relative">
            <DialogTitle className="text-base font-semibold text-center flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              Add to Cart
            </DialogTitle>
          </DialogHeader>
        </div>
        
        {/* Scrollable Content Area */}
        <div className="overflow-y-auto flex-1">
          <div className="p-3 space-y-3">
            {/* Ultra Compact Product Display */}
            <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg border border-border/20">
              <div className="relative w-10 h-10 rounded-md overflow-hidden bg-background flex-shrink-0">
                <img
                  src={getMainImage()}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-foreground leading-tight mb-1 truncate">
                  {product.name}
                </h3>
                {selectedVariant && (
                  <p className="text-xs text-muted-foreground mb-1 truncate">
                    {selectedVariant.name}
                  </p>
                )}
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-primary">
                    {currency} {getCurrentPrice().toFixed(2)}
                  </span>
                  {getCurrentComparePrice() && getCurrentComparePrice() > getCurrentPrice() && (
                    <span className="text-xs text-muted-foreground line-through">
                      {currency} {getCurrentComparePrice().toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Minimal Stock Status */}
            <div className="flex justify-center">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                isOutOfStock 
                  ? 'bg-destructive/10 text-destructive' 
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
              }`}>
                {isOutOfStock ? "Out of Stock" : `${maxQuantity} Available`}
              </div>
            </div>

            {/* Compact Variant Selector */}
            {variants && variants.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Variant
                </label>
                <div className="bg-muted/10 rounded-lg p-1">
                  <ProductVariantSelector
                    variants={variants}
                    selectedVariant={selectedVariant}
                    onVariantChange={setSelectedVariant}
                  />
                </div>
              </div>
            )}

            {/* Minimal Quantity Selector */}
            {!isOutOfStock && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Quantity (Max {maxQuantity})
                </label>
                <div className="flex items-center justify-center">
                  <div className="flex items-center bg-muted/20 rounded-lg border border-border/20 overflow-hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-8 w-8 rounded-none hover:bg-primary/10 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <div className="px-3 py-1 bg-background/50 text-foreground font-semibold text-sm min-w-[40px] text-center">
                      {quantity}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                      disabled={quantity >= maxQuantity}
                      className="h-8 w-8 rounded-none hover:bg-primary/10 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Bottom Actions */}
        <div className="p-3 border-t border-border/20 space-y-2">
          <Button
            onClick={handleAddToCart}
            disabled={isLoading || isOutOfStock || (variants && variants.length > 0 && !selectedVariant)}
            className="w-full h-9 rounded-lg text-sm font-semibold bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Adding...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-3 w-3" />
                {isOutOfStock 
                  ? "Out of Stock" 
                  : variants && variants.length > 0 && !selectedVariant
                  ? "Select a Variant"
                  : `Add ${quantity} • ${currency} ${(getCurrentPrice() * quantity).toFixed(2)}`
                }
              </div>
            )}
          </Button>
          
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full h-7 rounded-md text-xs font-medium hover:bg-muted/30"
          >
            Continue Shopping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};