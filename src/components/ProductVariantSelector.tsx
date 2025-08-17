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
  const { currency } = useStoreSettings();
  
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

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">
        Choose Variant
      </Label>
      
      <div className="grid grid-cols-2 gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isAvailable = (variant.inventory_quantity || 0) > 0;

          return (
            <Button
              key={variant.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onVariantChange(variant)}
              disabled={!isAvailable}
              className={`
                flex flex-col items-start p-3 h-auto text-left
                ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="font-medium text-sm">{variant.name}</div>
              <div className="text-xs opacity-80">
                {currency} {variant.price.toFixed(2)}
                {!isAvailable && ' (Out of stock)'}
              </div>
            </Button>
          );
        })}
      </div>

    </div>
  );
};