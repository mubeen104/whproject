import { useEffect, useCallback, useRef } from 'react';
import { useEnabledPixels } from '@/hooks/useAdvertisingPixels';
import { useCatalogExport } from '@/hooks/useCatalogExport';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    ttq?: {
      load: (pixelId: string) => void;
      page: () => void;
      track: (event: string, data?: any) => void;
      identify: (data: any) => void;
    };
    _linkedin_partner_id?: string;
    _linkedin_data_partner_ids?: string[];
    lintrk?: (...args: any[]) => void;
    twq?: (...args: any[]) => void;
    pintrk?: (...args: any[]) => void;
    snaptr?: (...args: any[]) => void;
    uetq?: any[];
    rdt?: (...args: any[]) => void;
    qp?: (...args: any[]) => void;
    _pixel_loaded?: { [key: string]: boolean };
    catalogData?: any[];
  }
}

/**
 * UnifiedPixelTracker - Modern e-commerce pixel tracking system
 * Provides complete Shopify-level tracking for all major advertising platforms
 */
export const UnifiedPixelTracker = () => {
  const { data: pixels = [], isLoading } = useEnabledPixels();
  const { catalogData, isLoading: catalogLoading } = useCatalogExport();
  const initRef = useRef(false);

  // Initialize pixel tracking system
  useEffect(() => {
    if (isLoading || initRef.current) return;

    console.info('🚀 Initializing Unified Pixel Tracker...');
    
    // Initialize global objects
    window._pixel_loaded = window._pixel_loaded || {};
    window.dataLayer = window.dataLayer || [];
    
    // Load all enabled pixels
    pixels.forEach(pixel => {
      if (pixel.is_enabled && !window._pixel_loaded?.[pixel.platform]) {
        loadPixel(pixel.platform, pixel.pixel_id);
        window._pixel_loaded![pixel.platform] = true;
      }
    });

    initRef.current = true;

    // Send initial page view after pixels load
    setTimeout(() => {
      sendPageView();
    }, 1500);
  }, [pixels, isLoading]);

  // Sync catalog data with pixels
  useEffect(() => {
    if (catalogLoading || !catalogData || catalogData.length === 0) return;

    // Store catalog globally for easy access
    window.catalogData = catalogData;

    // Sync catalog with all enabled pixels
    console.info('📦 Syncing product catalog with pixels...', catalogData.length, 'products');
    
    pixels.forEach(pixel => {
      if (pixel.is_enabled) {
        syncCatalogToPixel(pixel.platform, catalogData);
      }
    });
  }, [catalogData, catalogLoading, pixels]);

  return null;
};

// ============= PIXEL LOADING FUNCTIONS =============

function loadPixel(platform: string, pixelId: string) {
  switch (platform) {
    case 'google_ads':
      loadGoogleAds(pixelId);
      break;
    case 'meta_pixel':
      loadMetaPixel(pixelId);
      break;
    case 'tiktok_pixel':
      loadTikTok(pixelId);
      break;
    case 'linkedin_insight':
      loadLinkedIn(pixelId);
      break;
    case 'twitter_pixel':
      loadTwitter(pixelId);
      break;
    case 'pinterest_tag':
      loadPinterest(pixelId);
      break;
    case 'snapchat_pixel':
      loadSnapchat(pixelId);
      break;
    case 'microsoft_advertising':
      loadMicrosoft(pixelId);
      break;
    case 'reddit_pixel':
      loadReddit(pixelId);
      break;
    case 'quora_pixel':
      loadQuora(pixelId);
      break;
  }
}

function loadGoogleAds(pixelId: string) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${pixelId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { window.dataLayer!.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', pixelId, {
    send_page_view: true,
    allow_enhanced_conversions: true
  });

  console.info('✅ Google Ads pixel loaded:', pixelId);
}

function loadMetaPixel(pixelId: string) {
  const script = document.createElement('script');
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}', {
      external_id: 'auto',
      fbp: 'auto',
      fbc: 'auto'
    });
  `;
  document.head.appendChild(script);
  console.info('✅ Meta Pixel loaded:', pixelId);
}

function loadTikTok(pixelId: string) {
  const script = document.createElement('script');
  script.innerHTML = `
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load('${pixelId}');
      ttq.page();
    }(window, document, 'ttq');
  `;
  document.head.appendChild(script);
  console.info('✅ TikTok pixel loaded:', pixelId);
}

function loadLinkedIn(pixelId: string) {
  window._linkedin_partner_id = pixelId;
  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  window._linkedin_data_partner_ids.push(pixelId);
  
  const script = document.createElement('script');
  script.innerHTML = `
    (function(l) {
      if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
      window.lintrk.q=[]}
      var s = document.getElementsByTagName("script")[0];
      var b = document.createElement("script");
      b.type = "text/javascript";b.async = true;
      b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
      s.parentNode.insertBefore(b, s);
    })(window.lintrk);
  `;
  document.head.appendChild(script);
  console.info('✅ LinkedIn pixel loaded:', pixelId);
}

function loadTwitter(pixelId: string) {
  const script = document.createElement('script');
  script.innerHTML = `
    !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
    },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
    a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
    twq('config','${pixelId}');
  `;
  document.head.appendChild(script);
  console.info('✅ Twitter pixel loaded:', pixelId);
}

function loadPinterest(pixelId: string) {
  const script = document.createElement('script');
  script.innerHTML = `
    !function(e){if(!window.pintrk){window.pintrk = function () {
    window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
    n=window.pintrk;n.queue=[],n.version="3.0";var
    t=document.createElement("script");t.async=!0,t.src=e;var
    r=document.getElementsByTagName("script")[0];
    r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
    pintrk('load', '${pixelId}');
    pintrk('page');
  `;
  document.head.appendChild(script);
  console.info('✅ Pinterest pixel loaded:', pixelId);
}

function loadSnapchat(pixelId: string) {
  const script = document.createElement('script');
  script.innerHTML = `
    (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
    {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
    a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
    r.src=n;var u=t.getElementsByTagName(s)[0];
    u.parentNode.insertBefore(r,u);})(window,document,
    'https://sc-static.net/scevent.min.js');
    snaptr('init', '${pixelId}');
    snaptr('track', 'PAGE_VIEW');
  `;
  document.head.appendChild(script);
  console.info('✅ Snapchat pixel loaded:', pixelId);
}

function loadMicrosoft(pixelId: string) {
  window.uetq = window.uetq || [];
  const script = document.createElement('script');
  script.src = '//bat.bing.com/bat.js';
  script.async = true;
  document.head.appendChild(script);
  
  window.uetq.push('create', { tid: pixelId });
  window.uetq.push('pageLoad');
  console.info('✅ Microsoft Ads pixel loaded:', pixelId);
}

function loadReddit(pixelId: string) {
  const script = document.createElement('script');
  script.innerHTML = `
    !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
    rdt('init','${pixelId}', {
      optOut: false,
      useDecimalCurrencyValues: true
    });
    rdt('track', 'PageVisit');
  `;
  document.head.appendChild(script);
  console.info('✅ Reddit pixel loaded:', pixelId);
}

function loadQuora(pixelId: string) {
  const script = document.createElement('script');
  script.innerHTML = `
    !function(q,e,v,n,t,s){if(q.qp) return; n=q.qp=function(){n.qp?n.qp.apply(n,arguments):n.queue.push(arguments);}; n.queue=[];t=document.createElement(e);t.async=!0;t.src=v; s=document.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);}(window, 'script', 'https://a.quora.com/qevents.js');
    qp('init', '${pixelId}');
    qp('track', 'ViewContent');
  `;
  document.head.appendChild(script);
  console.info('✅ Quora pixel loaded:', pixelId);
}

// ============= CATALOG SYNC FUNCTIONS =============

function syncCatalogToPixel(platform: string, catalog: any[]) {
  try {
    // CRITICAL: Use SKUs for Meta Pixel catalog matching
    const catalogEvent = {
      content_type: 'product_group',
      content_ids: catalog.map(p => p.sku || p.id), // SKU required for catalog matching
      currency: catalog[0]?.currency || 'PKR',
      value: catalog.reduce((sum, p) => sum + p.price, 0),
      num_items: catalog.length
    };

    switch (platform) {
      case 'meta_pixel':
        if (window.fbq) {
          const validProducts = catalog
            .filter(p => (p.sku || p.id) && !isNaN(parseFloat(p.price)))
            .slice(0, 100);

          if (validProducts.length > 0) {
            window.fbq('track', 'ViewContent', {
              content_type: 'product_group',
              content_ids: validProducts.map(p => String(p.sku || p.id)),
              contents: validProducts.map(p => ({
                id: String(p.sku || p.id),
                quantity: 1,
                item_price: parseFloat(p.price)
              })),
              num_items: validProducts.length,
              currency: catalog[0]?.currency || 'PKR',
              value: validProducts.reduce((sum, p) => sum + parseFloat(p.price), 0)
            });
            console.info('📦 Meta: Catalog synced with SKUs -', validProducts.length, 'products');
          }
        }
        break;

      case 'google_ads':
        if (window.gtag) {
          window.gtag('event', 'view_item_list', {
            ...catalogEvent,
            items: catalog.map((p, i) => ({
              item_id: p.id,
              item_name: p.title,
              item_brand: p.brand,
              item_category: p.category,
              price: p.price,
              index: i
            }))
          });
          console.info('📦 Google: Catalog synced');
        }
        break;

      case 'tiktok_pixel':
        if (window.ttq) {
          window.ttq.track('ViewContent', {
            ...catalogEvent,
            contents: catalog.map(p => ({
              content_id: p.id,
              content_name: p.title,
              content_category: p.category,
              price: p.price,
              brand: p.brand
            }))
          });
          console.info('📦 TikTok: Catalog synced');
        }
        break;

      case 'pinterest_tag':
        if (window.pintrk) {
          window.pintrk('track', 'pagevisit', {
            product_id: catalog.map(p => p.id),
            ...catalogEvent
          });
          console.info('📦 Pinterest: Catalog synced');
        }
        break;

      case 'snapchat_pixel':
        if (window.snaptr) {
          window.snaptr('track', 'VIEW_CONTENT', {
            item_ids: catalog.map(p => p.id),
            ...catalogEvent
          });
          console.info('📦 Snapchat: Catalog synced');
        }
        break;

      case 'microsoft_advertising':
        if (window.uetq) {
          window.uetq.push('event', 'view_item_list', {
            ecomm_prodid: catalog.map(p => p.id),
            ecomm_pagetype: 'category',
            items: catalog.map(p => ({
              id: p.id,
              name: p.title,
              price: p.price
            }))
          });
          console.info('📦 Microsoft: Catalog synced');
        }
        break;

      case 'twitter_pixel':
        if (window.twq) {
          window.twq('track', 'ViewContent', catalogEvent);
          console.info('📦 Twitter: Catalog synced');
        }
        break;

      case 'linkedin_insight':
        if (window.lintrk) {
          window.lintrk('track', { conversion_id: 'catalog_view' });
          console.info('📦 LinkedIn: Catalog synced');
        }
        break;

      case 'reddit_pixel':
        if (window.rdt) {
          window.rdt('track', 'ViewContent', catalogEvent);
          console.info('📦 Reddit: Catalog synced');
        }
        break;

      case 'quora_pixel':
        if (window.qp) {
          window.qp('track', 'ViewContent', catalogEvent);
          console.info('📦 Quora: Catalog synced');
        }
        break;
    }
  } catch (error) {
    console.warn(`Failed to sync catalog with ${platform}:`, error);
  }
}

// ============= EVENT TRACKING FUNCTIONS =============

function sendPageView() {
  const pageData = {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_referrer: document.referrer
  };

  if (window.gtag) window.gtag('event', 'page_view', pageData);
  if (window.fbq) window.fbq('track', 'PageView');
  if (window.ttq) window.ttq.page();
  if (window.twq) window.twq('track', 'PageView');
  if (window.pintrk) window.pintrk('page');
  if (window.snaptr) window.snaptr('track', 'PAGE_VIEW');
  if (window.lintrk) window.lintrk('track', { conversion_id: 'pageview' });
  if (window.uetq) window.uetq.push('event', 'page_view', pageData);
  if (window.rdt) window.rdt('track', 'PageVisit');
  if (window.qp) window.qp('track', 'ViewContent');

  console.info('📄 Page view tracked:', pageData.page_path);
}

// Export tracking functions for use throughout the app
export const pixelTracking = {
  trackViewContent: (productData: {
    id: string; // Should be SKU for Meta Pixel catalog matching
    name: string;
    price: number;
    currency: string;
    category?: string;
    brand?: string;
  }) => {
    const metaData = {
      content_type: 'product',
      content_ids: [productData.id],
      contents: [{
        id: productData.id,
        quantity: 1,
        item_price: productData.price
      }],
      currency: productData.currency,
      value: productData.price
    };

    const googleData = {
      currency: productData.currency,
      value: productData.price,
      items: [{
        item_id: productData.id,
        item_name: productData.name,
        item_brand: productData.brand,
        item_category: productData.category,
        price: productData.price
      }]
    };

    if (window.gtag) window.gtag('event', 'view_item', googleData);
    if (window.fbq) window.fbq('track', 'ViewContent', metaData);
    if (window.ttq) window.ttq.track('ViewContent', metaData);
    if (window.twq) window.twq('track', 'ViewContent', metaData);
    if (window.pintrk) window.pintrk('track', 'pagevisit', metaData);
    if (window.snaptr) window.snaptr('track', 'VIEW_CONTENT', metaData);
    if (window.uetq) window.uetq.push('event', 'view_item', googleData);
    if (window.rdt) window.rdt('track', 'ViewContent', metaData);
    if (window.qp) window.qp('track', 'ViewContent', metaData);
  },

  trackAddToCart: (productData: {
    id: string; // Should be SKU for Meta Pixel catalog matching
    name: string;
    price: number;
    currency: string;
    quantity: number;
    category?: string;
    brand?: string;
  }) => {
    const metaData = {
      content_type: 'product',
      content_ids: [productData.id],
      contents: [{
        id: productData.id,
        quantity: productData.quantity,
        item_price: productData.price
      }],
      currency: productData.currency,
      value: productData.price * productData.quantity
    };

    const googleData = {
      currency: productData.currency,
      value: productData.price * productData.quantity,
      items: [{
        item_id: productData.id,
        item_name: productData.name,
        item_brand: productData.brand,
        item_category: productData.category,
        price: productData.price,
        quantity: productData.quantity
      }]
    };

    if (window.gtag) window.gtag('event', 'add_to_cart', googleData);
    if (window.fbq) window.fbq('track', 'AddToCart', metaData);
    if (window.ttq) window.ttq.track('AddToCart', metaData);
    if (window.twq) window.twq('track', 'AddToCart', metaData);
    if (window.pintrk) window.pintrk('track', 'addtocart', metaData);
    if (window.snaptr) window.snaptr('track', 'ADD_CART', metaData);
    if (window.uetq) window.uetq.push('event', 'add_to_cart', googleData);
    if (window.rdt) window.rdt('track', 'AddToCart', metaData);
    if (window.qp) window.qp('track', 'AddToCart', metaData);
  },

  trackInitiateCheckout: (checkoutData: {
    value: number;
    currency: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      category?: string;
      brand?: string;
    }>;
  }) => {
    const data = {
      content_ids: checkoutData.items.map(i => i.id),
      currency: checkoutData.currency,
      value: checkoutData.value,
      num_items: checkoutData.items.length,
      contents: checkoutData.items.map(i => ({
        id: i.id,
        quantity: i.quantity,
        item_price: i.price
      })),
      items: checkoutData.items.map(i => ({
        item_id: i.id,
        item_name: i.name,
        item_brand: i.brand,
        item_category: i.category,
        price: i.price,
        quantity: i.quantity
      }))
    };

    if (window.gtag) window.gtag('event', 'begin_checkout', data);
    if (window.fbq) window.fbq('track', 'InitiateCheckout', data);
    if (window.ttq) window.ttq.track('InitiateCheckout', data);
    if (window.twq) window.twq('track', 'InitiateCheckout', data);
    if (window.pintrk) window.pintrk('track', 'checkout', data);
    if (window.snaptr) window.snaptr('track', 'START_CHECKOUT', data);
    if (window.uetq) window.uetq.push('event', 'begin_checkout', data);
    if (window.rdt) window.rdt('track', 'InitiateCheckout', data);
    if (window.qp) window.qp('track', 'InitiateCheckout', data);
  },

  trackPurchase: (orderData: {
    orderId: string;
    value: number;
    currency: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      category?: string;
      brand?: string;
    }>;
    shipping?: number;
    tax?: number;
  }) => {
    const data = {
      transaction_id: orderData.orderId,
      currency: orderData.currency,
      value: orderData.value,
      shipping: orderData.shipping || 0,
      tax: orderData.tax || 0,
      content_ids: orderData.items.map(i => i.id),
      contents: orderData.items.map(i => ({
        id: i.id,
        quantity: i.quantity,
        item_price: i.price
      })),
      items: orderData.items.map(i => ({
        item_id: i.id,
        item_name: i.name,
        item_brand: i.brand,
        item_category: i.category,
        price: i.price,
        quantity: i.quantity
      }))
    };

    if (window.gtag) window.gtag('event', 'purchase', data);
    if (window.fbq) window.fbq('track', 'Purchase', data);
    if (window.ttq) window.ttq.track('PlaceAnOrder', data);
    if (window.twq) window.twq('track', 'Purchase', data);
    if (window.pintrk) window.pintrk('track', 'checkout', data);
    if (window.snaptr) window.snaptr('track', 'PURCHASE', data);
    if (window.uetq) window.uetq.push('event', 'purchase', data);
    if (window.rdt) window.rdt('track', 'Purchase', data);
    if (window.qp) window.qp('track', 'Purchase', data);

    console.info('💰 Purchase tracked:', orderData.orderId, orderData.value);
  },

  trackSearch: (searchTerm: string) => {
    const data = {
      search_term: searchTerm,
      content_type: 'product'
    };

    if (window.gtag) window.gtag('event', 'search', data);
    if (window.fbq) window.fbq('track', 'Search', data);
    if (window.ttq) window.ttq.track('Search', data);
    if (window.pintrk) window.pintrk('track', 'search', data);
    if (window.rdt) window.rdt('track', 'Search', data);
  }
};

export default UnifiedPixelTracker;
