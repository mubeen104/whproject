import { useEffect } from 'react';
import { useEnabledPixels } from '@/hooks/useAdvertisingPixels';

declare global {
  interface Window {
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
  }
}

export const PixelTracker = () => {
  const { data: pixels = [] } = useEnabledPixels();

  useEffect(() => {
    pixels.forEach((pixel) => {
      switch (pixel.platform) {
        case 'google_ads':
          loadGoogleAdsPixel(pixel.pixel_id);
          break;
        case 'meta_pixel':
          loadMetaPixel(pixel.pixel_id);
          break;
        case 'tiktok_pixel':
          loadTikTokPixel(pixel.pixel_id);
          break;
        case 'linkedin_insight':
          loadLinkedInPixel(pixel.pixel_id);
          break;
        case 'twitter_pixel':
          loadTwitterPixel(pixel.pixel_id);
          break;
        case 'pinterest_tag':
          loadPinterestPixel(pixel.pixel_id);
          break;
        case 'snapchat_pixel':
          loadSnapchatPixel(pixel.pixel_id);
          break;
        case 'microsoft_advertising':
          loadMicrosoftPixel(pixel.pixel_id);
          break;
        case 'reddit_pixel':
          loadRedditPixel(pixel.pixel_id);
          break;
        case 'quora_pixel':
          loadQuoraPixel(pixel.pixel_id);
          break;
      }
    });
  }, [pixels]);

  return null; // This component doesn't render anything
};

const loadGoogleAdsPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  // Load Google Analytics/Ads script if not already loaded
  if (!window.gtag) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${pixelId}`;
    document.head.appendChild(script);

    window.gtag = function() {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', pixelId);
  }
};

const loadMetaPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  // Load Meta Pixel script if not already loaded
  if (!window.fbq) {
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
    `;
    document.head.appendChild(script);

    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }
};

const loadTikTokPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  // Load TikTok Pixel script if not already loaded
  if (!window.ttq) {
    const script = document.createElement('script');
    script.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${pixelId}');
        ttq.page();
      }(window, document, 'ttq');
    `;
    document.head.appendChild(script);
  }
};

const loadLinkedInPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  if (!window._linkedin_partner_id) {
    window._linkedin_partner_id = pixelId;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(pixelId);
    
    const script = document.createElement('script');
    script.type = 'text/javascript';
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
  }
};

const loadTwitterPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  if (!window.twq) {
    const script = document.createElement('script');
    script.innerHTML = `
      !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
      },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
      a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
      twq('init','${pixelId}');
      twq('track','PageView');
    `;
    document.head.appendChild(script);
  }
};

const loadPinterestPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  if (!window.pintrk) {
    const script = document.createElement('script');
    script.innerHTML = `
      !function(e){if(!window.pintrk){window.pintrk = function () {
      window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
      n=window.pintrk;n.queue=[],n.version="3.0";var
      t=document.createElement("script");t.async=!0,t.src=e;var
      r=document.getElementsByTagName("script")[0];
      r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
      pintrk('load', '${pixelId}', {em: '<user_email_address>'});
      pintrk('page');
    `;
    document.head.appendChild(script);
  }
};

const loadSnapchatPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  if (!window.snaptr) {
    const script = document.createElement('script');
    script.innerHTML = `
      (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
      {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
      a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
      r.src=n;var u=t.getElementsByTagName(s)[0];
      u.parentNode.insertBefore(r,u);})(window,document,
      'https://sc-static.net/scevent.min.js');
      snaptr('init', '${pixelId}', {
        'user_email': '__INSERT_USER_EMAIL__'
      });
      snaptr('track', 'PAGE_VIEW');
    `;
    document.head.appendChild(script);
  }
};

const loadMicrosoftPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  if (!window.uetq) {
    window.uetq = window.uetq || [];
    const script = document.createElement('script');
    script.src = `//bat.bing.com/bat.js`;
    script.async = true;
    document.head.appendChild(script);
    
    window.uetq.push('create', { tid: pixelId });
    window.uetq.push('pageLoad');
  }
};

const loadRedditPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  if (!window.rdt) {
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
  }
};

const loadQuoraPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;

  if (!window.qp) {
    const script = document.createElement('script');
    script.innerHTML = `
      !function(q,e,v,n,t,s){if(q.qp) return; n=q.qp=function(){n.qp?n.qp.apply(n,arguments):n.queue.push(arguments);}; n.queue=[];t=document.createElement(e);t.async=!0;t.src=v; s=document.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);}(window, 'script', 'https://a.quora.com/qevents.js');
      qp('init', '${pixelId}');
      qp('track', 'ViewContent');
    `;
    document.head.appendChild(script);
  }
};

// Export functions for tracking events
export const trackEvent = (eventName: string, data?: any) => {
  if (typeof window === 'undefined') return;

  console.info(`Tracking pixel event: ${eventName}`, data);

  // Google Ads - Convert event names to standard Google events
  if (window.gtag) {
    const googleEventMap: { [key: string]: string } = {
      'AddToCart': 'add_to_cart',
      'Purchase': 'purchase',
      'ViewContent': 'page_view',
      'InitiateCheckout': 'begin_checkout',
      'PageView': 'page_view'
    };
    const googleEvent = googleEventMap[eventName] || eventName.toLowerCase();
    window.gtag('event', googleEvent, data);
  }

  // Meta Pixel - Use standard Facebook events
  if (window.fbq) {
    const metaEventMap: { [key: string]: string } = {
      'PageView': 'PageView',
      'ViewContent': 'ViewContent',
      'AddToCart': 'AddToCart',
      'InitiateCheckout': 'InitiateCheckout',
      'Purchase': 'Purchase'
    };
    const metaEvent = metaEventMap[eventName] || eventName;
    window.fbq('track', metaEvent, data);
  }

  // TikTok Pixel
  if (window.ttq) {
    const tiktokEventMap: { [key: string]: string } = {
      'PageView': 'Browse',
      'ViewContent': 'ViewContent',
      'AddToCart': 'AddToCart',
      'InitiateCheckout': 'InitiateCheckout',
      'Purchase': 'PlaceAnOrder'
    };
    const tiktokEvent = tiktokEventMap[eventName] || eventName;
    window.ttq.track(tiktokEvent, data);
  }

  // LinkedIn Insight Tag
  if (window.lintrk) {
    const linkedinEventMap: { [key: string]: string } = {
      'PageView': 'pageview',
      'ViewContent': 'viewcontent',
      'AddToCart': 'addtocart',
      'InitiateCheckout': 'initiatecheckout',
      'Purchase': 'purchase'
    };
    const linkedinEvent = linkedinEventMap[eventName] || eventName.toLowerCase();
    window.lintrk('track', { conversion_id: linkedinEvent });
  }

  // Twitter/X Pixel
  if (window.twq) {
    const twitterEventMap: { [key: string]: string } = {
      'PageView': 'PageView',
      'ViewContent': 'ViewContent',
      'AddToCart': 'AddToCart',
      'InitiateCheckout': 'InitiateCheckout',
      'Purchase': 'Purchase'
    };
    const twitterEvent = twitterEventMap[eventName] || eventName;
    window.twq('track', twitterEvent, data);
  }

  // Pinterest Tag
  if (window.pintrk) {
    const pinterestEventMap: { [key: string]: string } = {
      'PageView': 'pagevisit',
      'ViewContent': 'viewcategory',
      'AddToCart': 'addtocart',
      'InitiateCheckout': 'checkout',
      'Purchase': 'purchase'
    };
    const pinterestEvent = pinterestEventMap[eventName] || eventName.toLowerCase();
    window.pintrk('track', pinterestEvent, data);
  }

  // Snapchat Pixel
  if (window.snaptr) {
    const snapchatEventMap: { [key: string]: string } = {
      'PageView': 'PAGE_VIEW',
      'ViewContent': 'VIEW_CONTENT',
      'AddToCart': 'ADD_CART',
      'InitiateCheckout': 'START_CHECKOUT',
      'Purchase': 'PURCHASE'
    };
    const snapchatEvent = snapchatEventMap[eventName] || eventName.toUpperCase();
    window.snaptr('track', snapchatEvent, data);
  }

  // Microsoft Advertising (Bing)
  if (window.uetq) {
    const microsoftEventMap: { [key: string]: string } = {
      'PageView': 'page_view',
      'ViewContent': 'view_item',
      'AddToCart': 'add_to_cart',
      'InitiateCheckout': 'begin_checkout',
      'Purchase': 'purchase'
    };
    const microsoftEvent = microsoftEventMap[eventName] || eventName.toLowerCase();
    window.uetq.push('event', microsoftEvent, data);
  }

  // Reddit Pixel
  if (window.rdt) {
    const redditEventMap: { [key: string]: string } = {
      'PageView': 'PageVisit',
      'ViewContent': 'ViewContent',
      'AddToCart': 'AddToCart',
      'InitiateCheckout': 'InitiateCheckout',
      'Purchase': 'Purchase'
    };
    const redditEvent = redditEventMap[eventName] || eventName;
    window.rdt('track', redditEvent, data);
  }

  // Quora Pixel
  if (window.qp) {
    const quoraEventMap: { [key: string]: string } = {
      'PageView': 'ViewContent',
      'ViewContent': 'ViewContent',
      'AddToCart': 'AddToCart',
      'InitiateCheckout': 'InitiateCheckout',
      'Purchase': 'Purchase'
    };
    const quoraEvent = quoraEventMap[eventName] || eventName;
    window.qp('track', quoraEvent, data);
  }
};

// Track page views
export const trackPageView = (pageData?: any) => {
  trackEvent('PageView', {
    page_title: document.title,
    page_location: window.location.href,
    ...pageData
  });
};

// Track add to cart
export const trackAddToCart = (productData: { product_id: string; value: number; currency: string; product_name?: string }) => {
  trackEvent('AddToCart', {
    currency: productData.currency,
    value: productData.value,
    content_ids: [productData.product_id],
    content_name: productData.product_name,
    content_type: 'product'
  });
};

// Track purchase
export const trackPurchase = (orderData: { order_id: string; value: number; currency: string; items?: any[] }) => {
  trackEvent('Purchase', {
    currency: orderData.currency,
    value: orderData.value,
    transaction_id: orderData.order_id,
    content_ids: orderData.items?.map(item => item.product_id) || [],
    contents: orderData.items?.map(item => ({
      id: item.product_id,
      quantity: item.quantity,
      item_price: item.price
    })) || []
  });
};

// Track checkout initiation
export const trackInitiateCheckout = (checkoutData: { value: number; currency: string; items?: any[] }) => {
  trackEvent('InitiateCheckout', {
    currency: checkoutData.currency,
    value: checkoutData.value,
    content_ids: checkoutData.items?.map(item => item.product_id) || [],
    num_items: checkoutData.items?.length || 0
  });
};