import { useEffect, useCallback, useRef } from 'react';
import { useEnabledPixels } from '@/hooks/useAdvertisingPixels';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    ttq?: {
      load: (pixelId: string) => void;
      page: () => void;
      track: (event: string, data?: any) => void;
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
    _fbq_loaded?: boolean;
    _gtag_loaded?: boolean;
    _ttq_loaded?: boolean;
  }
}

interface PixelLoadState {
  [key: string]: boolean;
}

export const EnhancedPixelTracker = () => {
  const { data: pixels = [], isLoading } = useEnabledPixels();
  const loadedPixels = useRef<PixelLoadState>({});
  const initializationComplete = useRef(false);

  // Initialize global dataLayer first
  const initializeDataLayer = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // Initialize dataLayer if it doesn't exist
    if (!window.dataLayer) {
      window.dataLayer = [];
      console.info('📊 DataLayer initialized');
    }

    // Add default ecommerce data structure
    window.dataLayer.push({
      event: 'dataLayer_initialized',
      ecommerce: {
        currency: 'PKR',
        items: []
      },
      site_info: {
        name: 'New Era Herbals',
        version: '1.0',
        platform: 'React'
      }
    });
  }, []);

  // Enhanced pixel loading with retry mechanism
  const loadPixelWithRetry = useCallback(async (platform: string, pixelId: string, retries = 3) => {
    if (loadedPixels.current[platform]) return;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await loadPixel(platform, pixelId);
        loadedPixels.current[platform] = true;
        console.info(`✅ ${platform} pixel loaded successfully (attempt ${attempt})`);
        break;
      } catch (error) {
        console.warn(`⚠️ ${platform} pixel load failed (attempt ${attempt}):`, error);
        if (attempt === retries) {
          console.error(`❌ ${platform} pixel failed to load after ${retries} attempts`);
        } else {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
  }, []);

  // Load individual pixel with error handling
  const loadPixel = (platform: string, pixelId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      switch (platform) {
        case 'google_ads':
          loadGoogleAdsPixel(pixelId, resolve, reject);
          break;
        case 'meta_pixel':
          loadMetaPixel(pixelId, resolve, reject);
          break;
        case 'tiktok_pixel':
          loadTikTokPixel(pixelId, resolve, reject);
          break;
        case 'linkedin_insight':
          loadLinkedInPixel(pixelId, resolve, reject);
          break;
        case 'twitter_pixel':
          loadTwitterPixel(pixelId, resolve, reject);
          break;
        case 'pinterest_tag':
          loadPinterestPixel(pixelId, resolve, reject);
          break;
        case 'snapchat_pixel':
          loadSnapchatPixel(pixelId, resolve, reject);
          break;
        case 'microsoft_advertising':
          loadMicrosoftPixel(pixelId, resolve, reject);
          break;
        case 'reddit_pixel':
          loadRedditPixel(pixelId, resolve, reject);
          break;
        case 'quora_pixel':
          loadQuoraPixel(pixelId, resolve, reject);
          break;
        default:
          reject(new Error(`Unknown platform: ${platform}`));
      }
    });
  };

  // Main effect to initialize pixels
  useEffect(() => {
    if (isLoading || initializationComplete.current) return;

    // Initialize dataLayer first
    initializeDataLayer();

    // Load all enabled pixels
    const loadAllPixels = async () => {
      console.info('🚀 Loading advertising pixels...', pixels);
      
      // Load pixels in parallel but with individual error handling
      const loadPromises = pixels.map(pixel => 
        loadPixelWithRetry(pixel.platform, pixel.pixel_id)
      );

      await Promise.allSettled(loadPromises);
      
      initializationComplete.current = true;
      console.info('🎯 Pixel initialization complete');

      // Send initial page view after all pixels are loaded
      setTimeout(() => {
        sendEnhancedPageView();
      }, 1000);
    };

    loadAllPixels();
  }, [pixels, isLoading, initializeDataLayer, loadPixelWithRetry]);

  return null;
};

// Enhanced pixel loading functions with proper error handling and callbacks

const loadGoogleAdsPixel = (pixelId: string, onSuccess: () => void, onError: (error: Error) => void) => {
  if (window._gtag_loaded) {
    onSuccess();
    return;
  }

  // Initialize dataLayer first
  window.dataLayer = window.dataLayer || [];
  
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${pixelId}`;
  
  script.onload = () => {
    window.gtag = function() {
      window.dataLayer!.push(arguments);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', pixelId, {
      page_title: document.title,
      page_location: window.location.href,
      send_page_view: true
    });
    
    window._gtag_loaded = true;
    onSuccess();
  };
  
  script.onerror = () => onError(new Error('Failed to load Google Ads script'));
  document.head.appendChild(script);
};

const loadMetaPixel = (pixelId: string, onSuccess: () => void, onError: (error: Error) => void) => {
  if (window._fbq_loaded) {
    onSuccess();
    return;
  }

  try {
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

    // Wait for script to load
    setTimeout(() => {
      if (window.fbq) {
        window.fbq('init', pixelId, {
          em: 'auto', // Enhanced matching
          external_id: 'auto'
        });
        window.fbq('track', 'PageView');
        window._fbq_loaded = true;
        onSuccess();
      } else {
        onError(new Error('Meta Pixel failed to initialize'));
      }
    }, 1000);
  } catch (error) {
    onError(error as Error);
  }
};

const loadTikTokPixel = (pixelId: string, onSuccess: () => void, onError: (error: Error) => void) => {
  if (window._ttq_loaded) {
    onSuccess();
    return;
  }

  try {
    const script = document.createElement('script');
    script.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${pixelId}');
        ttq.page();
      }(window, document, 'ttq');
    `;
    document.head.appendChild(script);
    
    setTimeout(() => {
      if (window.ttq) {
        window._ttq_loaded = true;
        onSuccess();
      } else {
        onError(new Error('TikTok Pixel failed to initialize'));
      }
    }, 1500);
  } catch (error) {
    onError(error as Error);
  }
};

// Continue with other pixel loaders...
const loadLinkedInPixel = (pixelId: string, onSuccess: () => void, onError: (error: Error) => void) => {
  if (window._linkedin_partner_id) {
    onSuccess();
    return;
  }

  try {
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
    
    setTimeout(() => {
      if (window.lintrk) {
        onSuccess();
      } else {
        onError(new Error('LinkedIn Pixel failed to initialize'));
      }
    }, 1000);
  } catch (error) {
    onError(error as Error);
  }
};

const loadTwitterPixel = (pixelId: string, onSuccess: () => void, onError: (error: Error) => void) => {
  if (window.twq) {
    onSuccess();
    return;
  }

  try {
    const script = document.createElement('script');
    script.innerHTML = `
      !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
      },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
      a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
      twq('init','${pixelId}');
      twq('track','PageView');
    `;
    document.head.appendChild(script);
    
    setTimeout(() => {
      if (window.twq) {
        onSuccess();
      } else {
        onError(new Error('Twitter Pixel failed to initialize'));
      }
    }, 1000);
  } catch (error) {
    onError(error as Error);
  }
};

const loadPinterestPixel = (pixelId: string, onSuccess: () => void, onError: (error: Error) => void) => {
  if (window.pintrk) {
    onSuccess();
    return;
  }

  try {
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
    
    setTimeout(() => {
      if (window.pintrk) {
        onSuccess();
      } else {
        onError(new Error('Pinterest Pixel failed to initialize'));
      }
    }, 1000);
  } catch (error) {
    onError(error as Error);
  }
};

const loadSnapchatPixel = (pixelId: string, onSuccess: () => void, onError: (error: Error) => void) => {
  if (window.snaptr) {
    onSuccess();
    return;
  }

  try {
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
    
    setTimeout(() => {
      if (window.snaptr) {
        onSuccess();
      } else {
        onError(new Error('Snapchat Pixel failed to initialize'));
      }
    }, 1000);
  } catch (error) {
    onError(error as Error);
  }
};

const loadMicrosoftPixel = (pixelId: string, onSuccess: () => void, onError: (error: Error) => void) => {
  if (window.uetq && window.uetq.length > 0) {
    onSuccess();
    return;
  }

  try {
    window.uetq = window.uetq || [];
    const script = document.createElement('script');
    script.src = `//bat.bing.com/bat.js`;
    script.async = true;
    
    script.onload = () => {
      window.uetq!.push('create', { tid: pixelId });
      window.uetq!.push('pageLoad');
      onSuccess();
    };
    
    script.onerror = () => onError(new Error('Microsoft Ads script failed to load'));
    document.head.appendChild(script);
  } catch (error) {
    onError(error as Error);
  }
};

const loadRedditPixel = (pixelId: string, onSuccess: () => void, onError: (error: Error) => void) => {
  if (window.rdt) {
    onSuccess();
    return;
  }

  try {
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
    
    setTimeout(() => {
      if (window.rdt) {
        onSuccess();
      } else {
        onError(new Error('Reddit Pixel failed to initialize'));
      }
    }, 1000);
  } catch (error) {
    onError(error as Error);
  }
};

const loadQuoraPixel = (pixelId: string, onSuccess: () => void, onError: (error: Error) => void) => {
  if (window.qp) {
    onSuccess();
    return;
  }

  try {
    const script = document.createElement('script');
    script.innerHTML = `
      !function(q,e,v,n,t,s){if(q.qp) return; n=q.qp=function(){n.qp?n.qp.apply(n,arguments):n.queue.push(arguments);}; n.queue=[];t=document.createElement(e);t.async=!0;t.src=v; s=document.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);}(window, 'script', 'https://a.quora.com/qevents.js');
      qp('init', '${pixelId}');
      qp('track', 'ViewContent');
    `;
    document.head.appendChild(script);
    
    setTimeout(() => {
      if (window.qp) {
        onSuccess();
      } else {
        onError(new Error('Quora Pixel failed to initialize'));
      }
    }, 1000);
  } catch (error) {
    onError(error as Error);
  }
};

// Enhanced page view function with rich metadata
const sendEnhancedPageView = () => {
  const pageData = {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_hostname: window.location.hostname,
    page_referrer: document.referrer,
    user_agent: navigator.userAgent,
    screen_resolution: `${screen.width}x${screen.height}`,
    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language,
    timestamp: new Date().toISOString(),
    site_info: {
      name: 'New Era Herbals',
      category: 'Health & Wellness',
      currency: 'PKR'
    }
  };

  // Send to dataLayer
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'enhanced_page_view',
      ...pageData
    });
  }

  console.info('📊 Enhanced page view sent:', pageData);
};

export default EnhancedPixelTracker;