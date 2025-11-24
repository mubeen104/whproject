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
let metaPixelScriptFailed = false;
let metaPixelRetryCount = 0;
const MAX_SCRIPT_RETRIES = 3;
let scriptRetryTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Retry queue for failed events (due to network failures)
 * Persists to localStorage for reliability across page reloads
 */
interface FailedEvent {
  eventName: string;
  data?: Record<string, any>;
  timestamp: number;
  retryCount: number;
  isGTM?: boolean; // true for GTM, false for Meta Pixel
}

const RETRY_QUEUE_KEY = 'new_era_herbals_retry_queue';
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000; // 5 seconds base delay
let retryQueue: FailedEvent[] = [];
let retryInProgress = false;
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

/**
 * Load retry queue from localStorage on initialization
 */
function loadRetryQueue() {
  if (typeof localStorage === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(RETRY_QUEUE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Only restore events less than 24 hours old
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      retryQueue = parsed.filter((e: FailedEvent) => e.timestamp > oneDayAgo);
      
      if (retryQueue.length > 0) {
        console.log(`📋 [Retry Queue] Loaded ${retryQueue.length} failed events from localStorage`);
      }
      saveRetryQueue();
    }
  } catch (error) {
    console.warn('⚠️ [Retry Queue] Failed to load from localStorage:', error);
  }
}

/**
 * Save retry queue to localStorage for persistence
 */
function saveRetryQueue() {
  if (typeof localStorage === 'undefined') return;
  
  try {
    // Keep only most recent 100 events to avoid exceeding storage limits
    const queue = retryQueue.slice(-100);
    localStorage.setItem(RETRY_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.warn('⚠️ [Retry Queue] Failed to save to localStorage:', error);
    // If quota exceeded, clear old events and try again
    if (error instanceof DOMException && error.code === 22) {
      retryQueue = retryQueue.slice(-50);
      try {
        localStorage.setItem(RETRY_QUEUE_KEY, JSON.stringify(retryQueue));
      } catch (e) {
        console.error('❌ [Retry Queue] Failed to save even after cleanup:', e);
      }
    }
  }
}

/**
 * Add event to retry queue
 */
function addToRetryQueue(eventName: string, data?: Record<string, any>, isGTM = false) {
  const failedEvent: FailedEvent = {
    eventName,
    data,
    timestamp: Date.now(),
    retryCount: 0,
    isGTM,
  };
  
  retryQueue.push(failedEvent);
  saveRetryQueue();
  
  const queueType = isGTM ? 'GTM' : 'Meta Pixel';
  console.log(`📋 [Retry Queue] Added ${queueType} event to retry queue (total: ${retryQueue.length})`);
  
  // Try to process if online
  if (isOnline) {
    processRetryQueue();
  }
}

/**
 * Process retry queue with exponential backoff
 */
async function processRetryQueue() {
  if (retryInProgress || !isOnline || retryQueue.length === 0) {
    return;
  }
  
  retryInProgress = true;
  
  try {
    // Process queue in batches
    while (retryQueue.length > 0 && isOnline) {
      const event = retryQueue[0];
      
      // Calculate exponential backoff delay
      const backoffDelay = Math.min(
        RETRY_DELAY_MS * Math.pow(2, event.retryCount),
        300000 // Max 5 minutes
      );
      const timeSinceLastAttempt = Date.now() - event.timestamp;
      
      if (timeSinceLastAttempt < backoffDelay) {
        // Not ready to retry yet
        break;
      }
      
      try {
        if (event.isGTM) {
          // Retry GTM event
          if (typeof window !== 'undefined') {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              event: event.eventName,
              ...event.data,
            });
            console.log(`✅ [Retry Queue] GTM event retried: ${event.eventName}`);
          }
        } else {
          // Retry Meta Pixel event
          if (metaPixelReady && window.fbq) {
            window.fbq('track', event.eventName, event.data || {});
            console.log(`✅ [Retry Queue] Meta Pixel event retried: ${event.eventName}`);
          } else if (!window.fbq) {
            throw new Error('Meta Pixel not ready');
          }
        }
        
        // Success - remove from queue
        retryQueue.shift();
        saveRetryQueue();
      } catch (error) {
        event.retryCount++;
        
        if (event.retryCount >= MAX_RETRIES) {
          console.warn(
            `❌ [Retry Queue] Gave up on event after ${MAX_RETRIES} retries: ${event.eventName}`,
            error
          );
          retryQueue.shift();
          saveRetryQueue();
        } else {
          console.log(
            `🔄 [Retry Queue] Retry attempt ${event.retryCount}/${MAX_RETRIES} for ${event.eventName}. Next attempt in ${backoffDelay}ms`
          );
          // Wait before processing next event
          await new Promise(resolve => setTimeout(resolve, 1000));
          break; // Exit loop to let backoff timer work
        }
      }
    }
  } finally {
    retryInProgress = false;
  }
}

/**
 * Setup network event listeners for online/offline detection
 */
function setupNetworkMonitoring() {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('online', () => {
    isOnline = true;
    console.log('🌐 [Network] Online - Processing retry queue');
    processRetryQueue();
  });
  
  window.addEventListener('offline', () => {
    isOnline = false;
    console.log('🌐 [Network] Offline - Events queued for retry');
  });
}

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
 * Get retry queue size (for debugging)
 */
export function getRetryQueueSize(): number {
  return retryQueue.length;
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
 * Move queued events from temporary queue to persistent retry queue
 * This is called when Meta Pixel script fails to load
 * Ensures events are not lost and can be retried later
 */
function moveQueuedEventsToRetryQueue() {
  if (metaPixelQueue.length === 0) {
    return;
  }

  console.log(`📋 [Error Recovery] Moving ${metaPixelQueue.length} queued events to persistent retry queue`);
  
  for (const event of metaPixelQueue) {
    addToRetryQueue(event.eventName, event.data, false);
  }
  
  // Clear temporary queue since events are now in persistent retry queue
  metaPixelQueue = [];
  console.log(`✅ [Error Recovery] All events moved to retry queue and persisted to localStorage`);
}

/**
 * Retry loading Meta Pixel script
 * Called when initial script load fails
 * Implements exponential backoff to avoid hammering CDN
 */
function retryMetaPixelScript(pixelId: string) {
  if (typeof window === 'undefined' || !pixelId) return;
  
  // Check if we've already recovered
  if (metaPixelReady) {
    console.log('✅ [Error Recovery] Meta Pixel already loaded, skipping retry');
    return;
  }
  
  // Check if script already exists in DOM
  if (document.querySelector('script[src*="fbevents.js"]')) {
    console.log('⚠️ [Error Recovery] Meta Pixel script already in DOM, waiting for load...');
    return;
  }
  
  console.log(`🔄 [Error Recovery] Attempting to load Meta Pixel script (retry ${metaPixelRetryCount}/${MAX_SCRIPT_RETRIES})`);
  
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://connect.facebook.net/en_US/fbevents.js`;
  
  script.onload = () => {
    console.log('📥 [Error Recovery] Meta Pixel script loaded on retry');
    metaPixelScriptFailed = false;
    
    if (window.fbq) {
      try {
        window.fbq('init', pixelId);
        console.log(`✅ [Error Recovery] Pixel initialized successfully on retry`);
        
        metaPixelReady = true;
        console.log('✅ [Error Recovery] Meta Pixel ready after script retry');
        
        // Flush any queued events
        flushMetaPixelQueue();
        
        // Process any events in the persistent retry queue
        if (isOnline && retryQueue.length > 0) {
          console.log(`🔄 [Error Recovery] Processing ${retryQueue.length} persisted retry queue events`);
          processRetryQueue();
        }
        
        if (scriptRetryTimer) {
          clearTimeout(scriptRetryTimer);
          scriptRetryTimer = null;
        }
      } catch (error) {
        console.error('❌ [Error Recovery] Initialization failed on retry:', error);
      }
    }
  };
  
  script.onerror = () => {
    console.error(`❌ [Error Recovery] Script retry failed (attempt ${metaPixelRetryCount}/${MAX_SCRIPT_RETRIES})`);
    
    // Don't retry again on this error, keep events in persistent queue
    if (metaPixelRetryCount >= MAX_SCRIPT_RETRIES) {
      console.error(`❌ [Error Recovery] Max retries exhausted (${MAX_SCRIPT_RETRIES})`);
      console.log(`📋 [Error Recovery] ${retryQueue.length} events persisted in localStorage. Will retry on next page load if network recovers.`);
      
      if (scriptRetryTimer) {
        clearTimeout(scriptRetryTimer);
        scriptRetryTimer = null;
      }
    }
  };
  
  document.head.appendChild(script);
}

/**
 * Initialize Meta Pixel if ID is provided
 * Implements proper queue management to prevent event loss during initialization
 * 
 * Triple-Queue Architecture:
 * 1. fbq.q - Standard Meta Pixel queue (processed by fbevents.js when it loads)
 * 2. metaPixelQueue - Our own queue (explicitly managed, flushed when ready)
 * 3. retryQueue - Persistent queue for failed events (survives page reloads via localStorage)
 * 
 * This ensures compatibility with standard Meta Pixel SDK while maintaining
 * explicit control over event delivery, preventing race conditions, and handling
 * network failures gracefully.
 */
export function initializeMetaPixel(pixelId: string) {
  if (typeof window === 'undefined' || !pixelId) return;
  
  metaPixelId = pixelId;

  // Check if Meta Pixel is already loaded
  if (window.fbq && metaPixelReady) {
    console.log('✅ Meta Pixel already initialized and ready');
    return;
  }

  // Initialize retry queue from localStorage
  loadRetryQueue();
  
  // Setup network event listeners for online/offline detection
  setupNetworkMonitoring();

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
        
        // Also try to process retry queue in case network is now available
        if (isOnline && retryQueue.length > 0) {
          console.log(`🔄 [Retry Queue] Meta Pixel ready - attempting to process ${retryQueue.length} failed events`);
          processRetryQueue();
        }
      } catch (error) {
        console.error('❌ [Meta Pixel] Initialization failed:', error);
      }
    }
  };
  
  script.onerror = () => {
    console.error('❌ [Meta Pixel] Failed to load script from CDN');
    metaPixelScriptFailed = true;
    
    // CRITICAL: Move all queued events to persistent retry queue
    // This prevents silent data loss if script fails to load
    moveQueuedEventsToRetryQueue();
    
    // Attempt to retry loading the script
    if (metaPixelRetryCount < MAX_SCRIPT_RETRIES) {
      const retryDelay = Math.pow(2, metaPixelRetryCount) * 5000; // 5s, 10s, 20s backoff
      console.log(`🔄 [Error Recovery] Scheduling Meta Pixel script retry ${metaPixelRetryCount + 1}/${MAX_SCRIPT_RETRIES} in ${retryDelay}ms`);
      
      metaPixelRetryCount++;
      
      if (scriptRetryTimer) {
        clearTimeout(scriptRetryTimer);
      }
      
      scriptRetryTimer = setTimeout(() => {
        console.log(`🔄 [Error Recovery] Retrying Meta Pixel script load (attempt ${metaPixelRetryCount}/${MAX_SCRIPT_RETRIES})`);
        retryMetaPixelScript(pixelId);
      }, retryDelay);
    } else {
      console.error(`❌ [Error Recovery] Gave up on Meta Pixel script after ${MAX_SCRIPT_RETRIES} retries`);
      console.log(`📋 [Error Recovery] ${metaPixelQueue.length + retryQueue.length} events persisted in retry queue for manual recovery`);
    }
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
 * Push event to GTM dataLayer with fallback retry queue
 */
function gtmPush(event: string, data?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      ...data,
    });
  } catch (error) {
    console.warn(`⚠️ [GTM] Failed to push event "${event}" to dataLayer:`, error);
    // Add to retry queue for later
    addToRetryQueue(event, data, true);
  }
}

/**
 * Fire event to Meta Pixel with fallback retry queue
 * Queues events if Meta Pixel isn't ready yet, preventing event loss during initialization
 * Uses retry queue for network failures, persisting to localStorage for reliability
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
    console.warn(`⚠️ [Meta Pixel] Event failed (${eventName}):`, error);
    
    // Check if error is likely due to network issues
    const isNetworkError = !isOnline || 
      (error instanceof TypeError && error.message.includes('fetch')) ||
      (error instanceof Error && (
        error.message.includes('Network') ||
        error.message.includes('timeout') ||
        error.message.includes('CORS')
      ));
    
    if (isNetworkError) {
      // Network failure - add to persistent retry queue
      console.log(`📋 [Meta Pixel] Network issue detected - adding to retry queue`);
      addToRetryQueue(eventName, data, false);
    } else {
      // Other error - still queue but in the temporary queue for now
      metaPixelQueue.push({ eventName, data });
      console.log(`⏳ [Meta Pixel] Event queued after error (${metaPixelQueue.length}): ${eventName}`);
    }
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
  
  // Meta Pixel InitiateCheckout event with product metadata
  fireMetaPixelEvent('InitiateCheckout', {
    content_type: 'product',
    currency: currencyCode,
    value: total,
    num_items: items.length,
    contents: items.map(item => ({
      id: item.id,
      title: item.name,
      category: item.category || 'Herbal Products',
      brand: item.brand || 'New Era Herbals',
      quantity: item.quantity,
      price: item.price,
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
  
  // Meta Pixel Purchase event with product metadata for proper categorization and attribution
  fireMetaPixelEvent('Purchase', {
    content_type: 'product',
    currency: currencyCode,
    value: total,
    content_id: items.map(i => i.id).join(','),
    num_items: items.length,
    contents: items.map(item => ({
      id: item.id,
      title: item.name,
      category: item.category || 'Herbal Products',
      brand: item.brand || 'New Era Herbals',
      quantity: item.quantity,
      price: item.price,
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
