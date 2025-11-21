/**
 * Simplified Analytics Tracking using Google Tag Manager
 * 
 * This replaces the complex multi-platform pixel tracking system with
 * a single GTM implementation that handles all advertising platforms.
 */

declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Initialize dataLayer
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

/**
 * Convert currency to standard 3-letter ISO code
 * Handles common currency symbols and locale-specific formats
 */
export function getCurrencyCode(currency: string): string {
  if (!currency) return 'PKR'; // Default fallback
  
  const normalized = currency.trim();
  
  const currencyMap: Record<string, string> = {
    // Pakistani Rupee variants
    'PKR': 'PKR',
    'Rs': 'PKR',
    'Rs.': 'PKR',
    '₨': 'PKR',
    'Rupees': 'PKR',
    'rupees': 'PKR',
    // US Dollar variants
    'USD': 'USD',
    '$': 'USD',
    'Dollars': 'USD',
    'dollars': 'USD',
    // Other common currencies
    'EUR': 'EUR',
    '€': 'EUR',
    'GBP': 'GBP',
    '£': 'GBP',
  };
  
  return currencyMap[normalized] || normalized.toUpperCase().substring(0, 3);
}

/**
 * Push event to GTM dataLayer
 */
function gtmPush(event: string, data?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...data,
  });
}

/**
 * Track page view
 */
export function trackPageView(path: string) {
  gtmPush('page_view', {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
  });
}

/**
 * Track product view
 */
export function trackViewContent(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  brand?: string;
  currency?: string;
}) {
  const currencyCode = product.currency ? getCurrencyCode(product.currency) : 'PKR';
  
  gtmPush('view_item', {
    currency: currencyCode,
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      item_brand: product.brand || 'New Era Herbals',
      price: product.price,
    }],
  });
}

/**
 * Track add to cart
 */
export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  brand?: string;
  currency?: string;
}) {
  const currencyCode = product.currency ? getCurrencyCode(product.currency) : 'PKR';
  const value = product.price * product.quantity;
  
  gtmPush('add_to_cart', {
    currency: currencyCode,
    value,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      item_brand: product.brand || 'New Era Herbals',
      price: product.price,
      quantity: product.quantity,
    }],
  });
}

/**
 * Track begin checkout
 */
export function trackBeginCheckout(
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
    brand?: string;
  }>,
  total: number,
  currency?: string,
  tax?: number,
  shipping?: number
) {
  const currencyCode = currency ? getCurrencyCode(currency) : 'PKR';
  
  gtmPush('begin_checkout', {
    currency: currencyCode,
    value: total,
    tax: tax || 0,
    shipping: shipping || 0,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      item_brand: item.brand || 'New Era Herbals',
      price: item.price,
      quantity: item.quantity,
    })),
  });
}

/**
 * Track purchase
 */
export function trackPurchase(
  orderId: string,
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
    brand?: string;
  }>,
  total: number,
  currency?: string,
  tax?: number,
  shipping?: number
) {
  const currencyCode = currency ? getCurrencyCode(currency) : 'PKR';
  
  gtmPush('purchase', {
    transaction_id: orderId,
    currency: currencyCode,
    value: total,
    tax: tax || 0,
    shipping: shipping || 0,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      item_brand: item.brand || 'New Era Herbals',
      price: item.price,
      quantity: item.quantity,
    })),
  });
}

/**
 * Track search
 */
export function trackSearch(searchTerm: string) {
  gtmPush('search', {
    search_term: searchTerm,
  });
}

/**
 * Track custom event
 */
export function trackCustomEvent(eventName: string, data?: Record<string, any>) {
  gtmPush(eventName, data);
}
