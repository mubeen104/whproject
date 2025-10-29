import { useCallback } from 'react';
import { useEnabledPixels } from './useAdvertisingPixels';
import { trackPixelEvent } from './usePixelPerformance';

/**
 * Modern pixel tracking hook - Unified interface for all advertising pixels
 * Works seamlessly like Shopify's tracking system with performance tracking
 */
export const usePixelTracking = () => {
  const { data: enabledPixels } = useEnabledPixels();

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('pixel_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('pixel_session_id', sessionId);
    }
    return sessionId;
  };

  const trackViewContent = useCallback((productData: {
    product_id: string; // Changed from 'id' to match actual usage (SKU or UUID)
    id?: string; // Backward compatibility
    name: string;
    price: number;
    currency: string;
    category?: string;
    brand?: string;
    availability?: string;
    imageUrl?: string;
  }) => {
    const productId = productData.product_id || productData.id || '';
    const data = {
      content_ids: [productId],
      content_name: productData.name,
      content_type: 'product',
      content_category: productData.category,
      currency: productData.currency,
      value: productData.price,
      item_id: productId,
      item_name: productData.name,
      item_brand: productData.brand,
      price: productData.price,
      availability: productData.availability,
      image_link: productData.imageUrl
    };

    // Google Ads
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

    // Meta Pixel
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

    // TikTok
    if (window.ttq) {
      window.ttq.track('ViewContent', {
        content_id: productId,
        content_name: productData.name,
        content_category: productData.category,
        price: productData.price,
        currency: productData.currency,
        value: productData.price
      });
    }

    // Other pixels
    if (window.twq) window.twq('track', 'ViewContent', data);
    if (window.pintrk) window.pintrk('track', 'pagevisit', data);
    if (window.snaptr) window.snaptr('track', 'VIEW_CONTENT', data);
    if (window.uetq) window.uetq.push('event', 'view_item', data);
    if (window.rdt) window.rdt('track', 'ViewContent', data);
    if (window.qp) window.qp('track', 'ViewContent', data);

    // Track to database
    enabledPixels?.forEach(pixel => {
      trackPixelEvent({
        pixelId: pixel.id,
        eventType: 'view_content',
        eventValue: productData.price,
        currency: productData.currency,
        productId: productId,
        sessionId: getSessionId(),
        metadata: { product_name: productData.name, category: productData.category, brand: productData.brand }
      }).catch(console.error);
    });

    console.info('👁️ Product view tracked:', productData.name);
  }, [enabledPixels]);

  const trackAddToCart = useCallback((productData: {
    product_id: string; // Changed from 'id' to match actual usage (SKU or UUID)
    id?: string; // Backward compatibility
    name: string;
    price: number;
    currency: string;
    quantity: number;
    category?: string;
    brand?: string;
  }) => {
    const productId = productData.product_id || productData.id || '';
    const totalValue = productData.price * productData.quantity;

    // Google Ads
    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: productData.currency,
        value: totalValue,
        items: [{
          item_id: productId,
          item_name: productData.name,
          item_brand: productData.brand,
          item_category: productData.category,
          price: productData.price,
          quantity: productData.quantity
        }]
      });
    }

    // Meta Pixel
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: [productId],
        content_name: productData.name,
        content_type: 'product',
        currency: productData.currency,
        value: totalValue,
        contents: [{
          id: productId,
          quantity: productData.quantity,
          item_price: productData.price
        }]
      });
    }

    // TikTok
    if (window.ttq) {
      window.ttq.track('AddToCart', {
        content_id: productId,
        content_name: productData.name,
        price: productData.price,
        quantity: productData.quantity,
        currency: productData.currency,
        value: totalValue
      });
    }

    // Other pixels
    if (window.twq) window.twq('track', 'AddToCart', { value: totalValue, currency: productData.currency });
    if (window.pintrk) window.pintrk('track', 'addtocart', { value: totalValue, currency: productData.currency, product_id: productId });
    if (window.snaptr) window.snaptr('track', 'ADD_CART', { item_ids: [productId], price: totalValue, currency: productData.currency });
    if (window.uetq) window.uetq.push('event', 'add_to_cart', { ecomm_prodid: productId, ecomm_totalvalue: totalValue });
    if (window.rdt) window.rdt('track', 'AddToCart', { itemCount: productData.quantity, value: totalValue, currency: productData.currency });
    if (window.qp) window.qp('track', 'AddToCart', { value: totalValue, currency: productData.currency });

    // Track to database
    enabledPixels?.forEach(pixel => {
      trackPixelEvent({
        pixelId: pixel.id,
        eventType: 'add_to_cart',
        eventValue: totalValue,
        currency: productData.currency,
        productId: productId,
        sessionId: getSessionId(),
        metadata: { product_name: productData.name, quantity: productData.quantity, category: productData.category, brand: productData.brand }
      }).catch(console.error);
    });

    console.info('🛒 Add to cart tracked:', productData.name, 'x', productData.quantity);
  }, [enabledPixels]);

  const trackInitiateCheckout = useCallback((checkoutData: {
    value: number;
    currency: string;
    items: Array<{
      product_id: string; // Changed from 'id' to match actual usage (SKU or UUID)
      id?: string; // Backward compatibility
      product_name: string; // Changed from 'name'
      name?: string; // Backward compatibility
      price: number;
      quantity: number;
      category?: string;
      brand?: string;
    }>;
  }) => {
    // Google Ads
    if (window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: checkoutData.currency,
        value: checkoutData.value,
        items: checkoutData.items.map(item => ({
          item_id: item.product_id || item.id,
          item_name: item.product_name || item.name,
          item_brand: item.brand,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity
        }))
      });
    }

    // Meta Pixel
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: checkoutData.items.map(i => i.product_id || i.id),
        currency: checkoutData.currency,
        value: checkoutData.value,
        num_items: checkoutData.items.length,
        contents: checkoutData.items.map(i => ({
          id: i.product_id || i.id,
          quantity: i.quantity,
          item_price: i.price
        }))
      });
    }

    // TikTok
    if (window.ttq) {
      window.ttq.track('InitiateCheckout', {
        contents: checkoutData.items.map(i => ({
          content_id: i.product_id || i.id,
          content_name: i.product_name || i.name,
          price: i.price,
          quantity: i.quantity
        })),
        currency: checkoutData.currency,
        value: checkoutData.value
      });
    }

    // Other pixels
    if (window.twq) window.twq('track', 'InitiateCheckout', { value: checkoutData.value, currency: checkoutData.currency });
    if (window.pintrk) window.pintrk('track', 'checkout', { value: checkoutData.value, currency: checkoutData.currency, order_quantity: checkoutData.items.length });
    if (window.snaptr) window.snaptr('track', 'START_CHECKOUT', { price: checkoutData.value, currency: checkoutData.currency });
    if (window.uetq) window.uetq.push('event', 'begin_checkout', { ecomm_totalvalue: checkoutData.value });
    if (window.rdt) window.rdt('track', 'InitiateCheckout', { value: checkoutData.value, currency: checkoutData.currency });
    if (window.qp) window.qp('track', 'InitiateCheckout', { value: checkoutData.value, currency: checkoutData.currency });

    // Track to database
    enabledPixels?.forEach(pixel => {
      trackPixelEvent({
        pixelId: pixel.id,
        eventType: 'initiate_checkout',
        eventValue: checkoutData.value,
        currency: checkoutData.currency,
        sessionId: getSessionId(),
        metadata: { items: checkoutData.items, num_items: checkoutData.items.length }
      }).catch(console.error);
    });

    console.info('💳 Checkout initiated:', checkoutData.value, checkoutData.currency);
  }, [enabledPixels]);

  const trackPurchase = useCallback((orderData: {
    order_id: string; // Changed from 'orderId' to match actual usage
    orderId?: string; // Backward compatibility
    value: number;
    currency: string;
    items: Array<{
      product_id: string; // Changed from 'id' to match actual usage (SKU or UUID)
      id?: string; // Backward compatibility
      product_name: string; // Changed from 'name'
      name?: string; // Backward compatibility
      price: number;
      quantity: number;
      category?: string;
      brand?: string;
    }>;
    shipping?: number;
    tax?: number;
    coupon?: string;
  }) => {
    const orderId = orderData.order_id || orderData.orderId || '';
    // Google Ads
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: orderId,
        currency: orderData.currency,
        value: orderData.value,
        shipping: orderData.shipping || 0,
        tax: orderData.tax || 0,
        coupon: orderData.coupon,
        items: orderData.items.map(item => ({
          item_id: item.product_id || item.id,
          item_name: item.product_name || item.name,
          item_brand: item.brand,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity
        }))
      });
    }

    // Meta Pixel
    if (window.fbq) {
      window.fbq('track', 'Purchase', {
        content_ids: orderData.items.map(i => i.product_id || i.id),
        content_type: 'product',
        currency: orderData.currency,
        value: orderData.value,
        num_items: orderData.items.length,
        contents: orderData.items.map(i => ({
          id: i.product_id || i.id,
          quantity: i.quantity,
          item_price: i.price
        }))
      });
    }

    // TikTok
    if (window.ttq) {
      window.ttq.track('PlaceAnOrder', {
        contents: orderData.items.map(i => ({
          content_id: i.product_id || i.id,
          content_name: i.product_name || i.name,
          price: i.price,
          quantity: i.quantity
        })),
        currency: orderData.currency,
        value: orderData.value
      });
    }

    // Other pixels
    if (window.twq) window.twq('track', 'Purchase', { value: orderData.value, currency: orderData.currency, conversion_id: orderId });
    if (window.pintrk) window.pintrk('track', 'checkout', { value: orderData.value, currency: orderData.currency, order_id: orderId });
    if (window.snaptr) window.snaptr('track', 'PURCHASE', { transaction_id: orderId, price: orderData.value, currency: orderData.currency });
    if (window.uetq) window.uetq.push('event', 'purchase', { revenue_value: orderData.value, currency: orderData.currency });
    if (window.rdt) window.rdt('track', 'Purchase', { transactionId: orderId, value: orderData.value, currency: orderData.currency });
    if (window.qp) window.qp('track', 'Purchase', { value: orderData.value, currency: orderData.currency });

    // Track to database
    enabledPixels?.forEach(pixel => {
      trackPixelEvent({
        pixelId: pixel.id,
        eventType: 'purchase',
        eventValue: orderData.value,
        currency: orderData.currency,
        orderId: orderId,
        sessionId: getSessionId(),
        metadata: { items: orderData.items, shipping: orderData.shipping, tax: orderData.tax, coupon: orderData.coupon, num_items: orderData.items.length }
      }).catch(console.error);
    });

    console.info('💰 Purchase tracked:', orderId, orderData.value, orderData.currency);
  }, [enabledPixels]);

  const trackSearch = useCallback((searchTerm: string, resultsCount?: number) => {
    const data = {
      search_term: searchTerm,
      content_type: 'product',
      number_of_results: resultsCount
    };

    if (window.gtag) window.gtag('event', 'search', { search_term: searchTerm });
    if (window.fbq) window.fbq('track', 'Search', { search_string: searchTerm });
    if (window.ttq) window.ttq.track('Search', { query: searchTerm });
    if (window.pintrk) window.pintrk('track', 'search', { search_query: searchTerm });
    if (window.rdt) window.rdt('track', 'Search');

    // Track to database
    enabledPixels?.forEach(pixel => {
      trackPixelEvent({
        pixelId: pixel.id,
        eventType: 'search',
        sessionId: getSessionId(),
        metadata: { search_term: searchTerm, results_count: resultsCount }
      }).catch(console.error);
    });

    console.info('🔍 Search tracked:', searchTerm);
  }, [enabledPixels]);

  return {
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchase,
    trackSearch
  };
};

export default usePixelTracking;
