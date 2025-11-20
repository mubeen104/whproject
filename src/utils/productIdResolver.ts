export interface ProductIdentifier {
  id: string;
  sku?: string;
  variantSku?: string;
  variantId?: string;
}

export const resolveProductId = (identifier: ProductIdentifier): string => {
  // Priority: variant SKU → parent SKU → variant ID → product ID
  return identifier.variantSku || identifier.sku || identifier.variantId || identifier.id;
};

export const normalizeCurrency = (currency: string): string => {
  const currencyMap: { [key: string]: string } = {
    'Rs': 'PKR',
    'rs': 'PKR',
    'PKR': 'PKR',
    'USD': 'USD',
    '$': 'USD',
    'EUR': 'EUR',
    '€': 'EUR',
    'GBP': 'GBP',
    '£': 'GBP'
  };
  return currencyMap[currency] || 'PKR';
};

export const validatePrice = (price: any): number => {
  const parsed = typeof price === 'number' ? price : parseFloat(String(price));
  if (isNaN(parsed) || parsed < 0) {
    console.warn('Invalid price value:', price);
    return 0;
  }
  return parsed;
};

export const validateQuantity = (quantity: any): number => {
  const parsed = typeof quantity === 'number' ? quantity : parseInt(String(quantity), 10);
  if (isNaN(parsed) || parsed <= 0) {
    console.warn('Invalid quantity value:', quantity);
    return 1;
  }
  return parsed;
};

export interface StandardizedProductData {
  product_id: string;
  name: string;
  price: number;
  currency: string;
  quantity?: number;
  category?: string;
  brand?: string;
}

export const standardizeProductData = (
  product: any,
  variant?: any,
  quantity?: number
): StandardizedProductData | null => {
  try {
    const productId = resolveProductId({
      id: product.id,
      sku: product.sku,
      variantSku: variant?.sku,
      variantId: variant?.id
    });

    const price = validatePrice(variant?.price || product.price);
    const productName = variant
      ? `${product.name} - ${variant.name}`
      : product.name;

    if (!productId || !productName || price === 0) {
      console.warn('Invalid product data:', { productId, productName, price });
      return null;
    }

    return {
      product_id: productId,
      name: productName,
      price,
      currency: normalizeCurrency(product.currency || 'PKR'),
      quantity: quantity ? validateQuantity(quantity) : undefined,
      category: product.product_categories?.[0]?.categories?.name ||
                product.category ||
                'Herbal Products',
      brand: product.brand || 'New Era Herbals'
    };
  } catch (error) {
    console.error('Error standardizing product data:', error);
    return null;
  }
};
