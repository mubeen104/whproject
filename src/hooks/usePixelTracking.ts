import { useCallback } from 'react';
import { useEnabledPixels } from './useAdvertisingPixels';
import { trackPixelEvent } from './usePixelPerformance';
import { eventDeduplication } from '@/utils/eventDeduplication';
import { standardizeProductData } from '@/utils/productIdResolver';
import { useAuth } from '@/contexts/AuthContext';

export const usePixelTracking = () => {
  const { data: enabledPixels } = useEnabledPixels();
  const { user } = useAuth();

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('pixel_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('pixel_session_id', sessionId);
    }
    return sessionId;
  };

  const trackViewContent = useCallback((productData: {
    product_id: string;
    name: string;
    price: number;
    currency: string;
    category?: string;
    brand?: string;
  }) => {
    // Validate input data
    if (!productData.product_id || !productData.name || typeof productData.price !== 'number' || isNaN(productData.price)) {
      console.warn('Invalid product data for ViewContent event:', productData);
      return;
    }

    // Check deduplication
    if (!eventDeduplication.shouldTrack('view_content', productData)) {
      return;
    }

    const data = {
      content_ids: [productData.product_id],
      content_name: productData.name,
      content_type: 'product',
      content_category: productData.category,
      currency: productData.currency,
      value: productData.price,
      item_id: productData.product_id,
      item_name: productData.name,
      item_brand: productData.brand,
      price: productData.price
    };

    try {
      if (window.gtag) {
        window.gtag('event', 'view_item', {
          currency: data.currency,
          value: data.value,
          items: [{
            item_id: data.item_id,
            item_name: data.item_name,
            item_brand: data.item_brand,
            item_category: data.content_category,
            price: data.price
          }]
        });
      }

      if (window.fbq) {
        window.fbq('track', 'ViewContent', {
          content_ids: data.content_ids,
          content_name: data.content_name,
          content_type: data.content_type,
          content_category: data.content_category,
          currency: data.currency,
          value: data.value
        });
      }

      if (window.ttq) {
        window.ttq.track('ViewContent', {
          content_id: productData.product_id,
          content_name: productData.name,
          content_category: productData.category,
          price: productData.price,
          currency: productData.currency,
          value: productData.price
        });
      }

      if (window.twq) window.twq('track', 'ViewContent', data);
      if (window.pintrk) window.pintrk('track', 'pagevisit', data);
      if (window.snaptr) window.snaptr('track', 'VIEW_CONTENT', data);
      if (window.uetq) window.uetq.push('event', 'view_item', data);
      if (window.rdt) window.rdt('track', 'ViewContent', data);
      if (window.qp) window.qp('track', 'ViewContent', data);

      enabledPixels?.forEach(pixel => {
        trackPixelEvent({
          pixelId: pixel.id,
          eventType: 'view_content',
          eventValue: productData.price,
          currency: productData.currency,
          productId: productData.product_id,
          userId: user?.id,
          sessionId: getSessionId(),
          metadata: { product_name: productData.name, category: productData.category, brand: productData.brand }
        }).catch(() => {});
      });
    } catch (error) {
      console.warn('Error tracking ViewContent event:', error);
    }
  }, [enabledPixels]);

  const trackAddToCart = useCallback((productData: {
    product_id: string;
    name: string;
    price: number;
    currency: string;
    quantity: number;
    category?: string;
    brand?: string;
  }) => {
    // Validate input data
    if (!productData.product_id || !productData.name || typeof productData.price !== 'number' || isNaN(productData.price)) {
      console.warn('Invalid product data for AddToCart event:', productData);
      return;
    }

    if (typeof productData.quantity !== 'number' || productData.quantity <= 0) {
      console.warn('Invalid quantity for AddToCart event:', productData.quantity);
      return;
    }

    const totalValue = productData.price * productData.quantity;

    // Check deduplication with a shorter TTL (3 seconds) since users might add same item multiple times
    const originalTTL = 5000;
    eventDeduplication.setTTL(3000);
    const shouldTrack = eventDeduplication.shouldTrack('add_to_cart', productData);
    eventDeduplication.setTTL(originalTTL);

    if (!shouldTrack) {
      return;
    }

    try {
      if (window.gtag) {
        window.gtag('event', 'add_to_cart', {
          currency: productData.currency,
          value: totalValue,
          items: [{
            item_id: productData.product_id,
            item_name: productData.name,
            item_brand: productData.brand,
            item_category: productData.category,
            price: productData.price,
            quantity: productData.quantity
          }]
        });
      }

      if (window.fbq) {
        window.fbq('track', 'AddToCart', {
          content_ids: [productData.product_id],
          content_name: productData.name,
          content_type: 'product',
          currency: productData.currency,
          value: totalValue,
          contents: [{
            id: productData.product_id,
            quantity: productData.quantity,
            item_price: productData.price
          }]
        });
      }

      if (window.ttq) {
        window.ttq.track('AddToCart', {
          content_id: productData.product_id,
          content_name: productData.name,
          price: productData.price,
          quantity: productData.quantity,
          currency: productData.currency,
          value: totalValue
        });
      }

      if (window.twq) window.twq('track', 'AddToCart', { value: totalValue, currency: productData.currency });
      if (window.pintrk) window.pintrk('track', 'addtocart', { value: totalValue, currency: productData.currency });
      if (window.snaptr) window.snaptr('track', 'ADD_CART', { price: totalValue, currency: productData.currency });
      if (window.uetq) window.uetq.push('event', 'add_to_cart', { ecomm_totalvalue: totalValue });
      if (window.rdt) window.rdt('track', 'AddToCart', { value: totalValue, currency: productData.currency });
      if (window.qp) window.qp('track', 'AddToCart', { value: totalValue, currency: productData.currency });

      enabledPixels?.forEach(pixel => {
        trackPixelEvent({
          pixelId: pixel.id,
          eventType: 'add_to_cart',
          eventValue: totalValue,
          currency: productData.currency,
          productId: productData.product_id,
          userId: user?.id,
          sessionId: getSessionId(),
          metadata: { product_name: productData.name, quantity: productData.quantity }
        }).catch(() => {});
      });
    } catch (error) {
      console.warn('Error tracking AddToCart event:', error);
    }
  }, [enabledPixels]);

  const trackInitiateCheckout = useCallback((checkoutData: {
    value: number;
    currency: string;
    items: Array<{
      product_id: string;
      name: string;
      price: number;
      quantity: number;
      category?: string;
      brand?: string;
    }>;
  }) => {
    // Validate input data
    if (typeof checkoutData.value !== 'number' || isNaN(checkoutData.value) || checkoutData.value <= 0) {
      console.warn('Invalid value for InitiateCheckout event:', checkoutData.value);
      return;
    }

    if (!Array.isArray(checkoutData.items) || checkoutData.items.length === 0) {
      console.warn('Invalid or empty items array for InitiateCheckout event:', checkoutData.items);
      return;
    }

    // Validate each item
    const validItems = checkoutData.items.filter(item =>
      item.product_id &&
      item.name &&
      typeof item.price === 'number' &&
      !isNaN(item.price) &&
      typeof item.quantity === 'number' &&
      item.quantity > 0
    );

    if (validItems.length === 0) {
      console.warn('No valid items for InitiateCheckout event');
      return;
    }

    try {
      if (window.gtag) {
        window.gtag('event', 'begin_checkout', {
          currency: checkoutData.currency,
          value: checkoutData.value,
          items: validItems.map(item => ({
            item_id: item.product_id,
            item_name: item.name,
            item_brand: item.brand,
            item_category: item.category,
            price: item.price,
            quantity: item.quantity
          }))
        });
      }

      if (window.fbq) {
        window.fbq('track', 'InitiateCheckout', {
          content_ids: validItems.map(i => i.product_id),
          currency: checkoutData.currency,
          value: checkoutData.value,
          num_items: validItems.length,
          contents: validItems.map(i => ({
            id: i.product_id,
            quantity: i.quantity,
            item_price: i.price
          }))
        });
      }

      if (window.ttq) {
        window.ttq.track('InitiateCheckout', {
          contents: validItems.map(i => ({
            content_id: i.product_id,
            content_name: i.name,
            price: i.price,
            quantity: i.quantity
          })),
          currency: checkoutData.currency,
          value: checkoutData.value
        });
      }

      if (window.twq) window.twq('track', 'InitiateCheckout', { value: checkoutData.value, currency: checkoutData.currency });
      if (window.pintrk) window.pintrk('track', 'checkout', { value: checkoutData.value, currency: checkoutData.currency });
      if (window.snaptr) window.snaptr('track', 'START_CHECKOUT', { price: checkoutData.value, currency: checkoutData.currency });
      if (window.uetq) window.uetq.push('event', 'begin_checkout', { ecomm_totalvalue: checkoutData.value });
      if (window.rdt) window.rdt('track', 'InitiateCheckout', { value: checkoutData.value, currency: checkoutData.currency });
      if (window.qp) window.qp('track', 'InitiateCheckout', { value: checkoutData.value, currency: checkoutData.currency });

      enabledPixels?.forEach(pixel => {
        trackPixelEvent({
          pixelId: pixel.id,
          eventType: 'initiate_checkout',
          eventValue: checkoutData.value,
          currency: checkoutData.currency,
          userId: user?.id,
          sessionId: getSessionId(),
          metadata: { num_items: validItems.length }
        }).catch(() => {});
      });
    } catch (error) {
      console.warn('Error tracking InitiateCheckout event:', error);
    }
  }, [enabledPixels]);

  const trackPurchase = useCallback((orderData: {
    order_id: string;
    value: number;
    currency: string;
    items: Array<{
      product_id: string;
      name: string;
      price: number;
      quantity: number;
      category?: string;
      brand?: string;
    }>;
    shipping?: number;
    tax?: number;
  }) => {
    // Validate input data
    if (!orderData.order_id) {
      console.warn('Missing order_id for Purchase event');
      return;
    }

    if (typeof orderData.value !== 'number' || isNaN(orderData.value) || orderData.value <= 0) {
      console.warn('Invalid value for Purchase event:', orderData.value);
      return;
    }

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      console.warn('Invalid or empty items array for Purchase event:', orderData.items);
      return;
    }

    // Validate each item
    const validItems = orderData.items.filter(item =>
      item.product_id &&
      item.name &&
      typeof item.price === 'number' &&
      !isNaN(item.price) &&
      typeof item.quantity === 'number' &&
      item.quantity > 0
    );

    if (validItems.length === 0) {
      console.warn('No valid items for Purchase event');
      return;
    }

    // Check transaction deduplication - this is critical for purchases
    if (!eventDeduplication.trackPurchase(orderData.order_id, orderData)) {
      console.log(`Purchase event for order ${orderData.order_id} already tracked`);
      return;
    }

    try {
      if (window.gtag) {
        window.gtag('event', 'purchase', {
          transaction_id: orderData.order_id,
          currency: orderData.currency,
          value: orderData.value,
          shipping: orderData.shipping || 0,
          tax: orderData.tax || 0,
          items: validItems.map(item => ({
            item_id: item.product_id,
            item_name: item.name,
            item_brand: item.brand,
            item_category: item.category,
            price: item.price,
            quantity: item.quantity
          }))
        });
      }

      if (window.fbq) {
        window.fbq('track', 'Purchase', {
          content_ids: validItems.map(i => i.product_id),
          content_type: 'product',
          currency: orderData.currency,
          value: orderData.value,
          num_items: validItems.length,
          contents: validItems.map(i => ({
            id: i.product_id,
            quantity: i.quantity,
            item_price: i.price
          }))
        });
      }

      if (window.ttq) {
        window.ttq.track('CompletePayment', {
          contents: validItems.map(i => ({
            content_id: i.product_id,
            content_name: i.name,
            price: i.price,
            quantity: i.quantity
          })),
          content_type: 'product',
          currency: orderData.currency,
          value: orderData.value
        });
      }

      if (window.twq) window.twq('track', 'Purchase', { value: orderData.value, currency: orderData.currency });
      if (window.pintrk) window.pintrk('track', 'checkout', {
        order_id: orderData.order_id,
        value: orderData.value,
        order_quantity: validItems.reduce((sum, i) => sum + i.quantity, 0),
        currency: orderData.currency
      });
      if (window.snaptr) window.snaptr('track', 'PURCHASE', { transaction_id: orderData.order_id, price: orderData.value, currency: orderData.currency });
      if (window.uetq) window.uetq.push('event', 'purchase', { revenue_value: orderData.value, currency: orderData.currency });
      if (window.rdt) window.rdt('track', 'Purchase', { transactionId: orderData.order_id, value: orderData.value, currency: orderData.currency });
      if (window.qp) window.qp('track', 'Purchase', { value: orderData.value, currency: orderData.currency });

      enabledPixels?.forEach(pixel => {
        trackPixelEvent({
          pixelId: pixel.id,
          eventType: 'purchase',
          eventValue: orderData.value,
          currency: orderData.currency,
          orderId: orderData.order_id,
          userId: user?.id,
          sessionId: getSessionId(),
          metadata: { num_items: validItems.length, shipping: orderData.shipping, tax: orderData.tax }
        }).catch(() => {});
      });
    } catch (error) {
      console.warn('Error tracking Purchase event:', error);
    }
  }, [enabledPixels]);

  const trackSearch = useCallback((searchTerm: string) => {
    // Validate input
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
      console.warn('Invalid search term for Search event:', searchTerm);
      return;
    }

    try {
      if (window.gtag) window.gtag('event', 'search', { search_term: searchTerm });
      if (window.fbq) window.fbq('track', 'Search', { search_string: searchTerm });
      if (window.ttq) window.ttq.track('Search', { query: searchTerm });
      if (window.pintrk) window.pintrk('track', 'search', { search_query: searchTerm });
      if (window.rdt) window.rdt('track', 'Search');

      enabledPixels?.forEach(pixel => {
        trackPixelEvent({
          pixelId: pixel.id,
          eventType: 'search',
          userId: user?.id,
          sessionId: getSessionId(),
          metadata: { search_term: searchTerm }
        }).catch(() => {});
      });
    } catch (error) {
      console.warn('Error tracking Search event:', error);
    }
  }, [enabledPixels, user]);

  const trackViewRecommendation = useCallback((productData: {
    product_id: string;
    name: string;
    price: number;
    currency: string;
    source: 'product_page' | 'cart_page';
    recommendation_score?: number;
  }) => {
    if (!productData.product_id || !productData.name) {
      console.warn('Invalid recommendation data for ViewRecommendation event:', productData);
      return;
    }

    const data = {
      content_id: productData.product_id,
      content_name: productData.name,
      currency: productData.currency,
      value: productData.price,
      source: productData.source,
      recommendation_score: productData.recommendation_score
    };

    try {
      if (window.gtag) {
        window.gtag('event', 'view_recommendation', data);
      }

      if (window.fbq) {
        window.fbq('trackCustom', 'ViewRecommendation', data);
      }

      if (window.ttq) {
        window.ttq.track('ViewRecommendation', data);
      }

      enabledPixels?.forEach(pixel => {
        trackPixelEvent({
          pixelId: pixel.id,
          eventType: 'view_recommendation',
          userId: user?.id,
          sessionId: getSessionId(),
          metadata: data
        }).catch(() => {});
      });
    } catch (error) {
      console.warn('Error tracking ViewRecommendation event:', error);
    }
  }, [enabledPixels, user]);

  const trackAddRecommendedToCart = useCallback((productData: {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    currency: string;
    source: 'product_page' | 'cart_page';
  }) => {
    if (!productData.product_id || !productData.name) {
      console.warn('Invalid recommendation data for AddRecommendedToCart event:', productData);
      return;
    }

    const data = {
      content_id: productData.product_id,
      content_name: productData.name,
      currency: productData.currency,
      value: productData.price * productData.quantity,
      quantity: productData.quantity,
      source: productData.source
    };

    try {
      if (window.gtag) {
        window.gtag('event', 'add_recommended_to_cart', data);
      }

      if (window.fbq) {
        window.fbq('trackCustom', 'AddRecommendedToCart', data);
      }

      if (window.ttq) {
        window.ttq.track('AddRecommendedToCart', data);
      }

      enabledPixels?.forEach(pixel => {
        trackPixelEvent({
          pixelId: pixel.id,
          eventType: 'add_recommended_to_cart',
          userId: user?.id,
          sessionId: getSessionId(),
          metadata: data
        }).catch(() => {});
      });
    } catch (error) {
      console.warn('Error tracking AddRecommendedToCart event:', error);
    }
  }, [enabledPixels, user]);

  return {
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchase,
    trackSearch,
    trackViewRecommendation,
    trackAddRecommendedToCart
  };
};

export default usePixelTracking;
