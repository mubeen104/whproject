import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProductVariants, ProductVariant } from '@/hooks/useProductVariants';
import { ProductVariantSelector } from '@/components/ProductVariantSelector';
import { ProductSchema } from '@/components/ProductSchema';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
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
import { useAnalytics } from '@/hooks/useAnalytics';
import RelatedProducts from '@/components/RelatedProducts';
import { Minus, Plus, Star, Truck, Shield, RotateCcw } from 'lucide-react';
const useProduct = (slugOrId: string) => {
  return useQuery({
    queryKey: ['product', slugOrId],
    queryFn: async (): Promise<Product> => {
      const selectStatement = `
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
        `;

      // Check if slugOrId looks like a UUID (contains hyphens and is 36 chars)
      const isUUID = slugOrId.length === 36 && slugOrId.includes('-');

      if (isUUID) {
        const { data, error } = await supabase.from('products').select(selectStatement).eq('id', slugOrId).eq('is_active', true).maybeSingle();
        if (error) throw error;
        if (data) return data;
        throw new Error(`Product with ID ${slugOrId} not found`);
      } else {
        // Try the slug as-is first
        const { data: data1, error: error1 } = await supabase.from('products').select(selectStatement).eq('slug', slugOrId).eq('is_active', true).maybeSingle();
        if (error1) throw error1;
        if (data1) return data1;

        // If not found and slug has trailing dash, try without it
        if (slugOrId.endsWith('-')) {
          const cleanSlug = slugOrId.slice(0, -1);
          const { data: data2, error: error2 } = await supabase.from('products').select(selectStatement).eq('slug', cleanSlug).eq('is_active', true).maybeSingle();
          if (error2) throw error2;
          if (data2) return data2;
        }
        // If not found and slug doesn't have trailing dash, try with it
        else {
          const dashSlug = slugOrId + '-';
          const { data: data3, error: error3 } = await supabase.from('products').select(selectStatement).eq('slug', dashSlug).eq('is_active', true).maybeSingle();
          if (error3) throw error3;
          if (data3) return data3;
        }

        throw new Error(`Product with slug ${slugOrId} not found`);
      }
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
    },
    enabled: !!productId
  });
};
const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
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
  const { trackViewContent, trackAddToCart } = useAnalytics();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  
  // Trim trailing slashes and dashes from slug to match database values
  const cleanSlug = slug?.replace(/[-/]+$/, '') || '';
  
  const {
    data: product,
    isLoading,
    error
  } = useProduct(cleanSlug);
  const {
    data: reviews
  } = useProductReviews(product?.id!);
  const {
    data: variants
  } = useProductVariants(product?.id!);

  // Track product view when product loads (only once per product)
  useEffect(() => {
    if (product && product.id) {
      const categoryName = product.product_categories?.[0]?.categories?.name || '';
      const currentPrice = selectedVariant?.price || product.price;

      // Only track if we have valid data
      if (product.id && product.name && typeof currentPrice === 'number' && !isNaN(currentPrice)) {
        trackViewContent({
          id: product.id,
          name: product.name,
          price: currentPrice,
          category: categoryName,
          brand: 'New Era Herbals',
          currency: currency
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]); // Only track when product ID changes (new product)
  if (isLoading) {
    return <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              <div className="bg-muted rounded-lg h-64 sm:h-96"></div>
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-muted rounded h-7 sm:h-8 w-3/4"></div>
                <div className="bg-muted rounded h-5 sm:h-6 w-1/2"></div>
                <div className="bg-muted rounded h-16 sm:h-20 w-full"></div>
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
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <Card>
            <CardContent className="p-4 sm:p-8 text-center">
              <h2 className="text-lg sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">Product Not Found</h2>
              <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">The product you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>;
  }
  const handleAddToCart = async () => {
    try {
      const currentPrice = selectedVariant?.price || product.price;
      const currentId = selectedVariant?.sku || product.sku || product.id;
      const categoryName = product.product_categories?.[0]?.categories?.name || '';

      // Validate before adding to cart
      if (!currentId || !product.name || typeof currentPrice !== 'number' || isNaN(currentPrice) || quantity <= 0) {
        toast({
          title: "Error",
          description: "Invalid product data. Please refresh and try again.",
          variant: "destructive",
        });
        return;
      }

      await addToCart(product.id, quantity, selectedVariant?.id);
      const displayName = selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name;

      // Track add to cart event with validated data
      trackAddToCart({
        id: currentId,
        name: product.name,
        price: currentPrice,
        quantity,
        category: categoryName,
        brand: 'New Era Herbals',
        currency: currency
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
        <Breadcrumbs />

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12">
          {/* Product Images - Modern Card Design */}
          <div className="space-y-4">
            {/* Main Image with Modern Card */}
            <Card className="border border-border/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 bg-card">
              <CardContent className="p-0">
                <div className="bg-muted/30 aspect-square overflow-hidden rounded-2xl">
                  <ProductImageZoom src={getMainImage()} alt={product.name} className="w-full h-full object-contain hover:scale-105 transition-transform duration-500" />
                </div>
              </CardContent>
            </Card>
            
            {/* Thumbnail Gallery */}
            {getCurrentImages().length > 1 && <div className="flex gap-3 overflow-x-auto pb-2">
                {getCurrentImages().map((image, index) => <button key={image.id} onClick={() => setSelectedImage(index)} className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-primary shadow-md' : 'border-border/40 hover:border-primary/50'}`}>
                       <img src={image.image_url} alt={image.alt_text || product.name} className="w-full h-full object-contain bg-muted/30" />
                    </button>)}
              </div>}
          </div>

          {/* Product Info - Modern Layout */}
          <div className="flex flex-col space-y-6">
            {/* Title & Variant */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">{product.name}</h1>
                {product.compare_price && product.compare_price > product.price && <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg px-3 py-1.5 text-xs font-semibold flex-shrink-0">Sale</Badge>}
              </div>
              {selectedVariant && <p className="text-sm md:text-base text-muted-foreground font-medium">
                  {selectedVariant.name}
                </p>}
            </div>

            {/* Price & Rating Card */}
            <Card className="border border-border/40 rounded-2xl bg-card shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  {/* Price */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl md:text-4xl font-bold text-foreground">{currency} {getCurrentPrice().toFixed(2)}</span>
                      {getCurrentComparePrice() && getCurrentComparePrice() > getCurrentPrice() && <span className="text-lg text-muted-foreground line-through">
                          {currency} {getCurrentComparePrice().toFixed(2)}
                        </span>}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < Math.floor(averageRating) 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {averageRating > 0 ? (
                        <>
                          {averageRating.toFixed(1)} ({reviews?.length || 0} {reviews?.length === 1 ? 'review' : 'reviews'})
                        </>
                      ) : (
                        'No reviews yet'
                      )}
                    </span>
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-2 pt-2">
                    <div className={`w-2 h-2 rounded-full ${(getCurrentInventory() || 0) > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-medium ${(getCurrentInventory() || 0) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {(getCurrentInventory() || 0) > 0 ? `${getCurrentInventory()} in stock` : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variant Selector */}
            {variants && variants.length > 0 && <div className="space-y-3">
              <ProductVariantSelector variants={variants} selectedVariant={selectedVariant} onVariantChange={variant => {
                setSelectedVariant(variant);
                setSelectedImage(0);
              }} />
            </div>}

            {/* Description */}
            {(selectedVariant?.description || product.description || product.short_description) && <div className="space-y-2">
              <h3 className="text-sm md:text-base font-semibold text-foreground">About This Product</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {selectedVariant?.description || product.description || product.short_description}
              </p>
            </div>}

            {/* Quantity & Actions */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">Quantity:</span>
                <div className="flex items-center border border-border/40 rounded-lg bg-card shadow-sm">
                  <Button variant="ghost" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} data-testid="button-quantity-decrease">
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 text-foreground font-semibold min-w-[3rem] text-center" data-testid="text-quantity-value">{quantity}</span>
                  <Button variant="ghost" size="sm" onClick={() => setQuantity(quantity + 1)} disabled={quantity >= (getCurrentInventory() || 0)} data-testid="button-quantity-increase">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <Button onClick={handleAddToCart} disabled={(getCurrentInventory() || 0) <= 0} className="flex-1 rounded-lg font-semibold py-2.5 md:py-3 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-white border-0" data-testid="button-add-to-cart">
                  {(getCurrentInventory() || 0) > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button onClick={handleBuyNow} disabled={(getCurrentInventory() || 0) <= 0} className="flex-1 rounded-lg font-semibold py-2.5 md:py-3" variant="outline" data-testid="button-buy-now">
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Trust Features */}
            <div className="space-y-3 pt-4 border-t border-border/40">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Free shipping on orders over {currency} {freeShippingThreshold.toFixed(0)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Secure payment & 100% protected</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">7-day easy returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Tabs - Modern Design */}
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="features" className="space-y-4">
            <Card className="border border-border/40 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-4">Key Features & Benefits</h3>
                {product.features ? <div className="prose max-w-none">
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.features}
                    </p>
                  </div> : <p className="text-muted-foreground italic">No features information available.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ingredients" className="space-y-4">
            <Card className="border border-border/40 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-4">Natural Ingredients</h3>
                {product.ingredients ? <div className="prose max-w-none">
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.ingredients}
                    </p>
                  </div> : <p className="text-muted-foreground italic">No ingredients information available.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <Card className="border border-border/40 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-4">Usage Instructions & Dosage</h3>
                {product.usage_instructions ? <div className="prose max-w-none">
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.usage_instructions}
                    </p>
                  </div> : <p className="text-muted-foreground italic">No usage instructions available.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Specifications Card */}
              <Card className="border border-border/40 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-bold text-foreground mb-4">Product Specifications</h3>
                  <dl className="space-y-3">
                    {product.sku && <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground font-medium">SKU:</dt>
                        <dd className="text-sm font-semibold text-foreground">{product.sku}</dd>
                      </div>}
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground font-medium">Availability:</dt>
                      <dd className="text-sm font-semibold text-foreground">
                        {(getCurrentInventory() || 0) > 0 ? <span className="text-green-600 dark:text-green-400">In Stock</span> : <span className="text-red-600 dark:text-red-400">Out of Stock</span>}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              {/* Policy Card */}
              <Card className="border border-border/40 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-bold text-foreground mb-4">Shipping & Returns</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary flex-shrink-0 mt-1">•</span>
                      <span>Free standard shipping on orders over {currency} {freeShippingThreshold.toFixed(0)}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary flex-shrink-0 mt-1">•</span>
                      <span>Express shipping available at checkout</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary flex-shrink-0 mt-1">•</span>
                      <span>7-day return policy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary flex-shrink-0 mt-1">•</span>
                      <span>Returns must be in original condition</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
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

        {/* Related Products Section */}
        <RelatedProducts productId={product.id} limit={6} />
      </main>

        <Footer />
      </div>
    </>
  );
};
export default ProductDetail;