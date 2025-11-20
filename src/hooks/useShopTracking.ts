import { useEffect } from 'react';

export const useShopTracking = (
  products: any[] = [],
  category?: string,
  searchTerm?: string
) => {
  useEffect(() => {
    if (!products || products.length === 0) return;

    const productData = products.slice(0, 10).map(product => ({
      id: product.sku || product.id,
      name: product.name,
      price: product.price,
      currency: 'PKR',
      category: product.product_categories?.[0]?.categories?.name || 'Herbal Products',
      brand: 'New Era Herbals'
    }));

    if (category && category !== 'all') {
      const validProducts = productData.filter(p => p.id && !isNaN(p.price));

      // Use custom event for catalog browsing to avoid conflicts with product ViewContent
      if (window.fbq) {
        window.fbq('trackCustom', 'ViewCategoryProducts', {
          content_type: 'product_group',
          content_category: category,
          num_items: validProducts.length,
          currency: 'PKR'
        });
      }

      if (window.gtag) {
        window.gtag('event', 'view_item_list', {
          item_list_id: category,
          item_list_name: category,
          currency: 'PKR',
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

    if (searchTerm && searchTerm.trim()) {
      const validProducts = productData.filter(p => p.id && !isNaN(p.price));

      if (window.fbq) {
        window.fbq('track', 'Search', {
          search_string: searchTerm,
          content_type: 'product',
          num_items: validProducts.length,
          currency: 'PKR'
        });
      }

      if (window.gtag) {
        window.gtag('event', 'search', {
          search_term: searchTerm,
          search_results: products.length
        });
      }

      // Track view_item_list for search results
      if (window.gtag && validProducts.length > 0) {
        window.gtag('event', 'view_search_results', {
          search_term: searchTerm,
          items: productData.slice(0, 20).map((p, i) => ({
            item_id: p.id,
            item_name: p.name,
            item_category: p.category,
            price: p.price,
            index: i
          }))
        });
      }
    }
  }, [products, category, searchTerm]);
};
