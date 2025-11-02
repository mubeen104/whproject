import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  sku: string | null;
  inventory_quantity: number;
  tags: string[] | null;
  product_images?: Array<{
    image_url: string;
    alt_text: string | null;
    sort_order: number;
  }>;
  product_categories?: Array<{
    categories: {
      name: string;
    };
  }>;
}

interface ProductVariant {
  id: string;
  product_id: string;
  sku: string | null;
  name: string;
  description: string | null;
  price: number;
  inventory_quantity: number;
  is_active: boolean;
}

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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Extract feed slug from URL: /catalog-feed/[slug]
    const feedSlug = pathParts[pathParts.length - 1];
    
    if (!feedSlug || feedSlug === 'catalog-feed') {
      return new Response(
        JSON.stringify({ error: 'Feed slug is required. Use format: /catalog-feed/[your-feed-slug]' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client with service role for bypassing RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Fetch feed configuration
    const { data: feed, error: feedError } = await supabaseClient
      .from('catalog_feeds')
      .select('*')
      .eq('feed_url_slug', feedSlug)
      .eq('is_active', true)
      .maybeSingle();

    if (feedError || !feed) {
      return new Response(
        JSON.stringify({ error: 'Feed not found or inactive' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const startTime = Date.now();

    // Fetch products
    let productsQuery = supabaseClient
      .from('products')
      .select(`
        *,
        product_images (
          image_url,
          alt_text,
          sort_order
        ),
        product_categories (
          categories (
            name
          )
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Apply category filter if specified
    const categoryFilter = feed.category_filter as string[];
    if (categoryFilter && categoryFilter.length > 0) {
      // This is a simplified filter - in production, you'd need a more sophisticated join
      // For now, we'll fetch all and filter in memory
    }

    const { data: products, error: productsError } = await productsQuery;

    if (productsError) {
      throw productsError;
    }

    // Fetch product variants if needed
    const { data: variants } = feed.include_variants
      ? await supabaseClient
          .from('product_variants')
          .select('*')
          .eq('is_active', true)
      : { data: null };

    // Generate catalog data
    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('//', '//').split('/')[2] || 'localhost';
    const origin = `https://${baseUrl.split('.')[0]}.com`; // Simplified - adjust for your domain
    const currency = 'PKR'; // TODO: Get from settings
    const brandName = 'New Era Herbals'; // TODO: Get from settings

    const catalogEntries: CatalogProduct[] = [];

    (products as Product[]).forEach((product) => {
      const mainImage = product.product_images?.find((img) => img.sort_order === 0) || product.product_images?.[0];
      const additionalImages = product.product_images
        ?.filter((img) => img.sort_order !== 0)
        .map((img) => img.image_url) || [];
      const category = product.product_categories?.[0]?.categories?.name || 'Herbal Products';

      // Get variants for this product
      const productVariants = variants?.filter((v: ProductVariant) => v.product_id === product.id) || [];

      if (feed.include_variants && productVariants.length > 0) {
        productVariants.forEach((variant: ProductVariant) => {
          catalogEntries.push({
            id: variant.sku || variant.id,
            title: `${product.name} - ${variant.name}`,
            description: variant.description || product.description || product.short_description || '',
            price: variant.price || product.price,
            currency,
            availability: variant.inventory_quantity > 0 ? 'in stock' : 'out of stock',
            condition: 'new',
            brand: brandName,
            category,
            image_url: mainImage?.image_url || '',
            additional_images: additionalImages,
            product_url: `${origin}/product/${product.slug}`,
            sku: variant.sku || undefined,
            inventory: variant.inventory_quantity,
            tags: product.tags || undefined,
          });
        });
      } else {
        catalogEntries.push({
          id: product.sku || product.id,
          title: product.name,
          description: product.description || product.short_description || '',
          price: product.price,
          currency,
          availability: product.inventory_quantity > 0 ? 'in stock' : 'out of stock',
          condition: 'new',
          brand: brandName,
          category,
          image_url: mainImage?.image_url || '',
          additional_images: additionalImages,
          product_url: `${origin}/product/${product.slug}`,
          sku: product.sku || undefined,
          inventory: product.inventory_quantity,
          tags: product.tags || undefined,
        });
      }
    });

    // Format for platform
    const formattedData = formatForPlatform(feed.platform, catalogEntries);
    
    // Generate output based on format
    let output: string;
    let contentType: string;

    switch (feed.format) {
      case 'xml':
        output = generateXML(formattedData, feed.platform, origin);
        contentType = 'application/xml; charset=utf-8';
        break;
      case 'csv':
        output = generateCSV(formattedData);
        contentType = 'text/csv; charset=utf-8';
        break;
      case 'json':
      default:
        output = JSON.stringify(formattedData, null, 2);
        contentType = 'application/json; charset=utf-8';
        break;
    }

    const generationTime = Date.now() - startTime;
    const fileSize = new TextEncoder().encode(output).length;

    // Log generation history (don't await to avoid blocking response)
    supabaseClient
      .from('catalog_feed_history')
      .insert({
        feed_id: feed.id,
        status: 'success',
        product_count: catalogEntries.length,
        generation_time_ms: generationTime,
        file_size_bytes: fileSize,
        validation_errors: [],
      })
      .then(() => {
        // Update feed last_generated_at
        return supabaseClient
          .from('catalog_feeds')
          .update({
            last_generated_at: new Date().toISOString(),
            generation_count: (feed.generation_count || 0) + 1,
            last_error: null,
          })
          .eq('id', feed.id);
      })
      .catch((error) => console.error('Failed to log history:', error));

    // Return feed with caching headers
    return new Response(output, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${feed.cache_duration || 3600}`,
        'X-Product-Count': String(catalogEntries.length),
        'X-Generation-Time-Ms': String(generationTime),
      },
    });
  } catch (error) {
    console.error('Error generating feed:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate feed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Platform-specific formatters
function formatForPlatform(platform: string, data: CatalogProduct[]) {
  switch (platform) {
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
}

function formatForMeta(data: CatalogProduct[]) {
  return data.map((product) => ({
    id: product.sku || product.id,
    title: product.title.substring(0, 150),
    description: product.description.substring(0, 5000),
    availability: product.availability === 'in stock' ? 'in stock' : 'out of stock',
    condition: 'new',
    price: `${product.price} ${product.currency}`,
    link: product.product_url,
    image_link: product.image_url,
    additional_image_link: product.additional_images.slice(0, 10).join(','),
    brand: product.brand,
    mpn: product.sku || '',
    google_product_category: product.category,
    product_type: product.category,
    inventory: product.inventory || 0,
  }));
}

function formatForGoogle(data: CatalogProduct[]) {
  return data.map((product) => ({
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
    shipping_weight: '1 kg',
  }));
}

function formatForTikTok(data: CatalogProduct[]) {
  return data.map((product) => ({
    sku_id: product.id,
    title: product.title,
    description: product.description,
    availability: product.availability === 'in stock' ? 'IN_STOCK' : 'OUT_OF_STOCK',
    condition: 'NEW',
    price: product.price,
    link: product.product_url,
    image_link: product.image_url,
    brand: product.brand,
    inventory: product.inventory || 0,
  }));
}

function formatForPinterest(data: CatalogProduct[]) {
  return data.map((product) => ({
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
    condition: product.condition,
  }));
}

function formatForSnapchat(data: CatalogProduct[]) {
  return data.map((product) => ({
    id: product.id,
    title: product.title,
    description: product.description,
    availability: product.availability,
    condition: product.condition,
    price: product.price,
    link: product.product_url,
    image_link: product.image_url,
    brand: product.brand,
    item_group_id: product.category,
  }));
}

function formatForMicrosoft(data: CatalogProduct[]) {
  return data.map((product) => ({
    id: product.id,
    title: product.title,
    description: product.description,
    link: product.product_url,
    image_link: product.image_url,
    availability: product.availability,
    price: `${product.price} ${product.currency}`,
    brand: product.brand,
    condition: product.condition,
    product_category: product.category,
  }));
}

function formatForTwitter(data: CatalogProduct[]) {
  return data.map((product) => ({
    id: product.id,
    title: product.title,
    description: product.description,
    availability: product.availability === 'in stock' ? 'available' : 'unavailable',
    price: product.price,
    currency: product.currency,
    link: product.product_url,
    image_url: product.image_url,
    brand: product.brand,
  }));
}

function formatForLinkedIn(data: CatalogProduct[]) {
  return data.map((product) => ({
    product_id: product.id,
    name: product.title,
    description: product.description,
    url: product.product_url,
    image_url: product.image_url,
    price: product.price,
    currency: product.currency,
    availability: product.availability,
    category: product.category,
  }));
}

function generateXML(data: any[], platform: string, origin: string): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';

  if (platform === 'google') {
    xml += '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n';
    xml += '  <channel>\n';
    xml += '    <title>Product Feed</title>\n';
    xml += `    <link>${origin}</link>\n`;
    xml += '    <description>Product catalog feed</description>\n';

    data.forEach((product) => {
      xml += '    <item>\n';
      Object.entries(product).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          xml += `      <g:${key}><![CDATA[${value}]]></g:${key}>\n`;
        }
      });
      xml += '    </item>\n';
    });

    xml += '  </channel>\n';
    xml += '</rss>';
  } else {
    xml += '<products>\n';
    data.forEach((product) => {
      xml += '  <product>\n';
      Object.entries(product).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          xml += `    <${key}><![CDATA[${value}]]></${key}>\n`;
        }
      });
      xml += '  </product>\n';
    });
    xml += '</products>';
  }

  return xml;
}

function generateCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (Array.isArray(value)) {
            return `"${value.join('|')}"`;
          }
          return `"${String(value || '').replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  return csv;
}
