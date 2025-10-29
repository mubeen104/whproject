import { useEffect } from 'react';
import { pixelTracking } from '@/components/UnifiedPixelTracker';

/**
 * Custom hook for tracking shop page events
 * Tracks product list views, category views, and search results
 */
export const useShopTracking = (
  products: any[] = [],
  category?: string,
  searchTerm?: string
) => {
  useEffect(() => {
    if (!products || products.length === 0) return;

    // Track product list view
    const productData = products.slice(0, 10).map(product => ({
      id: product.sku || product.id,
      name: product.name,
      price: product.price,
      currency: 'PKR',
      category: product.product_categories?.[0]?.categories?.name || 'Herbal Products',
      brand: 'New Era Herbals'
    }));

    // Track category view if category is selected
    if (category && category !== 'all') {
      console.info('🏷️ Category View:', category, products.length, 'products');
      
      // Track with Meta Pixel - correct format
      if (window.fbq) {
        window.fbq('track', 'ViewContent', {
          content_type: 'product_group',
          content_ids: productData
            .map(p => p.id)
            .filter(id => id && typeof id === 'string'),
          contents: productData
            .map(p => ({
              id: p.id,
              quantity: 1,
              item_price: p.price
            }))
            .filter(item => item.id && !isNaN(item.item_price)),
          num_items: products.length,
          currency: 'PKR',
          value: productData.reduce((sum, p) => sum + p.price, 0)
        });
      }

      // Track with Google Ads
      if (window.gtag) {
        window.gtag('event', 'view_item_list', {
          item_list_name: category,
          currency: 'PKR',
          value: productData.reduce((sum, p) => sum + p.price, 0),
          items: productData.map((p, i) => ({
            item_id: p.id,
            item_name: p.name,
            item_category: p.category,
            price: p.price,
            index: i
          }))
        });
      }
    }

    // Track search if search term is present
    if (searchTerm && searchTerm.trim()) {
      console.info('🔍 Search:', searchTerm, products.length, 'results');
      
      // Track with Meta Pixel - correct format
      if (window.fbq) {
        window.fbq('track', 'Search', {
          search_string: searchTerm,
          content_type: 'product',
          content_ids: productData
            .map(p => p.id)
            .filter(id => id && typeof id === 'string'),
          contents: productData
            .map(p => ({
              id: p.id,
              quantity: 1,
              item_price: p.price
            }))
            .filter(item => item.id && !isNaN(item.item_price)),
          num_items: products.length,
          currency: 'PKR',
          value: productData.reduce((sum, p) => sum + p.price, 0)
        });
      }

      // Track with Google Ads
      if (window.gtag) {
        window.gtag('event', 'search', {
          search_term: searchTerm,
          search_results: products.length
        });
      }
    }

  }, [products, category, searchTerm]);
};
