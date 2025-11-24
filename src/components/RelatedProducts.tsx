import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Star, ArrowRight } from 'lucide-react';
import { useRelatedProducts, trackRelatedProductView, trackRelatedProductConversion } from '@/hooks/useRelatedProducts';
import { useGuestCart } from '@/hooks/useGuestCart';
import { useAuth } from '@/contexts/AuthContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useToast } from '@/hooks/use-toast';
import { AddToCartModal } from '@/components/AddToCartModal';
import { useProductRatings } from '@/hooks/useProductRatings';
import { ProductRating } from '@/components/ProductRating';
import { useAnalytics } from '@/hooks/useAnalytics';
import { RecommendationError } from '@/components/RecommendationError';

interface RelatedProductsProps {
  productId: string;
  limit?: number;
  excludeIds?: string[];
}

const RelatedProducts = ({ productId, limit = 6, excludeIds = [] }: RelatedProductsProps) => {
  const { data: relatedProducts = [], isLoading, isError, error, refetch } = useRelatedProducts(productId, limit, excludeIds);
  const { addToCart } = useGuestCart();
  const { user } = useAuth();
  const { currency } = useStoreSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { trackViewContent, trackAddToCart } = useAnalytics();

  const [addToCartProduct, setAddToCartProduct] = useState<any>(null);
  const [sessionId] = useState(() => {
    const existingId = sessionStorage.getItem('session_id');
    if (existingId) return existingId;
    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    sessionStorage.setItem('session_id', newId);
    return newId;
  });

  const productIds = relatedProducts.map(p => p.id);
  const { data: ratings = [] } = useProductRatings(productIds);

  useEffect(() => {
    if (relatedProducts.length > 0) {
      relatedProducts.forEach(product => {
        // Track in database for analytics
        trackRelatedProductView(productId, product.id, sessionId, user?.id);

        // Track to advertising pixels
        trackViewContent({
          id: product.id,
          name: product.name,
          price: product.price,
          currency: currency
        });
      });
    }
  }, [relatedProducts, productId, sessionId, user?.id, currency, trackViewContent]);

  const handleAddToCartRequest = (product: any) => {
    setAddToCartProduct(product);
  };

  const handleAddToCart = async (relatedProductId: string, quantity: number, variantId?: string) => {
    await addToCart(relatedProductId, quantity, variantId);

    // Track in database for analytics
    trackRelatedProductConversion(productId, relatedProductId, sessionId, user?.id);

    // Track to advertising pixels
    const product = relatedProducts.find(p => p.id === relatedProductId);
    if (product) {
      const categoryName = (product as any).product_categories?.[0]?.categories?.name || 'Herbal Products';
      trackAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        category: categoryName,
        brand: 'New Era Herbals',
        currency: currency
      });
    }
  };

  const handleProductClick = (product: any) => {
    trackRelatedProductConversion(productId, product.id, sessionId, user?.id);
    navigate(`/product/${product.slug}`);
  };

  if (isLoading) {
    return (
      <section className="mt-12 mb-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="w-full aspect-square" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="mt-12 mb-8">
        <div className="mb-6">
          <h2 id="related-products-heading" className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            You May Also Like
          </h2>
          <p className="text-muted-foreground">
            Customers who viewed this item also viewed these products
          </p>
        </div>
        <RecommendationError
          error={error}
          onRetry={refetch}
          title="Recommendations unavailable"
          description="We couldn't load product recommendations at this time."
        />
      </section>
    );
  }

  if (!relatedProducts || relatedProducts.length === 0) {
    return (
      <section className="mt-12 mb-8">
        <div className="mb-6">
          <h2 id="related-products-heading" className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            You May Also Like
          </h2>
          <p className="text-muted-foreground">
            Customers who viewed this item also viewed these products
          </p>
        </div>
        <Card className="mb-6 border-gray-200 bg-gray-50">
          <CardContent className="p-6">
            <p className="text-gray-600 text-center">
              No related products found at this time.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <>
      <section className="mt-12 mb-8" aria-labelledby="related-products-heading">
        <div className="mb-6">
          <h2 id="related-products-heading" className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            You May Also Like
          </h2>
          <p className="text-muted-foreground">
            Customers who viewed this item also viewed these products
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {relatedProducts.map((product) => {
            const productRating = ratings.find(r => r.productId === product.id);
            const averageRating = productRating?.averageRating || 0;
            const reviewCount = productRating?.reviewCount || 0;

            return (
              <Card
                key={product.id}
                className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div
                  className="relative aspect-square overflow-hidden bg-muted"
                  onClick={() => handleProductClick(product)}
                >
                  <img
                    src={product.image_url}
                    alt={product.image_alt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  {product.is_best_seller && (
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                      Best Seller
                    </Badge>
                  )}
                  {product.is_featured && !product.is_best_seller && (
                    <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">
                      Featured
                    </Badge>
                  )}
                  {product.compare_price && product.compare_price > product.price && (
                    <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
                      Sale
                    </Badge>
                  )}
                </div>

                <CardContent className="p-3 md:p-4">
                  <h3
                    className="font-semibold text-sm md:text-base text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  >
                    {product.name}
                  </h3>

                  {reviewCount > 0 && (
                    <div className="mb-2">
                      <ProductRating
                        averageRating={averageRating}
                        reviewCount={reviewCount}
                        size="sm"
                        showCount={false}
                      />
                    </div>
                  )}

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg md:text-xl font-bold text-primary">
                      {currency} {product.price.toFixed(2)}
                    </span>
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {currency} {product.compare_price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCartRequest(product);
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleProductClick(product)}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {addToCartProduct && (
        <AddToCartModal
          product={addToCartProduct}
          isOpen={!!addToCartProduct}
          onClose={() => setAddToCartProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  );
};

export default RelatedProducts;
