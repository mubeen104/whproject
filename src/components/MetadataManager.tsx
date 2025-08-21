import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ProductData {
  id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  images?: string[];
  availability?: string;
}

interface MetadataConfig {
  products?: ProductData[];
  categories?: string[];
  siteInfo?: {
    name: string;
    currency: string;
    language: string;
    country: string;
  };
}

export const MetadataManager = ({ products = [], categories = [], siteInfo }: MetadataConfig) => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize enhanced dataLayer with rich metadata
    const enhancedData = {
      event: 'metadata_update',
      timestamp: new Date().toISOString(),
      page_info: {
        path: location.pathname,
        title: document.title,
        url: window.location.href,
        referrer: document.referrer
      },
      site_metadata: {
        name: siteInfo?.name || 'New Era Herbals',
        currency: siteInfo?.currency || 'PKR', 
        language: siteInfo?.language || 'en-US',
        country: siteInfo?.country || 'PK',
        total_products: products.length,
        total_categories: categories.length
      },
      ecommerce: {
        currency: siteInfo?.currency || 'PKR',
        items: products.map(product => ({
          item_id: product.id,
          item_name: product.name,
          item_category: product.category || 'Herbal Products',
          price: product.price,
          currency: siteInfo?.currency || 'PKR',
          availability: product.availability || 'in_stock'
        }))
      },
      catalog_data: {
        products: products.map(product => ({
          id: product.id,
          title: product.name,
          description: product.description || '',
          price: product.price,
          currency: siteInfo?.currency || 'PKR',
          category: product.category || 'Herbal Products',
          images: product.images || [],
          availability: product.availability || 'in_stock',
          url: `${window.location.origin}/product/${product.id}`
        })),
        categories: categories.map(category => ({
          name: category,
          url: `${window.location.origin}/shop?category=${encodeURIComponent(category)}`
        }))
      }
    };

    // Push to dataLayer if it exists
    if (window.dataLayer) {
      window.dataLayer.push(enhancedData);
      console.info('📊 Enhanced metadata pushed to dataLayer:', enhancedData);
    }

    // Store in window for pixel access
    (window as any).siteMetadata = enhancedData;

    // Trigger custom event for pixels to consume
    window.dispatchEvent(new CustomEvent('metadataReady', { 
      detail: enhancedData 
    }));

  }, [location.pathname, products, categories, siteInfo]);

  // Meta pixel catalog sync
  useEffect(() => {
    if (typeof window === 'undefined' || !window.fbq || products.length === 0) return;

    // Send catalog data to Meta
    const catalogData = {
      content_type: 'product_group',
      contents: products.map(product => ({
        id: product.id,
        quantity: 1,
        item_price: product.price
      })),
      currency: siteInfo?.currency || 'PKR',
      value: products.reduce((sum, p) => sum + p.price, 0)
    };

    try {
      window.fbq('track', 'ViewContent', catalogData);
      console.info('📱 Meta catalog data synced:', catalogData);
    } catch (error) {
      console.warn('Meta catalog sync failed:', error);
    }
  }, [products, siteInfo]);

  // Google Ads enhanced ecommerce
  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag || products.length === 0) return;

    const ecommerceData = {
      currency: siteInfo?.currency || 'PKR',
      value: products.reduce((sum, p) => sum + p.price, 0),
      items: products.map((product, index) => ({
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || 'Herbal Products',
        price: product.price,
        quantity: 1,
        index: index
      }))
    };

    try {
      window.gtag('event', 'view_item_list', {
        ...ecommerceData,
        item_list_name: 'Product Catalog',
        item_list_id: 'catalog_main'
      });
      console.info('🔍 Google Ads enhanced ecommerce data sent:', ecommerceData);
    } catch (error) {
      console.warn('Google Ads ecommerce sync failed:', error);
    }
  }, [products, siteInfo]);

  // TikTok pixel data sync
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ttq || products.length === 0) return;

    const tiktokData = {
      contents: products.map(product => ({
        content_id: product.id,
        content_name: product.name,
        content_category: product.category || 'Herbal Products',
        price: product.price,
        quantity: 1
      })),
      currency: siteInfo?.currency || 'PKR',
      value: products.reduce((sum, p) => sum + p.price, 0)
    };

    try {
      window.ttq.track('ViewContent', tiktokData);
      console.info('🎵 TikTok catalog data synced:', tiktokData);
    } catch (error) {
      console.warn('TikTok catalog sync failed:', error);
    }
  }, [products, siteInfo]);

  return null;
};

export default MetadataManager;