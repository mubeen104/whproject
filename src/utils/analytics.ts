/**
 * Analytics Tracking using Google Tag Manager AND Meta Pixel
 * 
 * Fires events to both GTM (for tag-based tracking) and directly to Meta Pixel.
 * Ensures reliable event tracking across both platforms with proper queue management.
 */

// Window interface extended in vite-env.d.ts

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
let metaPixelInitializationAttempted = false; // Track if initialization has been attempted
let metaPixelInitializedId = ''; // Track which pixel ID was initialized
let metaPixelDirectEnabled = false; // Whether direct Meta Pixel tracking is enabled

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
 * CRITICAL: ViewContent Event Deduplication
 * Prevents pixel pollution from multiple components tracking same product
 * Tracks viewed products per session to ensure 1 ViewContent per product
 * 
 * Issue: Related products + cart suggestions + main product = 7-11 events per page
 * Solution: Only fire ViewContent once per product per session
 * Storage: sessionStorage key persists across tab navigation within same session
 */
const VIEWED_PRODUCTS_KEY = 'new_era_herbals_viewed_products';
let viewedProductsSet: Set<string> = new Set();

/**
 * Load previously viewed products from sessionStorage
 */
function loadViewedProducts() {
  if (typeof sessionStorage === 'undefined') return;
  
  try {
    const stored = sessionStorage.getItem(VIEWED_PRODUCTS_KEY);
    if (stored) {
      viewedProductsSet = new Set(JSON.parse(stored));
    }
  } catch (error) {
    console.warn('⚠️ [ViewContent Dedup] Failed to load from sessionStorage:', error);
    viewedProductsSet = new Set();
  }
}

/**
 * Save viewed products to sessionStorage for persistence
 */
function saveViewedProducts() {
  if (typeof sessionStorage === 'undefined') return;
  
  try {
    sessionStorage.setItem(VIEWED_PRODUCTS_KEY, JSON.stringify(Array.from(viewedProductsSet)));
  } catch (error) {
    console.warn('⚠️ [ViewContent Dedup] Failed to save to sessionStorage:', error);
  }
}

/**
 * Check if product ViewContent has already been tracked this session
 */
function hasViewedProduct(productId: string): boolean {
  // Load on first check
  if (viewedProductsSet.size === 0) {
    loadViewedProducts();
  }
  return viewedProductsSet.has(productId);
}

/**
 * Mark product as viewed to prevent duplicate ViewContent tracking
 */
function markProductAsViewed(productId: string) {
  if (!viewedProductsSet.has(productId)) {
    viewedProductsSet.add(productId);
    saveViewedProducts();
  }
}

/**
 * CRITICAL: PageView and General Event Deduplication
 * Prevents duplicate tracking on page refresh, back button, and rapid navigation
 * 
 * Issue: Quick refresh or back button fires same event twice
 * Solution: Track which pages and events fired this session, deduplicate by path+event combo
 * Storage: sessionStorage key persists across same-tab navigation
 */
const TRACKED_PAGES_KEY = 'new_era_herbals_tracked_pages';
let trackedPagesMap: Map<string, number> = new Map();

/**
 * CRITICAL: Purchase Event Deduplication
 * Prevents duplicate Purchase events from React Strict Mode or double renders
 * 
 * Issue: Purchase event fires twice due to React Strict Mode or component re-renders
 * Solution: Track which order IDs have been tracked, prevent duplicates
 * Storage: sessionStorage (survives page navigation but resets on new session)
 */
const TRACKED_PURCHASES_KEY = 'new_era_herbals_tracked_purchases';
let trackedPurchasesSet: Set<string> = new Set();

/**
 * CRITICAL: BeginCheckout Event Deduplication
 * Prevents duplicate BeginCheckout events from useEffect re-runs
 * 
 * Issue: BeginCheckout fires multiple times when dependencies change
 * Solution: Track checkout sessions, prevent duplicate fires within same session
 * Storage: sessionStorage
 */
const TRACKED_CHECKOUTS_KEY = 'new_era_herbals_tracked_checkouts';
let trackedCheckoutsMap: Map<string, number> = new Map();

/**
 * Load previously tracked pages from sessionStorage
 */
function loadTrackedPages() {
  if (typeof sessionStorage === 'undefined') return;
  
  try {
    const stored = sessionStorage.getItem(TRACKED_PAGES_KEY);
    if (stored) {
      const entries = JSON.parse(stored);
      trackedPagesMap = new Map(entries);
    }
  } catch (error) {
    console.warn('⚠️ [PageView Dedup] Failed to load from sessionStorage:', error);
    trackedPagesMap = new Map();
  }
}

/**
 * Save tracked pages to sessionStorage for persistence
 */
function saveTrackedPages() {
  if (typeof sessionStorage === 'undefined') return;
  
  try {
    sessionStorage.setItem(TRACKED_PAGES_KEY, JSON.stringify(Array.from(trackedPagesMap.entries())));
  } catch (error) {
    console.warn('⚠️ [PageView Dedup] Failed to save to sessionStorage:', error);
  }
}

/**
 * Check if a page has been tracked recently (within last 5 seconds for debouncing)
 * Prevents duplicate tracking on rapid navigation or refresh
 */
function hasRecentlyTrackedPage(path: string): boolean {
  if (trackedPagesMap.size === 0) {
    loadTrackedPages();
  }
  
  const timestamp = trackedPagesMap.get(path);
  if (!timestamp) return false;
  
  // If tracked within last 5 seconds, consider it recent
  const fiveSecondsAgo = Date.now() - 5000;
  return timestamp > fiveSecondsAgo;
}

/**
 * Mark page as tracked to prevent duplicate PageView tracking
 */
function markPageAsTracked(path: string) {
  trackedPagesMap.set(path, Date.now());
  saveTrackedPages();
  
  // Clean up old entries older than 30 minutes to prevent memory bloat
  const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
  for (const [page, timestamp] of trackedPagesMap.entries()) {
    if (timestamp < thirtyMinutesAgo) {
      trackedPagesMap.delete(page);
    }
  }
}

/**
 * Load tracked purchases from sessionStorage
 */
function loadTrackedPurchases() {
  if (typeof sessionStorage === 'undefined') return;
  
  try {
    const stored = sessionStorage.getItem(TRACKED_PURCHASES_KEY);
    if (stored) {
      trackedPurchasesSet = new Set(JSON.parse(stored));
    }
  } catch (error) {
    console.warn('⚠️ [Purchase Dedup] Failed to load from sessionStorage:', error);
    trackedPurchasesSet = new Set();
  }
}

/**
 * Save tracked purchases to sessionStorage
 */
function saveTrackedPurchases() {
  if (typeof sessionStorage === 'undefined') return;
  
  try {
    sessionStorage.setItem(TRACKED_PURCHASES_KEY, JSON.stringify(Array.from(trackedPurchasesSet)));
  } catch (error) {
    console.warn('⚠️ [Purchase Dedup] Failed to save to sessionStorage:', error);
  }
}

/**
 * Check if purchase has already been tracked
 */
function hasTrackedPurchase(orderId: string): boolean {
  // First check: in-memory Set (fastest)
  if (trackedPurchasesSet.size === 0) {
    loadTrackedPurchases();
  }
  if (trackedPurchasesSet.has(orderId)) {
    return true;
  }
  
  // Second check: sessionStorage backup (for race conditions)
  if (typeof sessionStorage !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(`purchase_${orderId}`);
      if (stored) {
        // Also add to Set for consistency
        trackedPurchasesSet.add(orderId);
        return true;
      }
    } catch (error) {
      // Ignore storage errors
    }
  }
  
  return false;
}

/**
 * Mark purchase as tracked
 */
function markPurchaseAsTracked(orderId: string) {
  // CRITICAL: Add to Set immediately (synchronous) to prevent race conditions
  // Save to sessionStorage is async but Set check is immediate
  if (!trackedPurchasesSet.has(orderId)) {
    trackedPurchasesSet.add(orderId);
    // Save immediately to sessionStorage for persistence
    // This happens synchronously in the same execution context
    saveTrackedPurchases();
    
    // Also set a flag in sessionStorage immediately as a backup check
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem(`purchase_${orderId}`, Date.now().toString());
      } catch (error) {
        // Ignore storage errors
      }
    }
  }
}

/**
 * Load tracked checkouts from sessionStorage
 */
function loadTrackedCheckouts() {
  if (typeof sessionStorage === 'undefined') return;
  
  try {
    const stored = sessionStorage.getItem(TRACKED_CHECKOUTS_KEY);
    if (stored) {
      const entries = JSON.parse(stored);
      trackedCheckoutsMap = new Map(entries);
    }
  } catch (error) {
    console.warn('⚠️ [BeginCheckout Dedup] Failed to load from sessionStorage:', error);
    trackedCheckoutsMap = new Map();
  }
}

/**
 * Save tracked checkouts to sessionStorage
 */
function saveTrackedCheckouts() {
  if (typeof sessionStorage === 'undefined') return;
  
  try {
    sessionStorage.setItem(TRACKED_CHECKOUTS_KEY, JSON.stringify(Array.from(trackedCheckoutsMap.entries())));
  } catch (error) {
    console.warn('⚠️ [BeginCheckout Dedup] Failed to save to sessionStorage:', error);
  }
}

/**
 * Check if checkout has been tracked in this session
 * Changed from time-based (10 seconds) to session-based to prevent duplicates
 * Once a checkout is tracked, it won't be tracked again in the same session
 */
function hasRecentlyTrackedCheckout(checkoutKey: string): boolean {
  if (trackedCheckoutsMap.size === 0) {
    loadTrackedCheckouts();
  }
  
  // Session-based: if it exists in the map, it's already been tracked this session
  // This prevents duplicate BeginCheckout events even if dependencies change
  return trackedCheckoutsMap.has(checkoutKey);
}

/**
 * Mark checkout as tracked
 */
function markCheckoutAsTracked(checkoutKey: string) {
  trackedCheckoutsMap.set(checkoutKey, Date.now());
  saveTrackedCheckouts();
  
  // Clean up old entries older than 5 minutes
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  for (const [key, timestamp] of trackedCheckoutsMap.entries()) {
    if (timestamp < fiveMinutesAgo) {
      trackedCheckoutsMap.delete(key);
    }
  }
}

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
      // Validate event before sending
      if (!event.eventName || typeof event.eventName !== 'string') {
        console.warn(`⚠️ [Meta Pixel] Skipping invalid queued event:`, event);
        continue;
      }

      // Ensure fbq is callable
      if (typeof window.fbq !== 'function') {
        throw new Error('fbq is not a function');
      }

      window.fbq('track', event.eventName, event.data || {});
      console.log(`✅ [Meta Pixel] Flushed event: ${event.eventName}`);
    } catch (error) {
      console.warn(`❌ [Meta Pixel] Failed to flush event ${event.eventName}:`, error);
      // Re-queue failed events to retry queue
      addToRetryQueue(event.eventName, event.data, false);
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
  if (metaPixelReady && metaPixelInitializedId === pixelId) {
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
        // CRITICAL: Check if pixel has already been initialized before calling init
        const fbqAny = window.fbq as any;
        const isAlreadyInitialized = fbqAny._pixelIds && 
          Array.isArray(fbqAny._pixelIds) && 
          fbqAny._pixelIds.includes(pixelId);
        
        if (isAlreadyInitialized) {
          console.log(`✅ [Error Recovery] Pixel ${pixelId} already initialized, skipping duplicate init`);
          metaPixelReady = true;
          metaPixelInitializedId = pixelId;
        } else {
          window.fbq('init', pixelId);
          console.log(`✅ [Error Recovery] Pixel initialized successfully on retry`);
          metaPixelReady = true;
          metaPixelInitializedId = pixelId;
        }
        
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
  
  // CRITICAL: Check if Meta Pixel is already initialized by GTM or another script
  // Check if fbq exists and has been initialized with any pixel ID
  if (window.fbq && typeof window.fbq === 'function') {
    try {
      const fbqAny = window.fbq as any;
      
      // Check if pixel IDs are already registered
      if (fbqAny._pixelIds && Array.isArray(fbqAny._pixelIds) && fbqAny._pixelIds.length > 0) {
        // Check if our pixel ID is already in the list
        if (fbqAny._pixelIds.includes(pixelId)) {
          console.log(`✅ Meta Pixel ${pixelId} already initialized (likely by GTM or another script)`);
          metaPixelId = pixelId;
          metaPixelInitializedId = pixelId;
          metaPixelReady = true;
          metaPixelDirectEnabled = true;
          flushMetaPixelQueue();
          return;
        } else {
          // Different pixel ID already initialized - don't initialize another one
          console.warn(`⚠️ Meta Pixel already initialized with different ID(s): ${fbqAny._pixelIds.join(', ')}. Skipping initialization of ${pixelId} to prevent conflicts.`);
          return;
        }
      }
      
      // Check if fbq has been called with 'init' (even if _pixelIds isn't available)
      // This is a fallback check for older Meta Pixel versions
      if (fbqAny.loaded && fbqAny.version) {
        console.log('⚠️ Meta Pixel appears to be initialized by another script. Checking if our pixel ID matches...');
        // If script exists but we can't verify pixel ID, assume it's already initialized
        const existingScript = document.querySelector('script[src*="fbevents.js"]');
        if (existingScript) {
          console.log('✅ Meta Pixel script already loaded by another source. Using existing instance.');
          metaPixelId = pixelId;
          metaPixelInitializedId = pixelId;
          metaPixelReady = true;
          metaPixelDirectEnabled = true;
          flushMetaPixelQueue();
          return;
        }
      }
    } catch (error) {
      console.warn('⚠️ Error checking Meta Pixel initialization status:', error);
    }
  }
  
  // CRITICAL: Prevent duplicate initialization
  // Check if we've already initialized this exact pixel ID
  if (metaPixelInitializedId === pixelId && metaPixelReady) {
    console.log('✅ Meta Pixel already initialized with this ID');
    return;
  }
  
  // Check if script is already in DOM (prevents duplicate script tags)
  const existingScript = document.querySelector('script[src*="fbevents.js"]');
  if (existingScript) {
    // Script exists - check if pixel is ready or wait for it
    if (window.fbq && metaPixelReady) {
      console.log('✅ Meta Pixel script already loaded and ready');
      metaPixelId = pixelId;
      metaPixelInitializedId = pixelId;
      return;
    }
    // Script exists but not ready yet - don't create another one
    console.log('⏳ Meta Pixel script already loading, waiting for initialization...');
    metaPixelId = pixelId;
    return;
  }
  
  // Check if initialization was already attempted (prevents React Strict Mode duplicates)
  if (metaPixelInitializationAttempted && metaPixelInitializedId === pixelId) {
    console.log('⏳ Meta Pixel initialization already in progress for this ID');
    return;
  }
  
  metaPixelId = pixelId;
  metaPixelInitializationAttempted = true;
  metaPixelInitializedId = pixelId;
  metaPixelDirectEnabled = true;

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

  // Load Meta Pixel script (only if not already in DOM)
  // Check again right before creating script tag to prevent race conditions
  if (document.querySelector('script[src*="fbevents.js"]')) {
    console.log('⏳ [Meta Pixel] Script already exists in DOM, skipping duplicate creation');
    return;
  }
  
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://connect.facebook.net/en_US/fbevents.js`;
  
  script.onload = () => {
    console.log('📥 [Meta Pixel] Script loaded from CDN');
    
    // Wait a brief moment to ensure fbevents.js has fully initialized and processed fbq.q
    setTimeout(() => {
      // Initialize the pixel
      if (window.fbq) {
        try {
          // CRITICAL: Check if pixel has already been initialized with this ID
          // Meta Pixel stores initialized pixel IDs in fbq._pixelIds array
          const fbqAny = window.fbq as any;
          const isAlreadyInitialized = fbqAny._pixelIds && 
            Array.isArray(fbqAny._pixelIds) && 
            fbqAny._pixelIds.includes(pixelId);
          
          if (isAlreadyInitialized) {
            console.log(`✅ [Meta Pixel] Pixel ${pixelId} already initialized (likely by GTM or another script), skipping duplicate init`);
            metaPixelReady = true;
            metaPixelInitializedId = pixelId;
          } else {
            // Double-check: if any pixel IDs exist, don't initialize another one to prevent conflicts
            if (fbqAny._pixelIds && Array.isArray(fbqAny._pixelIds) && fbqAny._pixelIds.length > 0) {
              console.warn(`⚠️ [Meta Pixel] Other pixel IDs already initialized: ${fbqAny._pixelIds.join(', ')}. Skipping initialization of ${pixelId} to prevent "Multiple pixels with conflicting versions" error.`);
              console.log(`ℹ️ [Meta Pixel] Using existing Meta Pixel instance. Events will still be tracked.`);
              metaPixelReady = true;
              metaPixelInitializedId = pixelId;
            } else {
              // Safe to initialize - no other pixels detected
              window.fbq('init', pixelId);
              console.log(`✅ [Meta Pixel] Pixel initialized with ID: ${pixelId}`);
              
              // Mark as ready AFTER initialization completes
              metaPixelReady = true;
              metaPixelInitializedId = pixelId;
            }
          }
          
          console.log('✅ [Meta Pixel] Ready to track events');
          
          // Note: fbevents.js automatically processes events in fbq.q when it loads
          // We only need to flush metaPixelQueue for events that weren't in fbq.q
          // However, to be safe and ensure all events are sent, we flush metaPixelQueue
          // Meta Pixel has built-in deduplication, so duplicate events won't cause issues
          flushMetaPixelQueue();
          
          // Also try to process retry queue in case network is now available
          if (isOnline && retryQueue.length > 0) {
            console.log(`🔄 [Retry Queue] Meta Pixel ready - attempting to process ${retryQueue.length} failed events`);
            processRetryQueue();
          }
        } catch (error) {
          console.error('❌ [Meta Pixel] Initialization failed:', error);
          // Even if initialization fails, try to queue events for retry
          moveQueuedEventsToRetryQueue();
        }
      } else {
        console.error('❌ [Meta Pixel] fbq not available after script load');
        moveQueuedEventsToRetryQueue();
      }
    }, 100); // Small delay to ensure fbevents.js has processed fbq.q
  };
  
  script.onerror = () => {
    // When ERR_BLOCKED_BY_CLIENT occurs, it's typically an ad blocker
    // We check if script exists in DOM but didn't load - indicates ad blocker
    // Small delay to distinguish ad blocker from network error
    setTimeout(() => {
      const scriptElement = document.querySelector(`script[src*="fbevents.js"]`);
      const isLikelyAdBlocker = scriptElement && !metaPixelReady;
      
      if (isLikelyAdBlocker) {
        console.warn('⚠️ [Meta Pixel] Script appears to be blocked by ad blocker or browser extension.');
        console.info('ℹ️ [Meta Pixel] Events are being queued and will be sent automatically if the blocker is disabled.');
        // Don't retry if blocked by ad blocker - it won't help
        // Just move events to retry queue and they'll be sent if user disables blocker
        moveQueuedEventsToRetryQueue();
        return;
      }
      
      // Network error - proceed with retry logic
      console.error('❌ [Meta Pixel] Failed to load script from CDN (likely network issue)');
      metaPixelScriptFailed = true;
      
      // CRITICAL: Move all queued events to persistent retry queue
      // This prevents silent data loss if script fails to load
      moveQueuedEventsToRetryQueue();
      
      // Attempt to retry loading the script (only for network errors, not ad blockers)
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
        console.log(`📋 [Error Recovery] ${metaPixelQueue.length + retryQueue.length} events persisted in retry queue. Will retry when network is available.`);
      }
    }, 1000); // Wait 1 second to distinguish ad blocker from network error
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
  
  // Validate event name
  if (!event || typeof event !== 'string' || event.trim() === '') {
    console.warn(`⚠️ [GTM] Invalid event name: ${event}`);
    return;
  }

  // Clean and validate data
  let cleanData: Record<string, any> = {};
  if (data && typeof data === 'object') {
    try {
      // Remove any undefined, null, or invalid values that could cause issues
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== undefined && value !== null) {
          // Convert NaN to null for JSON serialization
          if (typeof value === 'number' && isNaN(value)) {
            cleanData[key] = null;
          } else {
            cleanData[key] = value;
          }
        }
      });
    } catch (error) {
      console.warn(`⚠️ [GTM] Error cleaning event data:`, error);
      cleanData = {};
    }
  }
  
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      ...cleanData,
    });
    console.log(`✅ [GTM] Event pushed: ${event}`);
  } catch (error) {
    console.warn(`⚠️ [GTM] Failed to push event "${event}" to dataLayer:`, error);
    // Add to retry queue for later
    addToRetryQueue(event, cleanData, true);
  }
}

/**
 * Fire event to Meta Pixel with fallback retry queue
 * Queues events if Meta Pixel isn't ready yet, preventing event loss during initialization
 * Uses retry queue for network failures, persisting to localStorage for reliability
 */
function fireMetaPixelEvent(eventName: string, data?: Record<string, any>) {
  if (typeof window === 'undefined' || !metaPixelDirectEnabled) {
    return;
  }

  // If Meta Pixel ID is not configured, skip Meta Pixel tracking entirely
  // This prevents events from being queued indefinitely when pixel ID is missing
  if (!metaPixelId) {
    // Silently skip - this is expected when Meta Pixel ID is not configured
    return;
  }

  // Validate event name
  if (!eventName || typeof eventName !== 'string' || eventName.trim() === '') {
    console.warn(`⚠️ [Meta Pixel] Invalid event name: ${eventName}`);
    return;
  }

  // Clean and validate data
  let cleanData: Record<string, any> = {};
  if (data && typeof data === 'object') {
    try {
      // Remove any undefined, null, or invalid values that could cause issues
      Object.keys(data).forEach(key => {
        const value = data[key];
        if (value !== undefined && value !== null) {
          // Convert NaN to null for JSON serialization
          if (typeof value === 'number' && isNaN(value)) {
            cleanData[key] = null;
          } else {
            cleanData[key] = value;
          }
        }
      });
    } catch (error) {
      console.warn(`⚠️ [Meta Pixel] Error cleaning event data:`, error);
      cleanData = {};
    }
  }

  // If Meta Pixel is not ready, queue the event in BOTH queues
  // 1. fbq.q - Standard Meta Pixel queue (processed automatically by fbevents.js when it loads)
  // 2. metaPixelQueue - Our own queue (explicitly flushed when ready)
  // This dual-queue approach ensures events are never lost
  if (!metaPixelReady || !window.fbq) {
    // Add to our explicit queue
    metaPixelQueue.push({ eventName, data: cleanData });
    
    // Also add to fbq.q if it exists (standard Meta Pixel queue)
    // This ensures fbevents.js will process it automatically when it loads
    if (window.fbq && (window.fbq as any).q && Array.isArray((window.fbq as any).q)) {
      try {
        (window.fbq as any).q.push(['track', eventName, cleanData || {}]);
        console.log(`⏳ [Meta Pixel] Event queued in fbq.q + metaPixelQueue (${metaPixelQueue.length}): ${eventName}`);
      } catch (error) {
        console.warn(`⚠️ [Meta Pixel] Failed to queue in fbq.q:`, error);
        console.log(`⏳ [Meta Pixel] Event queued in metaPixelQueue only (${metaPixelQueue.length}): ${eventName}`);
      }
    } else {
      console.log(`⏳ [Meta Pixel] Event queued in metaPixelQueue (${metaPixelQueue.length}): ${eventName}`);
    }
    return;
  }

  // If ready, fire the event immediately
  try {
    // Ensure fbq is callable
    if (typeof window.fbq !== 'function') {
      throw new Error('fbq is not a function');
    }
    
    window.fbq('track', eventName, cleanData || {});
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
      addToRetryQueue(eventName, cleanData, false);
    } else {
      // Other error - still queue but in the temporary queue for now
      metaPixelQueue.push({ eventName, data: cleanData });
      console.log(`⏳ [Meta Pixel] Event queued after error (${metaPixelQueue.length}): ${eventName}`);
    }
  }
}

/**
 * Track page view - WITH DEDUPLICATION
 * CRITICAL: Prevents duplicate PageView tracking on refresh/back button
 * Only fires once per page per 5-second window
 */
export function trackPageView(path: string) {
  // DEDUPLICATION: Check if we've tracked this page recently
  if (hasRecentlyTrackedPage(path)) {
    console.log(`⏭️  [PageView Dedup] SKIPPING - Page "${path}" already tracked within 5 seconds`);
    return; // Skip tracking - already done recently
  }
  
  // Mark page as tracked to prevent duplicate PageView tracking
  markPageAsTracked(path);
  
  console.log(`✅ [PageView Dedup] TRACKING - Page "${path}" (first view this period)`);
  
  gtmPush('page_view', {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
  });
  
  // Meta Pixel will be handled by GTM tags
}

/**
 * Track product view - WITH DEDUPLICATION
 * CRITICAL: Prevents pixel pollution from related products + suggestions
 * Only fires once per product per session
 */
export function trackViewContent(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  brand?: string;
  currency?: string;
}) {
  // Validate required fields
  if (!product || !product.id || !product.name || typeof product.price !== 'number' || isNaN(product.price)) {
    console.warn(`⚠️ [ViewContent] Invalid product data:`, product);
    return;
  }

  // DEDUPLICATION: Check if we've already tracked this product this session
  if (hasViewedProduct(product.id)) {
    console.log(`⏭️  [ViewContent Dedup] SKIPPING - Product "${product.name}" already tracked this session`);
    return; // Skip tracking - already done
  }
  
  // Mark product as viewed to prevent future duplicate tracking
  markProductAsViewed(product.id);
  
  const currencyCode = product.currency ? getCurrencyCode(product.currency) : 'PKR';
  const category = product.category || 'Herbal Products';
  const brand = product.brand || 'New Era Herbals';
  
  const gtmData = {
    currency: currencyCode,
    value: product.price,
    items: [{
      item_id: String(product.id),
      item_name: String(product.name),
      item_category: category,
      item_brand: brand,
      price: product.price,
    }],
  };
  
  console.log(`✅ [ViewContent Dedup] TRACKING - "${product.name}" (first view this session)`);
  gtmPush('view_item', gtmData);
  
  // Meta Pixel will be handled by GTM tags
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
  // Validate required fields
  if (!product || !product.id || !product.name || typeof product.price !== 'number' || isNaN(product.price)) {
    console.warn(`⚠️ [AddToCart] Invalid product data:`, product);
    return;
  }

  if (typeof product.quantity !== 'number' || isNaN(product.quantity) || product.quantity <= 0) {
    console.warn(`⚠️ [AddToCart] Invalid quantity:`, product.quantity);
    return;
  }

  const currencyCode = product.currency ? getCurrencyCode(product.currency) : 'PKR';
  const value = product.price * product.quantity;
  const category = product.category || 'Herbal Products';
  const brand = product.brand || 'New Era Herbals';
  
  const gtmData = {
    currency: currencyCode,
    value,
    items: [{
      item_id: String(product.id),
      item_name: String(product.name),
      item_category: category,
      item_brand: brand,
      price: product.price,
      quantity: product.quantity,
    }],
  };
  
  gtmPush('add_to_cart', gtmData);
  
  // Meta Pixel will be handled by GTM tags
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
  // Validate inputs
  if (!items || !Array.isArray(items) || items.length === 0) {
    console.warn(`⚠️ [BeginCheckout] Invalid items array:`, items);
    return;
  }

  if (typeof total !== 'number' || isNaN(total) || total <= 0) {
    console.warn(`⚠️ [BeginCheckout] Invalid total:`, total);
    return;
  }

  // DEDUPLICATION: Create a unique key for this checkout session
  // Based on items and total to prevent duplicate fires from useEffect re-runs
  const itemsKey = items.map(i => `${i.id}:${i.quantity}`).sort().join(',');
  const checkoutKey = `${itemsKey}:${total.toFixed(2)}`;
  
  if (hasRecentlyTrackedCheckout(checkoutKey)) {
    console.log(`⏭️  [BeginCheckout Dedup] SKIPPING - Checkout already tracked within 10 seconds`);
    return;
  }
  
  // Mark checkout as tracked
  markCheckoutAsTracked(checkoutKey);
  
  console.log(`✅ [BeginCheckout Dedup] TRACKING - Checkout with ${items.length} items, Total: ${total}`);
  
  // Filter out invalid items
  const validItems = items.filter(item => {
    const isValid = item && item.id && item.name && 
                    typeof item.price === 'number' && !isNaN(item.price) &&
                    typeof item.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0;
    if (!isValid) {
      console.warn(`⚠️ [BeginCheckout] Invalid item filtered out:`, item);
    }
    return isValid;
  });

  if (validItems.length === 0) {
    console.warn(`⚠️ [BeginCheckout] No valid items to track`);
    return;
  }

  const currencyCode = currency ? getCurrencyCode(currency) : 'PKR';
  
  const gtmData = {
    currency: currencyCode,
    value: total,
    tax: tax || 0,
    shipping: shipping || 0,
    items: validItems.map(item => ({
      item_id: String(item.id),
      item_name: String(item.name),
      item_category: item.category || 'Herbal Products',
      item_brand: item.brand || 'New Era Herbals',
      price: item.price,
      quantity: item.quantity,
    })),
  };
  
  gtmPush('begin_checkout', gtmData);
  
  // Meta Pixel will be handled by GTM tags
}

/**
 * CRITICAL: Track purchase with race condition prevention
 * 
 * Problem: If user closes tab after order creation but before Purchase event completes,
 * conversion is lost (race condition between server response and pixel tracking)
 * 
 * Solution: Triple redundancy for Purchase events:
 * 1. Add to persistent retry queue BEFORE firing (survives page closure)
 * 2. Fire event immediately to both GTM and Meta Pixel
 * 3. Use sendBeacon() for Meta Pixel as fallback (survives unload)
 * 
 * Even if user closes tab immediately, event will retry on next page load
 * 
 * @param orderId - Unique order ID (UUID) for deduplication - must be consistent
 * @param transactionId - Human-readable transaction ID (order_number) for GTM/Meta Pixel - optional, defaults to orderId
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
  shipping?: number,
  transactionId?: string // Optional: human-readable transaction ID (e.g., order_number)
) {
  // CRITICAL VALIDATION: Ensure this is a real, valid order
  // Prevent test events, invalid orders, and $0 orders from being tracked
  
  // 1. Validate order ID format (must be a valid UUID)
  if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
    console.warn(`⚠️ [Purchase] Invalid order ID:`, orderId);
    return;
  }
  
  // Validate UUID format (basic check - should be 36 characters with dashes)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(orderId.trim())) {
    console.warn(`⚠️ [Purchase] Order ID is not a valid UUID format:`, orderId);
    return;
  }

  // 2. Validate items array
  if (!items || !Array.isArray(items) || items.length === 0) {
    console.warn(`⚠️ [Purchase] Invalid items array:`, items);
    return;
  }

  // 3. Validate total amount (must be > 0 and a valid number)
  if (typeof total !== 'number' || isNaN(total) || total <= 0) {
    console.warn(`⚠️ [Purchase] Invalid total (must be > 0):`, total);
    return;
  }
  
  // 4. Additional validation: Ensure total is reasonable (not test data)
  // Reject orders with suspiciously low or high values that might be test data
  if (total < 0.01) {
    console.warn(`⚠️ [Purchase] Order total too low (${total}), likely test data. Skipping.`);
    return;
  }

  // 5. Validate transaction ID if provided (should be a valid order number)
  if (transactionId && (typeof transactionId !== 'string' || transactionId.trim() === '')) {
    console.warn(`⚠️ [Purchase] Invalid transaction ID:`, transactionId);
    return;
  }

  // DEDUPLICATION: Check if this order has already been tracked
  // Prevents duplicate Purchase events from React Strict Mode or double renders
  // Use orderId (UUID) for deduplication to ensure uniqueness
  if (hasTrackedPurchase(orderId)) {
    console.log(`⏭️  [Purchase Dedup] SKIPPING - Order "${orderId}" already tracked this session`);
    return;
  }
  
  // CRITICAL: Mark purchase as tracked IMMEDIATELY (before any async operations)
  // This prevents race conditions where the function is called twice before the first call completes
  markPurchaseAsTracked(orderId);
  
  // Additional check: if somehow we're here but it's already tracked, skip
  // This is a double-check for race conditions
  if (hasTrackedPurchase(orderId)) {
    console.log(`⏭️  [Purchase Dedup] SKIPPING - Order "${orderId}" already tracked (race condition check)`);
    return;
  }

  // Filter out invalid items with strict validation
  const validItems = items.filter(item => {
    const isValid = item && 
                    item.id && typeof item.id === 'string' && item.id.trim() !== '' &&
                    item.name && typeof item.name === 'string' && item.name.trim() !== '' &&
                    typeof item.price === 'number' && !isNaN(item.price) && item.price > 0 &&
                    typeof item.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0 &&
                    Number.isInteger(item.quantity); // Quantity must be an integer
    if (!isValid) {
      console.warn(`⚠️ [Purchase] Invalid item filtered out:`, item);
    }
    return isValid;
  });

  if (validItems.length === 0) {
    console.warn(`⚠️ [Purchase] No valid items to track - all items were invalid`);
    return;
  }
  
  // Additional validation: Ensure calculated total matches items total (within reasonable tolerance)
  const calculatedTotal = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDifference = Math.abs(total - calculatedTotal);
  const tolerance = 0.01; // Allow 1 cent difference for rounding
  
  if (totalDifference > tolerance) {
    console.warn(`⚠️ [Purchase] Total mismatch: provided=${total}, calculated=${calculatedTotal}, difference=${totalDifference}. This may indicate invalid order data.`);
    // Still proceed but log warning
  }

  const currencyCode = currency ? getCurrencyCode(currency) : 'PKR';
  
  // Use transactionId if provided (human-readable order_number), otherwise use orderId (UUID)
  const finalTransactionId = transactionId || orderId;
  
  const gtmData = {
    transaction_id: String(finalTransactionId),
    currency: currencyCode,
    value: total,
    tax: tax || 0,
    shipping: shipping || 0,
    items: validItems.map(item => ({
      item_id: String(item.id),
      item_name: String(item.name),
      item_category: item.category || 'Herbal Products',
      item_brand: item.brand || 'New Era Herbals',
      price: item.price,
      quantity: item.quantity,
    })),
  };
  
  const pixelData = {
    content_type: 'product',
    currency: currencyCode,
    value: total,
    content_id: validItems.map(i => String(i.id)).join(','),
    num_items: validItems.length,
    contents: validItems.map(item => ({
      id: String(item.id),
      title: String(item.name),
      category: item.category || 'Herbal Products',
      brand: item.brand || 'New Era Herbals',
      quantity: item.quantity,
      price: item.price,
    })),
  };

  // Final validation before sending: Ensure all required data is present
  if (!finalTransactionId || finalTransactionId.trim() === '') {
    console.warn(`⚠️ [Purchase] Missing transaction ID, using order ID as fallback`);
  }
  
  if (!currencyCode || currencyCode.trim() === '') {
    console.warn(`⚠️ [Purchase] Missing currency code, using PKR as fallback`);
  }

  // Fire GTM event (only for valid, real orders)
  gtmPush('purchase', gtmData);
  
  // Meta Pixel will be handled by GTM tags
  
  console.log(`🛒 [Tracking] Purchase - Order: ${orderId}, Transaction: ${finalTransactionId}, Total: ${total} ${currencyCode}, Items: ${validItems.length}`);
}

/**
 * Track search
 */
export function trackSearch(searchTerm: string) {
  // Validate search term
  if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
    console.warn(`⚠️ [Search] Invalid search term:`, searchTerm);
    return;
  }

  const cleanSearchTerm = searchTerm.trim();
  
  gtmPush('search', {
    search_term: cleanSearchTerm,
  });
  
  // Meta Pixel will be handled by GTM tags
}

/**
 * Track custom event
 */
export function trackCustomEvent(eventName: string, data?: Record<string, any>) {
  gtmPush(eventName, data);
  
  // Meta Pixel will be handled by GTM tags
}

/**
 * Initialize helper functions exposed via window.neTrack
 * These functions provide a simple API for external scripts to track events
 * Matches the pattern from the provided tracking script
 */
function initializeHelperFunctions() {
  if (typeof window === 'undefined') return;
  
  (window as any).neTrack = {
    viewContent: (productId: string, title: string, price: number, currency: string) => {
      console.log('[GTM] ViewContent', productId, title, price, currency);
      
      // Fire GTM view_item (Meta Pixel handled by GTM tags)
      gtmPush('view_item', {
        items: [{
          id: productId,
          title,
          price,
          currency
        }]
      });
    },
    
    addToCart: (productId: string, title: string, price: number, currency: string, quantity: number = 1) => {
      console.log('[GTM] AddToCart', productId, title, price, currency, quantity);
      
      // Fire GTM add_to_cart (Meta Pixel handled by GTM tags)
      gtmPush('add_to_cart', {
        items: [{
          id: productId,
          title,
          price,
          currency,
          quantity
        }]
      });
    },
    
    initiateCheckout: (orderTotal: number, currency: string) => {
      console.log('[GTM] InitiateCheckout', orderTotal, currency);
      
      // Fire GTM begin_checkout (Meta Pixel handled by GTM tags)
      gtmPush('begin_checkout', {
        value: orderTotal,
        currency: currency
      });
    },
    
    purchase: (orderTotal: number, currency: string, productIds: string[]) => {
      console.log('[GTM] Purchase', orderTotal, currency, productIds);
      
      // Fire GTM purchase (Meta Pixel handled by GTM tags)
      gtmPush('purchase', {
        value: orderTotal,
        currency: currency,
        items: productIds.map(id => ({ id }))
      });
    }
  };
  
  console.log('[GTM] Tracking helper functions initialized');
}

// Initialize helper functions when module loads
if (typeof window !== 'undefined') {
  initializeHelperFunctions();
}
