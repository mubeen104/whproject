import { useQuery } from '@tanstack/react-query';
import { useProducts } from './useProducts';
import { useCategories } from './useCategories';
import { useStoreSettings } from './useStoreSettings';
import { supabase } from '@/integrations/supabase/client';

export type CatalogFormat = 
  | 'meta' 
  | 'google' 
  | 'tiktok' 
  | 'pinterest' 
  | 'snapchat'
  | 'microsoft'
  | 'twitter'
  | 'linkedin'
  | 'generic';

interface CatalogProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  availability: string;
  condition: string;
  brand: string;
  category: string;
  image_url: string;
  additional_images: string[];
  product_url: string;
  sku?: string;
  inventory?: number;
  tags?: string[];
}

export const useCatalogExport = (selectedCategoryIds?: string[]) => {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const settings = useStoreSettings();

  const catalogData = useQuery({
    queryKey: ['catalog-export', products.length, selectedCategoryIds],
    queryFn: async () => {
      const baseUrl = window.location.origin;
      const currency = settings?.currency || 'PKR';
      const brandName = settings?.storeName || 'New Era Herbals';

      // Filter products by selected categories if specified
      let filteredProducts = products;
      if (selectedCategoryIds && selectedCategoryIds.length > 0) {
        filteredProducts = products.filter(product => 
          product.product_categories?.some(pc => 
            selectedCategoryIds.includes(pc.category_id)
          )
        );
      }

      // Fetch all product variants for all products
      const { data: allVariants } = await supabase
        .from('product_variants')
        .select('*')
        .eq('is_active', true);

      const catalogEntries: CatalogProduct[] = [];

      filteredProducts.forEach(product => {
        const mainImage = product.product_images?.find(img => img.sort_order === 0) 
          || product.product_images?.[0];
        const additionalImages = product.product_images
          ?.filter(img => img.sort_order !== 0)
          .map(img => img.image_url) || [];

        const category = product.product_categories?.[0]?.categories?.name || 'Herbal Products';
        
        // Get variants for this product
        const productVariants = allVariants?.filter(v => v.product_id === product.id) || [];

        // If product has variants, create catalog entry for each variant
        if (productVariants.length > 0) {
          productVariants.forEach(variant => {
            catalogEntries.push({
              id: variant.sku || variant.id,
              title: `${product.name} - ${variant.name}`,
              description: variant.description || product.description || product.short_description,
              price: variant.price || product.price,
              currency,
              availability: variant.inventory_quantity > 0 ? 'in stock' : 'out of stock',
              condition: 'new',
              brand: brandName,
              category,
              image_url: mainImage?.image_url || '',
              additional_images: additionalImages,
              product_url: `${baseUrl}/product/${product.slug}`,
              sku: variant.sku,
              inventory: variant.inventory_quantity,
              tags: product.tags
            } as CatalogProduct);
          });
        } else {
          // No variants - create single entry for parent product
          catalogEntries.push({
            id: product.sku || product.id,
            title: product.name,
            description: product.description || product.short_description,
            price: product.price,
            currency,
            availability: product.inventory_quantity > 0 ? 'in stock' : 'out of stock',
            condition: 'new',
            brand: brandName,
            category,
            image_url: mainImage?.image_url || '',
            additional_images: additionalImages,
            product_url: `${baseUrl}/product/${product.slug}`,
            sku: product.sku,
            inventory: product.inventory_quantity,
            tags: product.tags
          } as CatalogProduct);
        }
      });

      return catalogEntries;
    },
    enabled: products.length > 0
  });

  const formatForPlatform = (format: CatalogFormat, data: CatalogProduct[]) => {
    switch (format) {
      case 'meta':
        return formatForMeta(data);
      case 'google':
        return formatForGoogle(data);
      case 'tiktok':
        return formatForTikTok(data);
      case 'pinterest':
        return formatForPinterest(data);
      case 'snapchat':
        return formatForSnapchat(data);
      case 'microsoft':
        return formatForMicrosoft(data);
      case 'twitter':
        return formatForTwitter(data);
      case 'linkedin':
        return formatForLinkedIn(data);
      default:
        return data;
    }
  };

  const exportAsJSON = (format: CatalogFormat = 'generic') => {
    if (!catalogData.data) return null;
    
    const formatted = formatForPlatform(format, catalogData.data);
    const blob = new Blob([JSON.stringify(formatted, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `catalog-${format}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = (format: CatalogFormat = 'generic') => {
    if (!catalogData.data) return null;
    
    const formatted = formatForPlatform(format, catalogData.data);
    const headers = Object.keys(formatted[0] || {});
    const csv = [
      headers.join(','),
      ...formatted.map(row => 
        headers.map(header => {
          const value = (row as any)[header];
          if (Array.isArray(value)) {
            return `"${value.join('|')}"`;
          }
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `catalog-${format}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsXML = (format: CatalogFormat = 'google') => {
    if (!catalogData.data) return null;
    
    const formatted = formatForPlatform(format, catalogData.data);
    const xml = generateXML(formatted, format);
    
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `catalog-${format}-${new Date().toISOString().split('T')[0]}.xml`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    catalogData: catalogData.data || [],
    isLoading: productsLoading || catalogData.isLoading,
    formatForPlatform,
    exportAsJSON,
    exportAsCSV,
    exportAsXML,
    totalProducts: products.length,
    totalCategories: categories.length
  };
};

// Platform-specific formatters
function formatForMeta(data: CatalogProduct[]) {
  return data.map(product => {
    const formattedProduct: any = {
      // Required fields per Meta template
      id: product.sku || product.id,
      title: product.title.substring(0, 200), // Max 200 characters
      description: product.description.substring(0, 9999), // Max 9999 characters
      availability: product.availability === 'in stock' ? 'in stock' : 'out of stock',
      condition: 'new',
      price: `${product.price.toFixed(2)} ${product.currency}`,
      link: product.product_url,
      image_link: product.image_url,
      brand: product.brand.substring(0, 100), // Max 100 characters

      // Optional but recommended fields
      google_product_category: product.category || '',
      fb_product_category: product.category || '',
      quantity_to_sell_on_facebook: product.inventory || 0,
    };

    // Add additional images if available
    if (product.additional_images.length > 0) {
      formattedProduct.additional_image_link = product.additional_images.slice(0, 10).join(',');
    }

    // Add product tags (max 110 chars per tag, 5000 labels per product)
    if (product.tags && product.tags.length > 0) {
      formattedProduct['product_tags[0]'] = product.tags[0]?.substring(0, 110) || '';
      if (product.tags[1]) {
        formattedProduct['product_tags[1]'] = product.tags[1].substring(0, 110);
      }
    }

    // Remove undefined/null/empty values
    return Object.fromEntries(
      Object.entries(formattedProduct).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
  });
}

function formatForGoogle(data: CatalogProduct[]) {
  return data.map(product => ({
    id: product.id,
    title: product.title.substring(0, 150),
    description: product.description.substring(0, 5000),
    link: product.product_url,
    image_link: product.image_url,
    additional_image_link: product.additional_images.slice(0, 10).join(','),
    availability: product.availability,
    price: `${product.price} ${product.currency}`,
    brand: product.brand,
    condition: product.condition,
    google_product_category: product.category,
    product_type: product.category,
    identifier_exists: product.sku ? 'TRUE' : 'FALSE',
    mpn: product.sku || '',
    shipping_weight: '1 kg' // Default value
  }));
}

function formatForTikTok(data: CatalogProduct[]) {
  return data.map(product => ({
    sku_id: product.id,
    title: product.title,
    description: product.description,
    availability: product.availability === 'in stock' ? 'IN_STOCK' : 'OUT_OF_STOCK',
    condition: 'NEW',
    price: product.price,
    link: product.product_url,
    image_link: product.image_url,
    brand: product.brand,
    inventory: product.inventory || 0
  }));
}

function formatForPinterest(data: CatalogProduct[]) {
  return data.map(product => ({
    id: product.id,
    title: product.title,
    description: product.description,
    link: product.product_url,
    image_link: product.image_url,
    additional_image_link: product.additional_images.slice(0, 5).join(','),
    availability: product.availability,
    price: `${product.price} ${product.currency}`,
    brand: product.brand,
    product_type: product.category,
    condition: product.condition
  }));
}

function formatForSnapchat(data: CatalogProduct[]) {
  return data.map(product => ({
    id: product.id,
    title: product.title,
    description: product.description,
    availability: product.availability,
    condition: product.condition,
    price: product.price,
    link: product.product_url,
    image_link: product.image_url,
    brand: product.brand,
    item_group_id: product.category
  }));
}

function formatForMicrosoft(data: CatalogProduct[]) {
  return data.map(product => ({
    id: product.id,
    title: product.title,
    description: product.description,
    link: product.product_url,
    image_link: product.image_url,
    availability: product.availability,
    price: `${product.price} ${product.currency}`,
    brand: product.brand,
    condition: product.condition,
    product_category: product.category
  }));
}

function formatForTwitter(data: CatalogProduct[]) {
  return data.map(product => ({
    id: product.id,
    title: product.title,
    description: product.description,
    availability: product.availability === 'in stock' ? 'available' : 'unavailable',
    price: product.price,
    currency: product.currency,
    link: product.product_url,
    image_url: product.image_url,
    brand: product.brand
  }));
}

function formatForLinkedIn(data: CatalogProduct[]) {
  return data.map(product => ({
    product_id: product.id,
    name: product.title,
    description: product.description,
    url: product.product_url,
    image_url: product.image_url,
    price: product.price,
    currency: product.currency,
    availability: product.availability,
    category: product.category
  }));
}

function generateXML(data: any[], format: CatalogFormat): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  
  if (format === 'google') {
    xml += '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n';
    xml += '  <channel>\n';
    xml += '    <title>Product Feed</title>\n';
    xml += '    <link>' + window.location.origin + '</link>\n';
    xml += '    <description>Product catalog feed</description>\n';
    
    data.forEach(product => {
      xml += '    <item>\n';
      Object.entries(product).forEach(([key, value]) => {
        if (value) {
          xml += `      <g:${key}><![CDATA[${value}]]></g:${key}>\n`;
        }
      });
      xml += '    </item>\n';
    });
    
    xml += '  </channel>\n';
    xml += '</rss>';
  } else {
    xml += '<products>\n';
    data.forEach(product => {
      xml += '  <product>\n';
      Object.entries(product).forEach(([key, value]) => {
        if (value) {
          xml += `    <${key}><![CDATA[${value}]]></${key}>\n`;
        }
      });
      xml += '  </product>\n';
    });
    xml += '</products>';
  }
  
  return xml;
}
