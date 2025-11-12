import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProductVariants, ProductVariant } from '@/hooks/useProductVariants';
import { ProductVariantSelector } from '@/components/ProductVariantSelector';
import { ProductSchema } from '@/components/ProductSchema';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGuestCart } from '@/hooks/useGuestCart';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/hooks/useProducts';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ProductImageZoom } from '@/components/ProductImageZoom';
import { usePixelTracking } from '@/hooks/usePixelTracking';
import { Minus, Plus, Star, Truck, Shield, RotateCcw } from 'lucide-react';
const useProduct = (slugOrId: string) => {
  return useQuery({
    queryKey: ['product', slugOrId],
    queryFn: async (): Promise<Product> => {
      // Try to fetch by slug first, fall back to ID for backward compatibility
      let query = supabase.from('products').select(`
          *,
          product_images (
            id,
            image_url,
            alt_text,
            sort_order
          ),
          product_categories (
            category_id,
            categories (
              id,
              name,
              slug
            )
          )
        `).eq('is_active', true);

      // Check if slugOrId looks like a UUID (contains hyphens and is 36 chars)
      const isUUID = slugOrId.length === 36 && slugOrId.includes('-');

      if (isUUID) {
        query = query.eq('id', slugOrId);
      } else {
        query = query.eq('slug', slugOrId);
      }

      const { data, error } = await query.single();

      if (error) {
        throw error;
      }
      return data;
    }
  });
};
const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('reviews').select(`
        *,
        profiles (
          first_name,
          last_name
        )
      `).eq('product_id', productId).eq('is_approved', true).order('created_at', {
        ascending: false
      });
      if (error) {
        throw error;
      }
      return data;
    }
  });
};
const ProductDetail = () => {
  const {
    slug
  } = useParams<{
    slug: string;
  }>();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    addToCart
  } = useGuestCart();
  const {
    currency,
    freeShippingThreshold
  } = useStoreSettings();
  const { trackViewContent, trackAddToCart } = usePixelTracking();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const {
    data: product,
    isLoading,
    error
  } = useProduct(slug!);
  const {
    data: reviews
  } = useProductReviews(product?.id!);
  const {
    data: variants
  } = useProductVariants(product?.id!);

  // Track product view when product loads
  useEffect(() => {
    if (product) {
      const mainImage = product.product_images?.[0]?.image_url || '/logo.png';
      const categoryName = product.product_categories?.[0]?.categories?.name || '';
      trackViewContent({
        product_id: selectedVariant?.sku || product.sku || product.id, // Priority: variant SKU → parent SKU → UUID
        name: product.name,
        price: selectedVariant?.price || product.price,
        currency: currency === 'Rs' ? 'PKR' : 'USD',
        category: categoryName,
        brand: 'New Era Herbals',
        availability: (selectedVariant?.inventory_quantity || product.inventory_quantity || 0) > 0 ? 'in stock' : 'out of stock',
        imageUrl: mainImage
      });
    }
  }, [product, selectedVariant, currency, trackViewContent]);
  if (isLoading) {
    return <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-muted rounded-lg h-96"></div>
              <div className="space-y-4">
                <div className="bg-muted rounded h-8 w-3/4"></div>
                <div className="bg-muted rounded h-6 w-1/2"></div>
                <div className="bg-muted rounded h-20 w-full"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>;
  }
  if (error || !product) {
    return <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h2>
              <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>;
  }
  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity, selectedVariant?.id);
      const displayName = selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name;
      const categoryName = product.product_categories?.[0]?.categories?.name || '';
      
      // Track add to cart event with SKU for Meta Pixel catalog matching
      trackAddToCart({
        product_id: selectedVariant?.sku || product.sku || product.id, // Priority: variant SKU → parent SKU → UUID
        name: product.name,
        price: selectedVariant?.price || product.price,
        currency: currency === 'Rs' ? 'PKR' : 'USD',
        quantity,
        category: categoryName,
        brand: 'New Era Herbals'
      });
      
      toast({
        title: "Added to cart",
        description: `${quantity} x ${displayName} added to your cart.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleBuyNow = () => {
    // Create direct checkout URL with product parameters
    const currentPrice = selectedVariant?.price || product.price;
    const searchParams = new URLSearchParams({
      directProduct: 'true',
      productId: product.id,
      quantity: quantity.toString(),
      price: currentPrice.toString(),
      ...(selectedVariant && { variantId: selectedVariant.id })
    });
    
    navigate(`/checkout?${searchParams.toString()}`);
  };
  const getMainImage = () => {
    // Use variant images if variant is selected and has images
    if (selectedVariant?.product_variant_images && selectedVariant.product_variant_images.length > 0) {
      const sortedImages = [...selectedVariant.product_variant_images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      return sortedImages[selectedImage]?.image_url || sortedImages[0]?.image_url;
    }

    // Fall back to product images
    if (product.product_images && product.product_images.length > 0) {
      const sortedImages = [...product.product_images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      return sortedImages[selectedImage]?.image_url || sortedImages[0]?.image_url;
    }
    return '/logo.png';
  };
  const getCurrentImages = () => {
    if (selectedVariant?.product_variant_images && selectedVariant.product_variant_images.length > 0) {
      return selectedVariant.product_variant_images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }
    return product.product_images?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)) || [];
  };
  const getCurrentPrice = () => selectedVariant?.price || product.price;
  const getCurrentComparePrice = () => selectedVariant?.compare_price || product.compare_price;
  const getCurrentInventory = () => selectedVariant?.inventory_quantity || product.inventory_quantity;
  const averageRating = reviews && reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  return (
    <>
      <ProductSchema product={product} reviews={reviews} selectedVariant={selectedVariant} />
      
      <div className="min-h-screen bg-background" itemScope itemType="https://schema.org/Product">
        <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Enhanced microdata for Meta Pixel auto-catalog sync */}
        <meta itemProp="sku" content={product.sku || product.id} />
        <meta itemProp="name" content={product.name} />
        <meta itemProp="description" content={product.description || product.short_description || ''} />
        <meta itemProp="image" content={product.product_images?.[0]?.image_url || '/logo.png'} />
        <meta itemProp="productID" content={product.sku || product.id} />
        <link itemProp="url" href={`https://www.neweraherbals.com/product/${product.slug || product.id}`} />
        
        {/* Open Graph for Meta Pixel */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description || product.short_description || ''} />
        <meta property="og:image" content={product.product_images?.[0]?.image_url || '/logo.png'} />
        <meta property="og:url" content={`https://www.neweraherbals.com/product/${product.slug || product.id}`} />
        <meta property="product:price:amount" content={getCurrentPrice().toString()} />
        <meta property="product:price:currency" content="USD" />
        <meta property="product:availability" content={(getCurrentInventory() || 0) > 0 ? "in stock" : "out of stock"} />
        <meta property="product:condition" content="new" />
        <meta property="product:brand" content="New Era Herbals" />
        <meta property="product:retailer_item_id" content={product.sku || product.id} />
        
        <div itemProp="brand" itemScope itemType="https://schema.org/Brand">
          <meta itemProp="name" content="New Era Herbals" />
        </div>
        <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <meta itemProp="priceCurrency" content="USD" />
          <meta itemProp="price" content={getCurrentPrice().toString()} />
          <link itemProp="availability" href={(getCurrentInventory() || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
          <link itemProp="url" href={`https://www.neweraherbals.com/product/${product.slug || product.id}`} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <ProductImageZoom src={getMainImage()} alt={product.name} className="aspect-square rounded-lg bg-muted" />
            {getCurrentImages().length > 1 && <div className="flex space-x-2 overflow-x-auto">
                {getCurrentImages().map((image, index) => <button key={image.id} onClick={() => setSelectedImage(index)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-primary' : 'border-border'}`}>
                       <img src={image.image_url} alt={image.alt_text || product.name} className="w-full h-full object-contain" />
                    </button>)}
              </div>}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name} - Premium Organic Herbal Product</h1>
              {selectedVariant && <p className="text-lg text-muted-foreground">
                  Variant: {selectedVariant.name}
                </p>}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                 <span className="text-3xl font-bold text-primary">{currency} {getCurrentPrice().toFixed(2)}</span>
                 {getCurrentComparePrice() && getCurrentComparePrice() > getCurrentPrice() && <span className="text-xl text-muted-foreground line-through">
                     {currency} {getCurrentComparePrice().toFixed(2)}
                   </span>}
              </div>
              {averageRating > 0 && <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.floor(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />)}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({reviews?.length || 0} reviews)
                  </span>
                </div>}
            </div>

            {/* Variant Selector */}
            {variants && variants.length > 0 && <ProductVariantSelector variants={variants} selectedVariant={selectedVariant} onVariantChange={variant => {
            setSelectedVariant(variant);
            setSelectedImage(0); // Reset image selection when variant changes
          }} />}

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Product Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {selectedVariant?.description || product.description || product.short_description}
              </p>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <Button variant="ghost" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 text-foreground font-medium">{quantity}</span>
                  <Button variant="ghost" size="sm" onClick={() => setQuantity(quantity + 1)} disabled={quantity >= (getCurrentInventory() || 0)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={handleAddToCart} disabled={(getCurrentInventory() || 0) <= 0} className="flex-1" variant="outline">
                  {(getCurrentInventory() || 0) > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button onClick={handleBuyNow} disabled={(getCurrentInventory() || 0) <= 0} className="flex-1">
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 pt-6 border-t border-border">
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Truck className="w-5 h-5" />
                <span>Free shipping on orders over {currency} {freeShippingThreshold.toFixed(0)}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Shield className="w-5 h-5" />
                <span>Secure payment & data protection</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                
                
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Tabs */}
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="features" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Key Features & Benefits</h3>
                {product.features ? <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.features}
                    </p>
                  </div> : <p className="text-muted-foreground italic">No features information available.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ingredients" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Natural Ingredients</h3>
                {product.ingredients ? <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.ingredients}
                    </p>
                  </div> : <p className="text-muted-foreground italic">No ingredients information available.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Usage Instructions & Dosage</h3>
                {product.usage_instructions ? <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.usage_instructions}
                    </p>
                  </div> : <p className="text-muted-foreground italic">No usage instructions available.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Product Specifications</h3>
                    <dl className="space-y-2">
                      {product.sku && <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">SKU:</dt>
                          <dd className="text-sm text-foreground">{product.sku}</dd>
                        </div>}
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Availability:</dt>
                        <dd className="text-sm text-foreground">
                          {(getCurrentInventory() || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Shipping & Return Policy</h3>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>• Free standard shipping on orders over {currency} {freeShippingThreshold.toFixed(0)}</p>
                      <p>• Express shipping available at checkout</p>
                      <p>• 7-Day return policy</p>
                      <p>• Returns must be in original condition</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Reviews Section */}
        <div className="mt-8 space-y-6">
          {/* Write Review Form */}
          <ReviewForm productId={product.id} />
          
          {/* Existing Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews ({reviews?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews && reviews.length > 0 ? <div className="space-y-6">
                  {reviews.map(review => <div key={review.id} className="border-b border-border pb-6 last:border-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-foreground">
                          {review.profiles?.first_name && review.profiles?.last_name
                            ? `${review.profiles.first_name} ${review.profiles.last_name}`
                            : 'Anonymous User'}
                        </span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />)}
                        </div>
                      </div>
                      {review.title && <h5 className="font-medium text-foreground mb-2">{review.title}</h5>}
                      {review.content && <p className="text-muted-foreground">{review.content}</p>}
                    </div>)}
                </div> : <div className="text-center py-8">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                </div>}
            </CardContent>
          </Card>
        </div>
      </main>

        <Footer />
      </div>
    </>
  );
};
export default ProductDetail;