/**
 * Catalog utility functions for feed generation and validation
 */

/**
 * Ensures a URL is absolute. If relative, prepends the base URL.
 * If already absolute, returns as-is.
 */
export function ensureAbsoluteUrl(url: string | null | undefined, baseUrl: string): string {
  if (!url) return '';

  // Already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Handle Supabase storage URLs
  if (url.includes('/storage/v1/object/public/')) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl && !url.startsWith(supabaseUrl)) {
      return `${supabaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return url;
  }

  // Relative URL - make absolute
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanUrl}`;
}

/**
 * Validates if an image URL is accessible
 * Returns true if accessible, false otherwise
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  if (!url) return false;

  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    // For no-cors mode, we can't check status, but if it doesn't throw, URL is valid
    return true;
  } catch (error) {
    console.warn(`Invalid image URL: ${url}`, error);
    return false;
  }
}

/**
 * Validates product data for feed export
 * Returns array of validation errors
 */
export interface ValidationError {
  productId: string;
  productName: string;
  field: string;
  error: string;
  severity: 'error' | 'warning';
}

export function validateProductForFeed(
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    product_url: string;
    description?: string;
    sku?: string;
    availability?: string;
  },
  platform: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields for all platforms
  if (!product.name || product.name.trim().length === 0) {
    errors.push({
      productId: product.id,
      productName: product.name || 'Unknown',
      field: 'name',
      error: 'Product name is required',
      severity: 'error',
    });
  }

  if (!product.price || product.price <= 0) {
    errors.push({
      productId: product.id,
      productName: product.name,
      field: 'price',
      error: 'Valid price is required',
      severity: 'error',
    });
  }

  if (!product.image_url) {
    errors.push({
      productId: product.id,
      productName: product.name,
      field: 'image_url',
      error: 'Product image is required',
      severity: 'error',
    });
  }

  if (!product.product_url) {
    errors.push({
      productId: product.id,
      productName: product.name,
      field: 'product_url',
      error: 'Product URL is required',
      severity: 'error',
    });
  }

  // Platform-specific validation
  switch (platform) {
    case 'google':
      if (!product.description || product.description.length < 50) {
        errors.push({
          productId: product.id,
          productName: product.name,
          field: 'description',
          error: 'Google requires description with at least 50 characters',
          severity: 'warning',
        });
      }

      if (!product.sku) {
        errors.push({
          productId: product.id,
          productName: product.name,
          field: 'sku',
          error: 'Google recommends SKU/MPN for better performance',
          severity: 'warning',
        });
      }
      break;

    case 'meta':
      if (!product.description) {
        errors.push({
          productId: product.id,
          productName: product.name,
          field: 'description',
          error: 'Meta requires product description',
          severity: 'error',
        });
      }

      if (product.name.length > 150) {
        errors.push({
          productId: product.id,
          productName: product.name,
          field: 'name',
          error: 'Meta limits title to 150 characters',
          severity: 'warning',
        });
      }
      break;

    case 'tiktok':
      if (!product.availability) {
        errors.push({
          productId: product.id,
          productName: product.name,
          field: 'availability',
          error: 'TikTok requires availability status',
          severity: 'error',
        });
      }
      break;
  }

  return errors;
}

/**
 * Sanitizes text for XML output by escaping special characters
 */
export function sanitizeForXML(text: string): string {
  if (!text) return '';

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Sanitizes text for CSV output by handling quotes and commas
 */
export function sanitizeForCSV(text: string): string {
  if (!text) return '';

  // If contains comma, quotes, or newlines, wrap in quotes and escape internal quotes
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

/**
 * Truncates text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;

  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Formats price according to platform requirements
 */
export function formatPrice(price: number, currency: string, platform: string): string {
  switch (platform) {
    case 'google':
    case 'meta':
    case 'pinterest':
      return `${price.toFixed(2)} ${currency}`;

    case 'tiktok':
    case 'snapchat':
    case 'twitter':
      return price.toFixed(2);

    default:
      return `${price} ${currency}`;
  }
}

/**
 * Generates a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates feed slug format
 */
export function isValidFeedSlug(slug: string): boolean {
  // Must be lowercase, alphanumeric with hyphens, 3-50 characters
  const slugRegex = /^[a-z0-9]([a-z0-9-]{1,48}[a-z0-9])?$/;
  return slugRegex.test(slug);
}

/**
 * Gets recommended cache duration for platform
 */
export function getRecommendedCacheDuration(platform: string): number {
  switch (platform) {
    case 'google':
      return 86400; // 24 hours - Google recommends daily updates

    case 'meta':
      return 3600; // 1 hour - Meta recommends frequent updates

    case 'tiktok':
    case 'snapchat':
      return 21600; // 6 hours

    default:
      return 3600; // 1 hour default
  }
}

/**
 * Batch validates a list of image URLs
 * Returns map of url -> isValid
 */
export async function batchValidateImages(
  urls: string[],
  maxConcurrent: number = 10
): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();
  const uniqueUrls = [...new Set(urls.filter(Boolean))];

  // Process in batches
  for (let i = 0; i < uniqueUrls.length; i += maxConcurrent) {
    const batch = uniqueUrls.slice(i, i + maxConcurrent);
    const validationPromises = batch.map(async (url) => {
      const isValid = await validateImageUrl(url);
      return { url, isValid };
    });

    const batchResults = await Promise.all(validationPromises);
    batchResults.forEach(({ url, isValid }) => {
      results.set(url, isValid);
    });
  }

  return results;
}

/**
 * Generates platform-specific recommendations for product optimization
 */
export function getProductOptimizationTips(
  errors: ValidationError[],
  platform: string
): string[] {
  const tips: string[] = [];

  const errorsByField = errors.reduce((acc, error) => {
    if (!acc[error.field]) acc[error.field] = 0;
    acc[error.field]++;
    return acc;
  }, {} as Record<string, number>);

  if (errorsByField.description > 0) {
    tips.push(
      `${errorsByField.description} products need better descriptions. ${
        platform === 'google'
          ? 'Google requires at least 50 characters.'
          : 'Add detailed product descriptions.'
      }`
    );
  }

  if (errorsByField.image_url > 0) {
    tips.push(
      `${errorsByField.image_url} products are missing images. All products need at least one high-quality image.`
    );
  }

  if (errorsByField.sku > 0) {
    tips.push(
      `${errorsByField.sku} products are missing SKU codes. Adding SKUs improves tracking and reduces duplicate listings.`
    );
  }

  if (errorsByField.name > 0) {
    tips.push(
      `${errorsByField.name} products have title issues. ${
        platform === 'meta'
          ? 'Keep titles under 150 characters.'
          : 'Ensure all products have clear, descriptive titles.'
      }`
    );
  }

  return tips;
}
