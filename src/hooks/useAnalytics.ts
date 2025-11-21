/**
 * Simple Analytics Hook
 * 
 * Provides tracking functions for e-commerce events.
 * All events are sent to GTM dataLayer which handles
 * distribution to configured advertising platforms.
 */

import {
  trackViewContent,
  trackAddToCart,
  trackBeginCheckout,
  trackPurchase,
  trackSearch,
  trackCustomEvent,
} from '@/utils/analytics';

export function useAnalytics() {
  return {
    trackViewContent,
    trackAddToCart,
    trackBeginCheckout,
    trackPurchase,
    trackSearch,
    trackCustomEvent,
  };
}
