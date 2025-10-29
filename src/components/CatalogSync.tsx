import { useEffect } from 'react';
import { useCatalogExport } from '@/hooks/useCatalogExport';
import { useEnabledPixels } from '@/hooks/useAdvertisingPixels';

/**
 * CatalogSync component - Automatically syncs product catalog with all enabled advertising pixels
 * This provides comprehensive product data to all platforms for dynamic ads and retargeting
 */
export const CatalogSync = () => {
  const { catalogData, isLoading } = useCatalogExport();
  const { data: enabledPixels = [] } = useEnabledPixels();

  useEffect(() => {
    if (isLoading || !catalogData || catalogData.length === 0) return;

    // Store catalog globally for pixel access
    (window as any).catalogData = catalogData;

    // Sync with each enabled pixel platform
    enabledPixels.forEach(pixel => {
      if (!pixel.is_enabled) return;

      try {
        switch (pixel.platform) {
          case 'meta_pixel':
            syncMetaCatalog(catalogData);
            break;
          case 'google_ads':
            syncGoogleCatalog(catalogData);
            break;
          case 'tiktok_pixel':
            syncTikTokCatalog(catalogData);
            break;
          case 'pinterest_tag':
            syncPinterestCatalog(catalogData);
            break;
          case 'snapchat_pixel':
            syncSnapchatCatalog(catalogData);
            break;
          case 'microsoft_advertising':
            syncMicrosoftCatalog(catalogData);
            break;
          case 'twitter_pixel':
            syncTwitterCatalog(catalogData);
            break;
          case 'linkedin_insight':
            syncLinkedInCatalog(catalogData);
            break;
        }
      } catch (error) {
        console.warn(`Failed to sync catalog with ${pixel.platform}:`, error);
      }
    });

    // Push to dataLayer for Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'catalog_loaded',
        ecommerce: {
          currencyCode: catalogData[0]?.currency || 'PKR',
          impressions: catalogData.map((product, index) => ({
            id: product.id,
            name: product.title,
            category: product.category,
            price: product.price,
            position: index + 1
          }))
        }
      });
    }

    console.info('✅ Catalog synced with all enabled pixels:', {
      products: catalogData.length,
      platforms: enabledPixels.map(p => p.platform)
    });

  }, [catalogData, enabledPixels, isLoading]);

  return null;
};

// Platform-specific sync functions

function syncMetaCatalog(products: any[]) {
  if (!window.fbq) return;

  // Limit to top 20 products for efficient catalog sync
  const topProducts = products.slice(0, 20);

  // CRITICAL: Use correct format for Meta Pixel events
  // Only id, quantity, item_price are allowed in contents array
  window.fbq('track', 'ViewContent', {
    content_type: 'product_group',
    content_ids: topProducts
      .map(p => p.sku || p.id)
      .filter(id => id && typeof id === 'string')
      .slice(0, 100),
    contents: topProducts
      .map(product => ({
        id: product.sku || product.id,
        quantity: 1,
        item_price: parseFloat(product.price)
      }))
      .filter(item => item.id && !isNaN(item.item_price)),
    num_items: topProducts.length,
    currency: products[0]?.currency || 'PKR',
    value: topProducts.reduce((sum, p) => sum + parseFloat(p.price), 0)
  });

  console.info('📱 Meta Pixel: Catalog synced with', topProducts.length, 'products (using SKUs)');
}

function syncGoogleCatalog(products: any[]) {
  if (!window.gtag) return;

  window.gtag('event', 'view_item_list', {
    currency: products[0]?.currency || 'PKR',
    value: products.reduce((sum, p) => sum + p.price, 0),
    items: products.map((product, index) => ({
      item_id: product.id,
      item_name: product.title,
      item_category: product.category,
      item_brand: product.brand,
      price: product.price,
      quantity: 1,
      index: index,
      item_list_name: 'Product Catalog'
    }))
  });

  console.info('🔍 Google Ads: Catalog synced with', products.length, 'products');
}

function syncTikTokCatalog(products: any[]) {
  if (!window.ttq) return;

  window.ttq.track('ViewContent', {
    content_type: 'product_group',
    contents: products.map(product => ({
      content_id: product.id,
      content_name: product.title,
      content_category: product.category,
      price: product.price,
      quantity: 1,
      description: product.description,
      image_url: product.image_url,
      brand: product.brand
    })),
    currency: products[0]?.currency || 'PKR',
    value: products.reduce((sum, p) => sum + p.price, 0)
  });

  console.info('🎵 TikTok: Catalog synced with', products.length, 'products');
}

function syncPinterestCatalog(products: any[]) {
  if (!window.pintrk) return;

  window.pintrk('track', 'pagevisit', {
    product_id: products.map(p => p.id),
    product_name: products.map(p => p.title),
    product_category: products.map(p => p.category),
    product_price: products.map(p => p.price),
    product_quantity: products.map(() => 1),
    currency: products[0]?.currency || 'PKR',
    value: products.reduce((sum, p) => sum + p.price, 0)
  });

  console.info('📌 Pinterest: Catalog synced with', products.length, 'products');
}

function syncSnapchatCatalog(products: any[]) {
  if (!window.snaptr) return;

  window.snaptr('track', 'VIEW_CONTENT', {
    item_ids: products.map(p => p.id),
    item_category: products[0]?.category || '',
    currency: products[0]?.currency || 'PKR',
    price: products.reduce((sum, p) => sum + p.price, 0),
    number_items: products.length
  });

  console.info('👻 Snapchat: Catalog synced with', products.length, 'products');
}

function syncMicrosoftCatalog(products: any[]) {
  if (!window.uetq) return;

  window.uetq.push('event', 'view_item_list', {
    ecomm_prodid: products.map(p => p.id),
    ecomm_pagetype: 'category',
    items: products.map(product => ({
      id: product.id,
      name: product.title,
      price: product.price,
      category: product.category
    }))
  });

  console.info('🔷 Microsoft Ads: Catalog synced with', products.length, 'products');
}

function syncTwitterCatalog(products: any[]) {
  if (!window.twq) return;

  window.twq('track', 'ViewContent', {
    content_ids: products.map(p => p.id),
    content_type: 'product_group',
    content_name: 'Product Catalog',
    num_items: products.length,
    value: products.reduce((sum, p) => sum + p.price, 0),
    currency: products[0]?.currency || 'PKR'
  });

  console.info('🐦 Twitter: Catalog synced with', products.length, 'products');
}

function syncLinkedInCatalog(products: any[]) {
  if (!window.lintrk) return;

  products.forEach(product => {
    window.lintrk('track', { 
      conversion_id: 'product_view',
      product_id: product.id,
      product_name: product.title,
      product_category: product.category,
      product_price: product.price
    });
  });

  console.info('💼 LinkedIn: Catalog synced with', products.length, 'products');
}

export default CatalogSync;
