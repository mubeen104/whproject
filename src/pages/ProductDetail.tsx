import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/hooks/useProducts';
import { Minus, Plus, Star, Truck, Shield, RotateCcw } from 'lucide-react';

const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async (): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            image_url,
            alt_text,
            sort_order
          )
        `)
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
  });
};

const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    },
  });
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading, error } = useProduct(id!);
  const { data: reviews } = useProductReviews(id!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
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
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
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
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart.mutate(
      { productId: product.id, quantity },
      {
        onSuccess: () => {
          toast({
            title: "Added to cart",
            description: `${quantity} x ${product.name} added to your cart.`,
          });
        },
      }
    );
  };

  const handleBuyNow = () => {
    // Add to cart and redirect to checkout
    addToCart.mutate(
      { productId: product.id, quantity },
      {
        onSuccess: () => {
          navigate('/cart');
        },
      }
    );
  };

  const getMainImage = () => {
    if (product.product_images && product.product_images.length > 0) {
      const sortedImages = [...product.product_images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      return sortedImages[selectedImage]?.image_url || sortedImages[0]?.image_url;
    }
    return '/placeholder.svg';
  };

  const averageRating = reviews && reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={getMainImage()}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.product_images && product.product_images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.product_images
                  .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                  .map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-primary' : 'border-border'
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={image.alt_text || product.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                 <span className="text-3xl font-bold text-primary">PKR {product.price.toFixed(2)}</span>
                 {product.compare_price && product.compare_price > product.price && (
                   <span className="text-xl text-muted-foreground line-through">
                     PKR {product.compare_price.toFixed(2)}
                   </span>
                 )}
              </div>
              {averageRating > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
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
                  <span className="text-sm text-muted-foreground">
                    ({reviews?.length || 0} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || product.short_description}
              </p>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 text-foreground font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= (product.inventory_quantity || 0)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending}
                  className="flex-1"
                  variant="outline"
                >
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={addToCart.isPending}
                  className="flex-1"
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 pt-6 border-t border-border">
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Truck className="w-5 h-5" />
                <span>Free shipping on orders over PKR 10,000</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Shield className="w-5 h-5" />
                <span>Secure payment & data protection</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <RotateCcw className="w-5 h-5" />
                <span>30-day return policy</span>
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
                <h4 className="font-semibold text-foreground mb-4">Product Features</h4>
                {product.features ? (
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.features}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No features information available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ingredients" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-4">Ingredients</h4>
                {product.ingredients ? (
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.ingredients}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No ingredients information available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-4">Usage Instructions</h4>
                {product.usage_instructions ? (
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {product.usage_instructions}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No usage instructions available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Product Information</h4>
                    <dl className="space-y-2">
                      {product.sku && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">SKU:</dt>
                          <dd className="text-sm text-foreground">{product.sku}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Availability:</dt>
                        <dd className="text-sm text-foreground">
                          {(product.inventory_quantity || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Shipping & Returns</h4>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>• Free standard shipping on orders over PKR 10,000</p>
                      <p>• Express shipping available at checkout</p>
                      <p>• 30-day return policy</p>
                      <p>• Returns must be in original condition</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Reviews Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Customer Reviews ({reviews?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-foreground">
                          Anonymous User
                        </span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.title && (
                      <h5 className="font-medium text-foreground mb-2">{review.title}</h5>
                    )}
                    {review.content && (
                      <p className="text-muted-foreground">{review.content}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;