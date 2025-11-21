import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/utils/analytics';

/**
 * Simple Analytics Component
 * 
 * Loads Google Tag Manager and tracks page views.
 * All pixel management is done through GTM dashboard.
 */
export function Analytics() {
  const location = useLocation();

  // Load GTM on mount
  useEffect(() => {
    const gtmId = import.meta.env.VITE_GTM_ID;
    
    if (!gtmId) {
      console.warn('GTM ID not configured. Set VITE_GTM_ID environment variable.');
      return;
    }

    // Check if GTM is already loaded
    if (document.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${gtmId}"]`)) {
      return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Push GTM start event (required for GTM initialization)
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });
    
    // Load GTM script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    
    script.onload = () => {
      console.log('Google Tag Manager loaded successfully');
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Tag Manager');
    };

    document.head.appendChild(script);

    // Add GTM noscript iframe (only once)
    if (!document.querySelector('noscript[data-gtm-noscript]')) {
      const noscript = document.createElement('noscript');
      noscript.setAttribute('data-gtm-noscript', 'true');
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
      iframe.height = '0';
      iframe.width = '0';
      iframe.style.display = 'none';
      iframe.style.visibility = 'hidden';
      noscript.appendChild(iframe);
      document.body.insertBefore(noscript, document.body.firstChild);
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    const path = location.pathname + location.search;
    trackPageView(path);
  }, [location]);

  return null;
}
