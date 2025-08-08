import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ProductVariant } from '@/hooks/useProductVariants';
import { useStoreSettings } from '@/hooks/useStoreSettings';
interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  onVariantChange: (variant: ProductVariant) => void;
  selectedVariant?: ProductVariant;
}
export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  variants,
  onVariantChange,
  selectedVariant
}) => {
  const {
    currency
  } = useStoreSettings();

  // For simple variant selection, we'll just show a list of variant buttons
  useEffect(() => {
    // Auto-select first variant if none selected and variants exist
    if (!selectedVariant && variants && variants.length > 0) {
      onVariantChange(variants[0]);
    }
  }, [variants, selectedVariant, onVariantChange]);
  if (!variants || variants.length <= 1) {
    return null; // Don't show selector if only one or no variants
  }
  return <div className="space-y-4">
      <Label className="text-sm font-medium">
        Choose Variant
      </Label>
      
      

      {selectedVariant && <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{selectedVariant.name}</h4>
                {selectedVariant.description && <p className="text-sm text-muted-foreground mt-1">
                    {selectedVariant.description}
                  </p>}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold">
                    {currency} {selectedVariant.price.toFixed(2)}
                  </span>
                  {selectedVariant.compare_price && selectedVariant.compare_price > selectedVariant.price && <span className="text-sm text-muted-foreground line-through">
                      {currency} {selectedVariant.compare_price.toFixed(2)}
                    </span>}
                </div>
              </div>
              <div className="text-right">
                <Badge variant={(selectedVariant.inventory_quantity || 0) > 0 ? "default" : "destructive"}>
                  {(selectedVariant.inventory_quantity || 0) > 0 ? `${selectedVariant.inventory_quantity || 0} in stock` : 'Out of stock'}
                </Badge>
                {selectedVariant.sku && <p className="text-xs text-muted-foreground mt-1">
                    SKU: {selectedVariant.sku}
                  </p>}
              </div>
            </div>
          </CardContent>
        </Card>}
    </div>;
};