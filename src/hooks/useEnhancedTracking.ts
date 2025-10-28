import { useCallback } from 'react';

interface TrackingData {
  [key: string]: any;
}

interface ProductTrackingData {
  product_id: string;
  product_name?: string;
  price: number;
  currency: string;
  category?: string;
  quantity?: number;
}

interface PurchaseTrackingData {
  order_id: string;
  value: number;
  currency: string;
  items: ProductTrackingData[];
  shipping?: number;
  tax?: number;
  coupon?: string;
}

export const useEnhancedTracking = () => {
  
  // Enhanced event tracking with error handling and retry
  const trackEvent = useCallback((eventName: string, data?: TrackingData, options?: { retry?: boolean }) => {
    if (typeof window === 'undefined') return;

    const enhancedData = {
      ...data,
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_title: document.title,
      user_agent: navigator.userAgent,
      referrer: document.referrer
    };

    console.info(`🎯 Tracking event: ${eventName}`, enhancedData);

    // Add to dataLayer
    if (window.dataLayer) {
      window.dataLayer.push({
        event: `custom_${eventName.toLowerCase()}`,
        event_data: enhancedData
      });
    }

    // Track with retry mechanism
    const executeTracking = () => {
      try {
        // Google Ads
        if (window.gtag) {
          const googleEventMap: { [key: string]: string } = {
            'AddToCart': 'add_to_cart',
            'Purchase': 'purchase',
            'ViewContent': 'view_item',
            'InitiateCheckout': 'begin_checkout',
            'Search': 'search',
            'ViewCategory': 'view_item_list'
          };
          const googleEvent = googleEventMap[eventName] || eventName.toLowerCase();
          window.gtag('event', googleEvent, enhancedData);
        }

        // Meta Pixel
        if (window.fbq) {
          const metaEventMap: { [key: string]: string } = {
            'ViewContent': 'ViewContent',
            'AddToCart': 'AddToCart',
            'InitiateCheckout': 'InitiateCheckout',
            'Purchase': 'Purchase',
            'Search': 'Search',
            'ViewCategory': 'ViewContent'
          };
          const metaEvent = metaEventMap[eventName] || eventName;
          window.fbq('track', metaEvent, enhancedData);
        }

        // TikTok Pixel
        if (window.ttq) {
          const tiktokEventMap: { [key: string]: string } = {
            'ViewContent': 'ViewContent',
            'AddToCart': 'AddToCart',
            'InitiateCheckout': 'InitiateCheckout',
            'Purchase': 'PlaceAnOrder',
            'Search': 'Search'
          };
          const tiktokEvent = tiktokEventMap[eventName] || eventName;
          window.ttq.track(tiktokEvent, enhancedData);
        }

        // LinkedIn Insight Tag
        if (window.lintrk) {
          window.lintrk('track', { conversion_id: eventName.toLowerCase() });
        }

        // Twitter/X Pixel
        if (window.twq) {
          const twitterEvent = eventName;
          window.twq('track', twitterEvent, enhancedData);
        }

        // Pinterest Tag
        if (window.pintrk) {
          const pinterestEventMap: { [key: string]: string } = {
            'ViewContent': 'pagevisit',
            'AddToCart': 'addtocart',
            'InitiateCheckout': 'checkout',
            'Purchase': 'purchase',
            'Search': 'search'
          };
          const pinterestEvent = pinterestEventMap[eventName] || eventName.toLowerCase();
          window.pintrk('track', pinterestEvent, enhancedData);
        }

        // Snapchat Pixel
        if (window.snaptr) {
          const snapchatEventMap: { [key: string]: string } = {
            'ViewContent': 'VIEW_CONTENT',
            'AddToCart': 'ADD_CART',
            'InitiateCheckout': 'START_CHECKOUT',
            'Purchase': 'PURCHASE',
            'Search': 'SEARCH'
          };
          const snapchatEvent = snapchatEventMap[eventName] || eventName.toUpperCase();
          window.snaptr('track', snapchatEvent, enhancedData);
        }

        // Microsoft Advertising
        if (window.uetq) {
          const microsoftEvent = eventName.toLowerCase();
          window.uetq.push('event', microsoftEvent, enhancedData);
        }

        // Reddit Pixel
        if (window.rdt) {
          const redditEvent = eventName;
          window.rdt('track', redditEvent, enhancedData);
        }

        // Quora Pixel
        if (window.qp) {
          const quoraEvent = eventName;
          window.qp('track', quoraEvent, enhancedData);
        }

      } catch (error) {
        console.warn(`Tracking error for ${eventName}:`, error);
        
        // Retry once if enabled
        if (options?.retry) {
          setTimeout(() => {
            executeTracking();
          }, 1000);
        }
      }
    };

    executeTracking();
  }, []);

  // Enhanced page view tracking
  const trackPageView = useCallback((pageData?: TrackingData) => {
    const enhancedPageData = {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_hostname: window.location.hostname,
      page_referrer: document.referrer,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      ...pageData
    };

    trackEvent('PageView', enhancedPageData, { retry: true });
  }, [trackEvent]);

  // Enhanced product view tracking
  const trackProductView = useCallback((productData: ProductTrackingData) => {
    const enhancedProductData = {
      currency: productData.currency,
      value: productData.price,
      content_ids: [productData.product_id], // Using product_id which should be SKU
      content_name: productData.product_name,
      content_category: productData.category,
      content_type: 'product',
      item_id: productData.product_id,
      item_name: productData.product_name,
      item_category: productData.category,
      price: productData.price,
      quantity: productData.quantity || 1,
      // Additional Meta Pixel specific parameters
      num_items: 1
    };

    trackEvent('ViewContent', enhancedProductData, { retry: true });
  }, [trackEvent]);

  // Enhanced add to cart tracking
  const trackAddToCart = useCallback((productData: ProductTrackingData) => {
    const enhancedCartData = {
      currency: productData.currency,
      value: productData.price * (productData.quantity || 1),
      content_ids: [productData.product_id], // Using product_id which should be SKU
      content_name: productData.product_name,
      content_category: productData.category,
      content_type: 'product',
      item_id: productData.product_id,
      item_name: productData.product_name,
      item_category: productData.category,
      price: productData.price,
      quantity: productData.quantity || 1,
      num_items: productData.quantity || 1,
      contents: [{
        id: productData.product_id,
        quantity: productData.quantity || 1,
        item_price: productData.price
      }]
    };

    trackEvent('AddToCart', enhancedCartData, { retry: true });
  }, [trackEvent]);

  // Enhanced purchase tracking
  const trackPurchase = useCallback((purchaseData: PurchaseTrackingData) => {
    const enhancedPurchaseData = {
      currency: purchaseData.currency,
      value: purchaseData.value,
      transaction_id: purchaseData.order_id,
      content_ids: purchaseData.items.map(item => item.product_id),
      content_type: 'product',
      num_items: purchaseData.items.length,
      shipping: purchaseData.shipping || 0,
      tax: purchaseData.tax || 0,
      coupon: purchaseData.coupon,
      items: purchaseData.items.map((item, index) => ({
        item_id: item.product_id,
        item_name: item.product_name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity || 1,
        index: index
      })),
      contents: purchaseData.items.map(item => ({
        id: item.product_id,
        quantity: item.quantity || 1,
        item_price: item.price
      }))
    };

    trackEvent('Purchase', enhancedPurchaseData, { retry: true });
  }, [trackEvent]);

  // Enhanced checkout initiation tracking
  const trackInitiateCheckout = useCallback((checkoutData: { value: number; currency: string; items: ProductTrackingData[] }) => {
    const enhancedCheckoutData = {
      currency: checkoutData.currency,
      value: checkoutData.value,
      content_ids: checkoutData.items.map(item => item.product_id),
      content_type: 'product',
      num_items: checkoutData.items.length,
      items: checkoutData.items.map((item, index) => ({
        item_id: item.product_id,
        item_name: item.product_name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity || 1,
        index: index
      })),
      contents: checkoutData.items.map(item => ({
        id: item.product_id,
        quantity: item.quantity || 1,
        item_price: item.price
      }))
    };

    trackEvent('InitiateCheckout', enhancedCheckoutData, { retry: true });
  }, [trackEvent]);

  // Search tracking
  const trackSearch = useCallback((searchTerm: string, results?: number) => {
    const searchData = {
      search_term: searchTerm,
      number_of_results: results,
      content_type: 'product'
    };

    trackEvent('Search', searchData, { retry: true });
  }, [trackEvent]);

  // Category view tracking
  const trackCategoryView = useCallback((categoryName: string, productsCount?: number) => {
    const categoryData = {
      content_category: categoryName,
      item_list_name: categoryName,
      item_list_id: categoryName.toLowerCase().replace(/\s+/g, '_'),
      num_items: productsCount,
      content_type: 'product_group'
    };

    trackEvent('ViewCategory', categoryData, { retry: true });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackPurchase,
    trackInitiateCheckout,
    trackSearch,
    trackCategoryView
  };
};

export default useEnhancedTracking;