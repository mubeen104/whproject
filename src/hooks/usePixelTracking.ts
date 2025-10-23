import { useCallback } from 'react';

/**
 * Modern pixel tracking hook - Unified interface for all advertising pixels
 * Works seamlessly like Shopify's tracking system
 */
export const usePixelTracking = () => {
  
  const trackViewContent = useCallback((productData: {
    id: string;
    name: string;
    price: number;
    currency: string;
    category?: string;
    brand?: string;
    availability?: string;
    imageUrl?: string;
  }) => {
    const data = {
      content_ids: [productData.id],
      content_name: productData.name,
      content_type: 'product',
      content_category: productData.category,
      currency: productData.currency,
      value: productData.price,
      item_id: productData.id,
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
        content_id: productData.id,
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

    console.info('👁️ Product view tracked:', productData.name);
  }, []);

  const trackAddToCart = useCallback((productData: {
    id: string;
    name: string;
    price: number;
    currency: string;
    quantity: number;
    category?: string;
    brand?: string;
  }) => {
    const totalValue = productData.price * productData.quantity;

    // Google Ads
    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: productData.currency,
        value: totalValue,
        items: [{
          item_id: productData.id,
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
        content_ids: [productData.id],
        content_name: productData.name,
        content_type: 'product',
        currency: productData.currency,
        value: totalValue,
        contents: [{
          id: productData.id,
          quantity: productData.quantity,
          item_price: productData.price
        }]
      });
    }

    // TikTok
    if (window.ttq) {
      window.ttq.track('AddToCart', {
        content_id: productData.id,
        content_name: productData.name,
        price: productData.price,
        quantity: productData.quantity,
        currency: productData.currency,
        value: totalValue
      });
    }

    // Other pixels
    if (window.twq) window.twq('track', 'AddToCart', { value: totalValue, currency: productData.currency });
    if (window.pintrk) window.pintrk('track', 'addtocart', { value: totalValue, currency: productData.currency, product_id: productData.id });
    if (window.snaptr) window.snaptr('track', 'ADD_CART', { item_ids: [productData.id], price: totalValue, currency: productData.currency });
    if (window.uetq) window.uetq.push('event', 'add_to_cart', { ecomm_prodid: productData.id, ecomm_totalvalue: totalValue });
    if (window.rdt) window.rdt('track', 'AddToCart', { itemCount: productData.quantity, value: totalValue, currency: productData.currency });
    if (window.qp) window.qp('track', 'AddToCart', { value: totalValue, currency: productData.currency });

    console.info('🛒 Add to cart tracked:', productData.name, 'x', productData.quantity);
  }, []);

  const trackInitiateCheckout = useCallback((checkoutData: {
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
    // Google Ads
    if (window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: checkoutData.currency,
        value: checkoutData.value,
        items: checkoutData.items.map(item => ({
          item_id: item.id,
          item_name: item.name,
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
        content_ids: checkoutData.items.map(i => i.id),
        currency: checkoutData.currency,
        value: checkoutData.value,
        num_items: checkoutData.items.length,
        contents: checkoutData.items.map(i => ({
          id: i.id,
          quantity: i.quantity,
          item_price: i.price
        }))
      });
    }

    // TikTok
    if (window.ttq) {
      window.ttq.track('InitiateCheckout', {
        contents: checkoutData.items.map(i => ({
          content_id: i.id,
          content_name: i.name,
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

    console.info('💳 Checkout initiated:', checkoutData.value, checkoutData.currency);
  }, []);

  const trackPurchase = useCallback((orderData: {
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
    coupon?: string;
  }) => {
    // Google Ads
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: orderData.orderId,
        currency: orderData.currency,
        value: orderData.value,
        shipping: orderData.shipping || 0,
        tax: orderData.tax || 0,
        coupon: orderData.coupon,
        items: orderData.items.map(item => ({
          item_id: item.id,
          item_name: item.name,
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
        content_ids: orderData.items.map(i => i.id),
        content_type: 'product',
        currency: orderData.currency,
        value: orderData.value,
        num_items: orderData.items.length,
        contents: orderData.items.map(i => ({
          id: i.id,
          quantity: i.quantity,
          item_price: i.price
        }))
      });
    }

    // TikTok
    if (window.ttq) {
      window.ttq.track('PlaceAnOrder', {
        contents: orderData.items.map(i => ({
          content_id: i.id,
          content_name: i.name,
          price: i.price,
          quantity: i.quantity
        })),
        currency: orderData.currency,
        value: orderData.value
      });
    }

    // Other pixels
    if (window.twq) window.twq('track', 'Purchase', { value: orderData.value, currency: orderData.currency, conversion_id: orderData.orderId });
    if (window.pintrk) window.pintrk('track', 'checkout', { value: orderData.value, currency: orderData.currency, order_id: orderData.orderId });
    if (window.snaptr) window.snaptr('track', 'PURCHASE', { transaction_id: orderData.orderId, price: orderData.value, currency: orderData.currency });
    if (window.uetq) window.uetq.push('event', 'purchase', { revenue_value: orderData.value, currency: orderData.currency });
    if (window.rdt) window.rdt('track', 'Purchase', { transactionId: orderData.orderId, value: orderData.value, currency: orderData.currency });
    if (window.qp) window.qp('track', 'Purchase', { value: orderData.value, currency: orderData.currency });

    console.info('💰 Purchase tracked:', orderData.orderId, orderData.value, orderData.currency);
  }, []);

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

    console.info('🔍 Search tracked:', searchTerm);
  }, []);

  return {
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    trackPurchase,
    trackSearch
  };
};

export default usePixelTracking;
