# Product Variant System - Usage Guide

## For Administrators

### Creating Product Variants

1. **Navigate to Admin Products**
   - Go to Admin Dashboard → Products
   - Click "Add Product" or edit an existing product

2. **Add Variants Section**
   - Scroll to "Product Variants" section
   - Click "Add Variant" button

3. **Fill Variant Information**
   - **Variant Name** (required): e.g., "100 Pills", "200 Pills", "Large", "Red"
     - Must be unique per product (case-insensitive)
     - Minimum 2 characters
     - Automatically trimmed of whitespace
   
   - **Price** (required): Variant-specific price
     - Must be greater than 0
   
   - **Stock Quantity**: Available inventory for this variant
   
   - **Variant Image** (optional): Upload image specific to this variant

4. **Duplicate Detection**
   - System shows real-time warnings for duplicate names
   - Duplicate variants highlighted in red with warning badge
   - Cannot save product with duplicate variant names
   - Error message explains which variants are duplicates

5. **SKU Auto-Generation**
   - If you don't provide a SKU, system auto-generates one
   - Format: `PARENT-SKU-VARIANT-NAME`
   - Example: `TUR-CAP-022-100PILLS`

### Best Practices

✅ **DO:**
- Use clear, descriptive variant names ("100 Pills", "200 Pills")
- Include size/quantity/color in the name as appropriate
- Upload variant-specific images when variants differ visually
- Keep variant names consistent across products
- Test with different cases and spaces - system handles these

❌ **DON'T:**
- Create variants with identical names (system prevents this)
- Use very short names (< 2 characters)
- Include special characters that might cause issues
- Leave prices at 0 or negative values

### Troubleshooting

**Error: "A variant with this name already exists"**
- Solution: Change the variant name to something unique
- Note: Names are compared case-insensitively, so "100 pills" = "100 Pills"

**Error: "Variant name must be at least 2 characters"**
- Solution: Use a more descriptive name (e.g., "XL" instead of "X")

**Duplicate Warning Shows in Admin**
- Red border and badge appear on duplicate variants
- Warning message at bottom explains the issue
- Remove or rename duplicate variants before saving

## For Developers

### Database Schema

```sql
CREATE TABLE product_variants (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL,
  name TEXT NOT NULL,              -- Unique per product (case-insensitive)
  description TEXT,
  price NUMERIC NOT NULL,           -- Must be > 0
  compare_price NUMERIC,
  sku TEXT UNIQUE,                  -- Auto-generated if not provided
  inventory_quantity INTEGER DEFAULT 0,
  weight NUMERIC,
  variant_options JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Key Constraints

1. **Unique Constraint on Name**: `(product_id, LOWER(TRIM(name)))`
   - Prevents: "100 Pills", "100 pills", " 100 Pills " all being separate

2. **Unique Constraint on SKU**: `sku` WHERE sku IS NOT NULL
   - Ensures global SKU uniqueness when provided

3. **Check Constraints**:
   - `price > 0`: Prices must be positive
   - `inventory_quantity >= 0`: Stock can't be negative
   - `compare_price >= price` OR NULL: Sale prices must be valid

### Using in Code

**Fetch Variants:**
```typescript
import { useProductVariants } from '@/hooks/useProductVariants';

const { data: variants } = useProductVariants(productId);
// Returns deduplicated variants automatically
```

**Create Variant:**
```typescript
import { useCreateProductVariant } from '@/hooks/useProductVariants';

const createVariant = useCreateProductVariant();

createVariant.mutate({
  product_id: 'uuid',
  name: '100 Pills',
  price: 25.99,
  inventory_quantity: 100,
  // SKU auto-generated if not provided
});
```

**Display Variants:**
```typescript
import { ProductVariantSelector } from '@/components/ProductVariantSelector';

<ProductVariantSelector
  variants={variants}
  selectedVariant={selectedVariant}
  onVariantChange={setSelectedVariant}
/>
// Automatically deduplicates and shows only unique variants
```

### Error Handling

```typescript
try {
  await createVariant.mutate(variantData);
} catch (error) {
  if (error.message.includes('already exists')) {
    // Handle duplicate variant name
  } else if (error.message.includes('at least 2 characters')) {
    // Handle name too short
  }
}
```

### Database Triggers

The `validate_product_variant` trigger automatically:
- Trims whitespace from names
- Validates name length (min 2 chars)
- Validates price is positive
- Auto-generates SKU from product SKU + variant name
- Updates `updated_at` timestamp

## For QA/Testing

### Test Cases to Verify

1. **Create Valid Variants**
   - ✅ Create variant with unique name
   - ✅ Create multiple variants with different names

2. **Duplicate Prevention**
   - ✅ Cannot create variant with exact duplicate name
   - ✅ Cannot create variant with same name but different case
   - ✅ Cannot create variant with same name but extra spaces

3. **Validation**
   - ✅ Cannot create variant with empty name
   - ✅ Cannot create variant with name < 2 chars
   - ✅ Cannot create variant with price ≤ 0
   - ✅ Cannot create variant with negative inventory

4. **UI Feedback**
   - ✅ Duplicate warning shows in admin when typing
   - ✅ Red border appears on duplicate variants
   - ✅ Clear error messages on save attempt
   - ✅ Only unique variants show on product page

5. **SKU Generation**
   - ✅ SKU auto-generates from product SKU + variant name
   - ✅ Manual SKU is respected if provided
   - ✅ SKU must be unique across all variants

### Expected Behavior

**Admin Interface:**
- Real-time duplicate detection while typing
- Visual indicators (red border, badge) on duplicates
- Cannot save product with duplicate variants
- Clear error messages guide user to fix issues

**Customer Interface:**
- Only unique variants displayed
- No duplicate options in variant selector
- Auto-selects first variant on page load
- Hides selector if only one variant exists

## Summary

The variant system now provides:
- ✅ Database-level duplicate prevention
- ✅ Application-level validation
- ✅ Real-time admin feedback
- ✅ Clean customer experience
- ✅ Automatic SKU generation
- ✅ Comprehensive error handling

All layers work together to ensure data integrity and excellent user experience.
