/**
 * Helper functions for pixel analytics
 * Provides convenience functions for common tracking scenarios
 */

import { logPixelEvent } from './pixelEventLogger';

/**
 * Log a product page view event
 */
export async function logProductView(
  pixelId: string,
  product: {
    id: string;
    name: string;
    price: number;
    category?: string;
  }
) {
  await logPixelEvent({
    pixel_id: pixelId,
    event_type: 'view_item',
    event_value: product.price,
    product_id: product.id,
    metadata: {
      product_name: product.name,
      category: product.category || 'Products',
    },
  });
}

/**
 * Log an add-to-cart event
 */
export async function logAddToCart(
  pixelId: string,
  product: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }
) {
  await logPixelEvent({
    pixel_id: pixelId,
    event_type: 'add_to_cart',
    event_value: product.price * product.quantity,
    product_id: product.id,
    metadata: {
      product_name: product.name,
      quantity: product.quantity,
      category: product.category || 'Products',
    },
  });
}

/**
 * Log a purchase event
 */
export async function logPurchase(
  pixelId: string,
  order: {
    id: string;
    total: number;
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>;
  }
) {
  await logPixelEvent({
    pixel_id: pixelId,
    event_type: 'purchase',
    event_value: order.total,
    order_id: order.id,
    metadata: {
      items_count: order.items.length,
      items: order.items,
    },
  });
}

/**
 * Log a search event
 */
export async function logSearch(pixelId: string, searchTerm: string, resultCount: number) {
  await logPixelEvent({
    pixel_id: pixelId,
    event_type: 'search',
    metadata: {
      search_term: searchTerm,
      result_count: resultCount,
    },
  });
}

/**
 * Log a custom event
 */
export async function logCustomEvent(
  pixelId: string,
  eventType: string,
  eventValue?: number,
  metadata?: Record<string, any>
) {
  await logPixelEvent({
    pixel_id: pixelId,
    event_type: eventType,
    event_value: eventValue,
    metadata,
  });
}

/**
 * Log multiple pixels simultaneously (batch logging)
 */
export async function logToAllPixels(
  pixelIds: string[],
  event: {
    event_type: string;
    event_value?: number;
    product_id?: string;
    order_id?: string;
    metadata?: Record<string, any>;
  }
) {
  const promises = pixelIds.map(pixelId =>
    logPixelEvent({
      pixel_id: pixelId,
      event_type: event.event_type,
      event_value: event.event_value,
      product_id: event.product_id,
      order_id: event.order_id,
      metadata: event.metadata,
    })
  );

  await Promise.all(promises);
}
