import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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
    };
    _linkedin_partner_id?: string;
    lintrk?: (...args: any[]) => void;
    twq?: (...args: any[]) => void;
    pintrk?: (...args: any[]) => void;
    snaptr?: (...args: any[]) => void;
    uetq?: any[];
    rdt?: (...args: any[]) => void;
    qp?: (...args: any[]) => void;
    catalogData?: any[];
  }
}

export const PixelTracker = () => {
  const { data: pixels = [], isLoading } = useEnabledPixels();
  const { catalogData, isLoading: catalogLoading } = useCatalogExport();
  const location = useLocation();
  const initRef = useRef(false);
  const lastPageView = useRef<string>('');

  useEffect(() => {
    if (isLoading || initRef.current) return;

    window.dataLayer = window.dataLayer || [];

    pixels.forEach(pixel => {
      if (pixel.is_enabled) {
        loadPixel(pixel.platform, pixel.pixel_id);
      }
    });

    initRef.current = true;
  }, [pixels, isLoading]);

  useEffect(() => {
    if (catalogLoading || !catalogData || catalogData.length === 0 || !initRef.current) return;

    window.catalogData = catalogData;

    const validProducts = catalogData
      .filter(p => (p.sku || p.id) && typeof p.price === 'number' && !isNaN(p.price))
      .slice(0, 50);

    if (validProducts.length === 0) return;

    setTimeout(() => {
      pixels.forEach(pixel => {
        if (pixel.is_enabled) {
          syncCatalog(pixel.platform, validProducts);
        }
      });
    }, 1000);
  }, [catalogData, catalogLoading, pixels]);

  useEffect(() => {
    if (!initRef.current) return;

    const currentPath = `${location.pathname}${location.search}`;
    if (lastPageView.current === currentPath) return;

    lastPageView.current = currentPath;

    setTimeout(() => {
      trackPageView();
    }, 500);
  }, [location]);

  return null;
};

function loadPixel(platform: string, pixelId: string) {
  try {
    switch (platform) {
      case 'google_ads':
        if (!window.gtag) {
          const script = document.createElement('script');
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${pixelId}`;
          document.head.appendChild(script);

          window.gtag = function() { window.dataLayer!.push(arguments); };
          window.gtag('js', new Date());
          window.gtag('config', pixelId);
        }
        break;

      case 'meta_pixel':
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

          setTimeout(() => {
            if (window.fbq) {
              window.fbq('init', pixelId);
              window.fbq('track', 'PageView');
            }
          }, 100);
        }
        break;

      case 'tiktok_pixel':
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
        break;

      case 'linkedin_insight':
        if (!window._linkedin_partner_id) {
          window._linkedin_partner_id = pixelId;
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
        }
        break;

      case 'twitter_pixel':
        if (!window.twq) {
          const script = document.createElement('script');
          script.innerHTML = `
            !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
            },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
            a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
            twq('config','${pixelId}');
          `;
          document.head.appendChild(script);
        }
        break;

      case 'pinterest_tag':
        if (!window.pintrk) {
          const script = document.createElement('script');
          script.innerHTML = `
            !function(e){if(!window.pintrk){window.pintrk = function () {
            window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
            n=window.pintrk;n.queue=[],n.version="3.0";var
            t=document.createElement("script");t.async=!0,t.src=e;var
            r=document.getElementsByTagName("script")[0];
            r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
            pintrk('load', '${pixelId}');
          `;
          document.head.appendChild(script);
        }
        break;

      case 'snapchat_pixel':
        if (!window.snaptr) {
          const script = document.createElement('script');
          script.innerHTML = `
            (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
            {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
            a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
            r.src=n;var u=t.getElementsByTagName(s)[0];
            u.parentNode.insertBefore(r,u);})(window,document,
            'https://sc-static.net/scevent.min.js');
            snaptr('init', '${pixelId}');
          `;
          document.head.appendChild(script);
        }
        break;

      case 'microsoft_advertising':
        if (!window.uetq) {
          window.uetq = [];
          const script = document.createElement('script');
          script.src = '//bat.bing.com/bat.js';
          script.async = true;
          document.head.appendChild(script);
          window.uetq.push('create', { tid: pixelId });
        }
        break;

      case 'reddit_pixel':
        if (!window.rdt) {
          const script = document.createElement('script');
          script.innerHTML = `
            !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
            rdt('init','${pixelId}');
          `;
          document.head.appendChild(script);
        }
        break;

      case 'quora_pixel':
        if (!window.qp) {
          const script = document.createElement('script');
          script.innerHTML = `
            !function(q,e,v,n,t,s){if(q.qp) return; n=q.qp=function(){n.qp?n.qp.apply(n,arguments):n.queue.push(arguments);}; n.queue=[];t=document.createElement(e);t.async=!0;t.src=v; s=document.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);}(window, 'script', 'https://a.quora.com/qevents.js');
            qp('init', '${pixelId}');
          `;
          document.head.appendChild(script);
        }
        break;
    }
  } catch (error) {
    console.warn(`Failed to load ${platform}:`, error);
  }
}

function syncCatalog(platform: string, products: any[]) {
  try {
    switch (platform) {
      case 'meta_pixel':
        if (window.fbq) {
          window.fbq('track', 'ViewContent', {
            content_type: 'product_group',
            content_ids: products.map(p => String(p.sku || p.id)),
            contents: products.map(p => ({
              id: String(p.sku || p.id),
              quantity: 1,
              item_price: parseFloat(p.price)
            })),
            currency: products[0]?.currency || 'PKR',
            value: products.reduce((sum, p) => sum + parseFloat(p.price), 0)
          });
        }
        break;

      case 'google_ads':
        if (window.gtag) {
          window.gtag('event', 'view_item_list', {
            items: products.map((p, i) => ({
              item_id: p.id,
              item_name: p.title,
              item_brand: p.brand,
              item_category: p.category,
              price: p.price,
              index: i
            }))
          });
        }
        break;

      case 'tiktok_pixel':
        if (window.ttq) {
          window.ttq.track('ViewContent', {
            contents: products.map(p => ({
              content_id: p.id,
              content_name: p.title,
              price: p.price
            }))
          });
        }
        break;
    }
  } catch (error) {
    console.warn(`Catalog sync failed for ${platform}`);
  }
}

function trackPageView() {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname
    });
  }

  if (window.fbq) window.fbq('track', 'PageView');
  if (window.ttq) window.ttq.page();
  if (window.twq) window.twq('track', 'PageView');
  if (window.pintrk) window.pintrk('page');
  if (window.snaptr) window.snaptr('track', 'PAGE_VIEW');
  if (window.lintrk) window.lintrk('track', { conversion_id: 'pageview' });
  if (window.uetq) window.uetq.push('event', 'page_view', {});
  if (window.rdt) window.rdt('track', 'PageVisit');
  if (window.qp) window.qp('track', 'ViewContent');
}

export default PixelTracker;
