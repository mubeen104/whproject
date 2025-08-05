import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { ProductVariantSelector } from '@/components/ProductVariantSelector';
import { useProductVariants, ProductVariant } from '@/hooks/useProductVariants';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
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
    
    return '/placeholder.svg';
  };

  const handleAddToCart = async () => {
    try {
      await onAddToCart(product.id, quantity, selectedVariant?.id);
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
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add to Cart</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted">
              <img
                src={getMainImage()}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {product.name}
              </h3>
              {selectedVariant && (
                <p className="text-sm text-muted-foreground">
                  Variant: {selectedVariant.name}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary">
                {currency} {getCurrentPrice().toFixed(2)}
              </span>
              {getCurrentComparePrice() && getCurrentComparePrice() > getCurrentPrice() && (
                <span className="text-lg text-muted-foreground line-through">
                  {currency} {getCurrentComparePrice().toFixed(2)}
                </span>
              )}
            </div>

            {/* Variant Selector */}
            {variants && variants.length > 0 && (
              <ProductVariantSelector
                variants={variants}
                selectedVariant={selectedVariant}
                onVariantChange={setSelectedVariant}
              />
            )}

            {/* Inventory Status */}
            <div className="flex items-center gap-2">
              <Badge variant={isOutOfStock ? "destructive" : "default"}>
                {isOutOfStock ? "Out of Stock" : `${maxQuantity} in stock`}
              </Badge>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Quantity:
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 text-foreground font-medium min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                      disabled={quantity >= maxQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    of {maxQuantity} available
                  </span>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="pt-4">
              <Button
                onClick={handleAddToCart}
                disabled={isLoading || isOutOfStock || (variants && variants.length > 0 && !selectedVariant)}
                className="w-full rounded-full py-6 text-base font-medium"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isOutOfStock 
                  ? "Out of Stock" 
                  : variants && variants.length > 0 && !selectedVariant
                  ? "Select a Variant"
                  : `Add ${quantity} to Cart`
                }
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};