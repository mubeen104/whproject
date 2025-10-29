import { Helmet } from 'react-helmet-async';
import { Product } from '@/hooks/useProducts';

interface ProductSchemaProps {
  product: Product;
  reviews?: any[];
  selectedVariant?: any;
}

export const ProductSchema = ({ product, reviews, selectedVariant }: ProductSchemaProps) => {
  const getCurrentPrice = () => selectedVariant?.price || product.price;
  const averageRating = reviews && reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || product.short_description,
    "image": product.product_images?.map(img => img.image_url) || ["/logo.png"],
    "sku": product.sku || product.id,
    "brand": {
      "@type": "Brand",
      "name": "New Era Herbals"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.neweraherbals.com/product/${product.id}`,
      "priceCurrency": "PKR",
      "price": getCurrentPrice(),
      "availability": (product.inventory_quantity || 0) > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "New Era Herbals"
      }
    },
    ...(reviews && reviews.length > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": averageRating.toFixed(1),
        "reviewCount": reviews.length,
        "bestRating": "5",
        "worstRating": "1"
      }
    }),
    ...(reviews && reviews.length > 0 && {
      "review": reviews.slice(0, 5).map(review => ({
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating,
          "bestRating": "5",
          "worstRating": "1"
        },
        "author": {
          "@type": "Person",
          "name": "Anonymous User"
        },
        "reviewBody": review.comment,
        "datePublished": review.created_at
      }))
    })
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.neweraherbals.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shop",
        "item": "https://www.neweraherbals.com/shop"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `https://www.neweraherbals.com/product/${product.id}`
      }
    ]
  };

  return (
    <Helmet>
      <title>{product.name} | Premium Organic Herbal Products | New Era Herbals</title>
      <meta name="description" content={product.description || product.short_description || `Buy ${product.name} - Premium organic herbal products and natural wellness solutions`} />
      {product.keywords && product.keywords.length > 0 && (
        <meta name="keywords" content={product.keywords.join(', ')} />
      )}
      <link rel="canonical" href={`https://www.neweraherbals.com/product/${product.id}`} />
      
      {/* Open Graph */}
      <meta property="og:type" content="product" />
      <meta property="og:url" content={`https://www.neweraherbals.com/product/${product.id}`} />
      <meta property="og:title" content={`${product.name} | New Era Herbals`} />
      <meta property="og:description" content={product.description || product.short_description || ''} />
      <meta property="og:image" content={product.product_images?.[0]?.image_url || '/logo.png'} />
      <meta property="product:price:amount" content={getCurrentPrice().toString()} />
      <meta property="product:price:currency" content="PKR" />
      <meta property="product:availability" content={(product.inventory_quantity || 0) > 0 ? "in stock" : "out of stock"} />
      <meta property="product:brand" content="New Era Herbals" />
      <meta property="product:category" content={product.product_categories?.[0]?.categories?.name || "Herbal Products"} />
      <meta property="product:retailer_item_id" content={selectedVariant?.sku || product.sku || product.id} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={product.name} />
      <meta name="twitter:description" content={product.short_description || ''} />
      <meta name="twitter:image" content={product.product_images?.[0]?.image_url || '/logo.png'} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbData)}
      </script>
    </Helmet>
  );
};
