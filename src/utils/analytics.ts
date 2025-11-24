/**
 * Analytics Tracking using Google Tag Manager AND Meta Pixel
 * 
 * Fires events to both GTM (for tag-based tracking) and directly to Meta Pixel.
 * Ensures reliable event tracking across both platforms with proper queue management.
 */

declare global {
  interface Window {
    dataLayer: any[];
    fbq?: (action: string, event: string, data?: Record<string, any>) => void;
  }
}

// Initialize dataLayer
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

/**
 * Event queue for Meta Pixel
 * Queues events until Meta Pixel script is fully loaded and initialized
 */
interface QueuedEvent {
  eventName: string;
  data?: Record<string, any>;
}

let metaPixelReady = false;
let metaPixelQueue: QueuedEvent[] = [];
let metaPixelId = '';

/**
 * Check if Meta Pixel is ready to track events
 */
export function isMetaPixelReady(): boolean {
  return metaPixelReady;
}

/**
 * Get current Meta Pixel queue size (for debugging)
 */
export function getMetaPixelQueueSize(): number {
  return metaPixelQueue.length;
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
 * Flush queued events to Meta Pixel
 * Called when Meta Pixel is fully ready
 */
function flushMetaPixelQueue() {
  if (typeof window === 'undefined' || !window.fbq || metaPixelQueue.length === 0) {
    return;
  }

  console.log(`🔄 [Meta Pixel] Flushing ${metaPixelQueue.length} queued events...`);
  const queue = [...metaPixelQueue];
  metaPixelQueue = [];

  for (const event of queue) {
    try {
      window.fbq('track', event.eventName, event.data || {});
      console.log(`✅ [Meta Pixel] Flushed event: ${event.eventName}`);
    } catch (error) {
      console.warn(`❌ [Meta Pixel] Failed to flush event ${event.eventName}:`, error);
    }
  }
}

/**
 * Initialize Meta Pixel if ID is provided
 * Implements proper queue management to prevent event loss during initialization
 * 
 * Dual-Queue Architecture:
 * 1. fbq.q - Standard Meta Pixel queue (processed by fbevents.js when it loads)
 * 2. metaPixelQueue - Our own queue (explicitly managed, flushed when ready)
 * 
 * This ensures compatibility with standard Meta Pixel SDK while maintaining
 * explicit control over event delivery and preventing race conditions.
 */
export function initializeMetaPixel(pixelId: string) {
  if (typeof window === 'undefined' || !pixelId) return;
  
  metaPixelId = pixelId;

  // Check if Meta Pixel is already loaded
  if (window.fbq && metaPixelReady) {
    console.log('✅ Meta Pixel already initialized and ready');
    return;
  }

  // Create Meta Pixel queue shim BEFORE script loads
  // This shim follows the standard Meta Pixel format so fbevents.js can process queued commands
  // 
  // Format: fbq.q is the STANDARD queue name used by Meta Pixel SDK
  // (Previously used custom fbq.queue which was incompatible with real fbevents.js)
  if (!window.fbq) {
    (window as any).fbq = function() {
      (window as any).fbq.callMethod
        ? (window as any).fbq.callMethod.apply((window as any).fbq, arguments)
        : (window as any).fbq.q.push(arguments);  // ✅ FIXED: Use standard fbq.q (not fbq.queue)
    };
    
    (window as any).fbq.push = (window as any).fbq;
    (window as any).fbq.loaded = true;
    (window as any).fbq.version = '2.0';
    (window as any).fbq.q = [];  // ✅ FIXED: Standard fbq.q queue format (not fbq.queue)
    
    console.log('📦 [Meta Pixel] Queue shim created (standard fbq.q format - compatible with fbevents.js)');
  }

  // Load Meta Pixel script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://connect.facebook.net/en_US/fbevents.js`;
  
  script.onload = () => {
    console.log('📥 [Meta Pixel] Script loaded from CDN');
    
    // Initialize the pixel
    if (window.fbq) {
      try {
        window.fbq('init', pixelId);
        console.log(`✅ [Meta Pixel] Pixel initialized with ID: ${pixelId}`);
        
        // Mark as ready AFTER initialization completes
        metaPixelReady = true;
        console.log('✅ [Meta Pixel] Ready to track events');
        
        // Flush any queued events that arrived before ready
        flushMetaPixelQueue();
      } catch (error) {
        console.error('❌ [Meta Pixel] Initialization failed:', error);
      }
    }
  };
  
  script.onerror = () => {
    console.error('❌ [Meta Pixel] Failed to load script from CDN');
  };

  document.head.appendChild(script);

  // Add noscript image fallback
  if (!document.querySelector(`noscript[data-meta-pixel="${pixelId}"]`)) {
    const noscript = document.createElement('noscript');
    noscript.setAttribute('data-meta-pixel', pixelId);
    const img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
    noscript.appendChild(img);
    document.body.insertBefore(noscript, document.body.firstChild);
  }
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
 * Fire event to Meta Pixel
 * Queues events if Meta Pixel isn't ready yet, preventing event loss during initialization
 */
function fireMetaPixelEvent(eventName: string, data?: Record<string, any>) {
  if (typeof window === 'undefined') {
    return;
  }

  // If Meta Pixel is not ready, queue the event
  if (!metaPixelReady || !window.fbq) {
    metaPixelQueue.push({ eventName, data });
    console.log(`⏳ [Meta Pixel] Event queued (${metaPixelQueue.length}): ${eventName}`);
    return;
  }

  // If ready, fire the event immediately
  try {
    window.fbq('track', eventName, data || {});
    console.log(`✅ [Meta Pixel] Event fired: ${eventName}`);
  } catch (error) {
    console.warn(`❌ [Meta Pixel] Event failed (${eventName}):`, error);
    // Try to queue for retry if error occurs
    metaPixelQueue.push({ eventName, data });
  }
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
  
  // Meta Pixel PageView (automatic, but we can ensure it fires)
  fireMetaPixelEvent('PageView');
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
  
  const gtmData = {
    currency: currencyCode,
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      item_brand: product.brand || 'New Era Herbals',
      price: product.price,
    }],
  };
  
  gtmPush('view_item', gtmData);
  
  // Meta Pixel ViewContent event
  fireMetaPixelEvent('ViewContent', {
    content_id: product.id,
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: currencyCode,
    content_category: product.category || 'Herbal Products',
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
  
  const gtmData = {
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
  };
  
  gtmPush('add_to_cart', gtmData);
  
  // Meta Pixel AddToCart event
  fireMetaPixelEvent('AddToCart', {
    content_id: product.id,
    content_name: product.name,
    content_type: 'product',
    value: value,
    currency: currencyCode,
    content_category: product.category || 'Herbal Products',
    quantity: product.quantity,
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
  
  const gtmData = {
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
  };
  
  gtmPush('begin_checkout', gtmData);
  
  // Meta Pixel InitiateCheckout event
  fireMetaPixelEvent('InitiateCheckout', {
    content_type: 'product',
    currency: currencyCode,
    value: total,
    num_items: items.length,
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
  
  const gtmData = {
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
  };
  
  gtmPush('purchase', gtmData);
  
  // Meta Pixel Purchase event (standard conversion event)
  fireMetaPixelEvent('Purchase', {
    content_type: 'product',
    currency: currencyCode,
    value: total,
    content_id: items.map(i => i.id).join(','),
    num_items: items.length,
  });
}

/**
 * Track search
 */
export function trackSearch(searchTerm: string) {
  gtmPush('search', {
    search_term: searchTerm,
  });
  
  // Meta Pixel Search event
  fireMetaPixelEvent('Search', {
    search_string: searchTerm,
  });
}

/**
 * Track custom event
 */
export function trackCustomEvent(eventName: string, data?: Record<string, any>) {
  gtmPush(eventName, data);
  
  // Meta Pixel custom event
  fireMetaPixelEvent(eventName, data);
}
