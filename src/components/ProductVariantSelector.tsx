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

  // Client-side deduplication - remove duplicates by name (case-insensitive)
  const deduplicateVariants = (variantList: ProductVariant[]): ProductVariant[] => {
    const seen = new Map<string, ProductVariant>();
    const deduplicated: ProductVariant[] = [];

    for (const variant of variantList) {
      const normalizedName = variant.name.toLowerCase().trim();

      if (!seen.has(normalizedName)) {
        seen.set(normalizedName, variant);
        deduplicated.push(variant);
      }
    }

    return deduplicated;
  };

  const uniqueVariants = React.useMemo(() => {
    return deduplicateVariants(variants || []);
  }, [variants]);

  // For simple variant selection, we'll just show a list of variant buttons
  useEffect(() => {
    // Auto-select first variant if none selected and variants exist
    if (!selectedVariant && uniqueVariants && uniqueVariants.length > 0) {
      onVariantChange(uniqueVariants[0]);
    }
  }, [uniqueVariants, selectedVariant, onVariantChange]);

  if (!uniqueVariants || uniqueVariants.length === 0) {
    return null; // Don't show selector if no variants
  }

  if (uniqueVariants.length === 1) {
    return null; // Don't show selector if only one variant
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">
        Choose Variant
      </Label>

      <div className="grid grid-cols-2 gap-2">
        {uniqueVariants.map((variant) => {
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