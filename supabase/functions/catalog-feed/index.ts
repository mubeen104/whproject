import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const feedId = url.searchParams.get("feed_id");
    const format = url.searchParams.get("format") || "csv";

    if (!feedId) {
      return new Response(
        JSON.stringify({ error: "feed_id parameter is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get feed configuration
    const { data: feed, error: feedError } = await supabase
      .from("catalog_feeds")
      .select("*")
      .eq("id", feedId)
      .eq("is_active", true)
      .maybeSingle();

    if (feedError || !feed) {
      return new Response(
        JSON.stringify({ error: "Feed not found or inactive" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch products with all related data
    let query = supabase
      .from("products")
      .select(`
        *,
        product_images (
          image_url,
          sort_order
        ),
        product_categories (
          category_id,
          categories (
            name
          )
        )
      `)
      .eq("is_active", true);

    // Apply category filter if specified
    if (feed.category_filter && Array.isArray(feed.category_filter) && feed.category_filter.length > 0) {
      query = query.in("product_categories.category_id", feed.category_filter);
    }

    const { data: products, error: productsError } = await query;

    if (productsError) {
      throw productsError;
    }

    // Get settings for brand and currency
    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .maybeSingle();

    const baseUrl = supabaseUrl.replace(/\.supabase\.co.*/, ".supabase.co");
    const currency = settings?.currency || "PKR";
    const brandName = settings?.store_name || "New Era Herbals";

    // Fetch all product variants
    const { data: allVariants } = await supabase
      .from("product_variants")
      .select("*")
      .eq("is_active", true);

    const catalogEntries: CatalogProduct[] = [];

    products?.forEach((product) => {
      const mainImage = product.product_images?.find((img: any) => img.sort_order === 0)
        || product.product_images?.[0];

      // Ensure absolute URLs for images
      const imageUrl = mainImage?.image_url
        ? (mainImage.image_url.startsWith('http')
            ? mainImage.image_url
            : `${baseUrl}/storage/v1/object/public/${mainImage.image_url}`)
        : '';

      const additionalImages = product.product_images
        ?.filter((img: any) => img.sort_order !== 0)
        .map((img: any) => img.image_url.startsWith('http')
          ? img.image_url
          : `${baseUrl}/storage/v1/object/public/${img.image_url}`)
        || [];

      const category = product.product_categories?.[0]?.categories?.name || "Herbal Products";

      // Get variants for this product
      const productVariants = allVariants?.filter((v) => v.product_id === product.id) || [];

      // If product has variants, create catalog entry for each variant
      if (productVariants.length > 0) {
        productVariants.forEach((variant) => {
          catalogEntries.push({
            id: variant.sku || variant.id,
            title: `${product.name} - ${variant.name}`,
            description: variant.description || product.description || product.short_description || "",
            price: variant.price || product.price,
            currency,
            availability: variant.inventory_quantity > 0 ? "in stock" : "out of stock",
            condition: "new",
            brand: brandName,
            category,
            image_url: imageUrl,
            additional_images: additionalImages,
            product_url: `${baseUrl}/product/${product.slug}`,
            sku: variant.sku,
            inventory: variant.inventory_quantity,
            tags: product.tags,
          });
        });
      } else {
        // No variants - create single entry for parent product
        catalogEntries.push({
          id: product.sku || product.id,
          title: product.name,
          description: product.description || product.short_description || "",
          price: product.price,
          currency,
          availability: product.inventory_quantity > 0 ? "in stock" : "out of stock",
          condition: "new",
          brand: brandName,
          category,
          image_url: imageUrl,
          additional_images: additionalImages,
          product_url: `${baseUrl}/product/${product.slug}`,
          sku: product.sku,
          inventory: product.inventory_quantity,
          tags: product.tags,
        });
      }
    });

    // Format based on platform
    const formatted = formatForPlatform(feed.platform, catalogEntries);

    // Update feed history
    await supabase.from("catalog_feed_history").insert({
      feed_id: feedId,
      product_count: catalogEntries.length,
      status: "success",
    });

    // Update last generated timestamp
    await supabase
      .from("catalog_feeds")
      .update({ last_generated_at: new Date().toISOString() })
      .eq("id", feedId);

    // Return in requested format
    if (format === "json") {
      return new Response(JSON.stringify(formatted, null, 2), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    } else if (format === "xml") {
      const xml = generateXML(formatted, feed.platform);
      return new Response(xml, {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/xml",
        },
      });
    } else {
      // CSV format (default)
      const csv = generateCSV(formatted);
      return new Response(csv, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv",
        },
      });
    }
  } catch (error) {
    console.error("Catalog feed error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function formatForPlatform(platform: string, data: CatalogProduct[]): any[] {
  switch (platform) {
    case "meta":
      return formatForMeta(data);
    case "google":
      return formatForGoogle(data);
    case "tiktok":
      return formatForTikTok(data);
    case "pinterest":
      return formatForPinterest(data);
    case "snapchat":
      return formatForSnapchat(data);
    case "microsoft":
      return formatForMicrosoft(data);
    case "twitter":
      return formatForTwitter(data);
    case "linkedin":
      return formatForLinkedIn(data);
    default:
      return data;
  }
}

function formatForMeta(data: CatalogProduct[]) {
  return data.map((product) => {
    const formattedProduct: any = {
      id: product.sku || product.id,
      title: product.title.substring(0, 200),
      description: product.description.substring(0, 9999),
      availability: product.availability === "in stock" ? "in stock" : "out of stock",
      condition: "new",
      price: `${product.price.toFixed(2)} ${product.currency}`,
      link: product.product_url,
      image_link: product.image_url,
      brand: product.brand.substring(0, 100),
      google_product_category: product.category || "",
      fb_product_category: product.category || "",
      quantity_to_sell_on_facebook: product.inventory || 0,
    };

    // Add additional images if available (max 10 for Meta)
    if (product.additional_images.length > 0) {
      formattedProduct.additional_image_link = product.additional_images.slice(0, 10).join(",");
    }

    // Add product tags (max 110 chars per tag)
    if (product.tags && product.tags.length > 0) {
      formattedProduct["product_tags[0]"] = product.tags[0]?.substring(0, 110) || "";
      if (product.tags[1]) {
        formattedProduct["product_tags[1]"] = product.tags[1].substring(0, 110);
      }
    }

    // Remove undefined/null/empty values
    return Object.fromEntries(
      Object.entries(formattedProduct).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    );
  });
}

function formatForGoogle(data: CatalogProduct[]) {
  return data.map((product) => ({
    id: product.id,
    title: product.title.substring(0, 150),
    description: product.description.substring(0, 5000),
    link: product.product_url,
    image_link: product.image_url,
    additional_image_link: product.additional_images.slice(0, 10).join(","),
    availability: product.availability,
    price: `${product.price} ${product.currency}`,
    brand: product.brand,
    condition: product.condition,
    google_product_category: product.category,
    product_type: product.category,
    identifier_exists: product.sku ? "TRUE" : "FALSE",
    mpn: product.sku || "",
    shipping_weight: "1 kg",
  }));
}

function formatForTikTok(data: CatalogProduct[]) {
  return data.map((product) => ({
    sku_id: product.id,
    title: product.title,
    description: product.description,
    availability: product.availability === "in stock" ? "IN_STOCK" : "OUT_OF_STOCK",
    condition: "NEW",
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
    additional_image_link: product.additional_images.slice(0, 5).join(","),
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
    availability: product.availability === "in stock" ? "available" : "unavailable",
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

function generateCSV(data: any[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return "";
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        })
        .join(",")
    ),
  ].join("\n");

  return csv;
}

function generateXML(data: any[], platform: string): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';

  if (platform === "google") {
    xml += '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n';
    xml += "  <channel>\n";
    xml += "    <title>Product Feed</title>\n";
    xml += "    <link>" + Deno.env.get("SUPABASE_URL") + "</link>\n";
    xml += "    <description>Product catalog feed</description>\n";

    data.forEach((product) => {
      xml += "    <item>\n";
      Object.entries(product).forEach(([key, value]) => {
        if (value) {
          xml += `      <g:${key}><![CDATA[${value}]]></g:${key}>\n`;
        }
      });
      xml += "    </item>\n";
    });

    xml += "  </channel>\n";
    xml += "</rss>";
  } else {
    xml += "<products>\n";
    data.forEach((product) => {
      xml += "  <product>\n";
      Object.entries(product).forEach(([key, value]) => {
        if (value) {
          xml += `    <${key}><![CDATA[${value}]]></${key}>\n`;
        }
      });
      xml += "  </product>\n";
    });
    xml += "</products>";
  }

  return xml;
}
