import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, ShoppingCart, Star } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useBestSellingProducts } from "@/hooks/useProducts";
import { useGuestCart } from "@/hooks/useGuestCart";
import { useStoreSettings, useUISettings } from "@/hooks/useStoreSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddToCartModal } from "@/components/AddToCartModal";
import { useCarouselAutoScroll } from "@/hooks/useCarouselAutoScroll";
import { useProductRatings } from "@/hooks/useProductRatings";
import { ProductRating } from "@/components/ProductRating";

const BestSellingProducts = () => {
  const { data: bestSellingProducts = [], isLoading } = useBestSellingProducts();
  
  // Filter out kits & deals products
  const products = bestSellingProducts.filter(product => !product.is_kits_deals);

  const productIds = products.map(p => p.id);
  const { data: ratings = [] } = useProductRatings(productIds);
  
  const { addToCart, isLoading: cartLoading } = useGuestCart();
  const { currency } = useStoreSettings();
  const { carouselScrollSpeed, animationDuration, enableSmoothScrolling } = useUISettings();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [addToCartProduct, setAddToCartProduct] = useState<any>(null);
  const [carouselApi, setCarouselApi] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  useCarouselAutoScroll(carouselApi, isPaused);

  const handleAddToCartRequest = (product: any) => {
    setAddToCartProduct(product);
  };

  const handleAddToCart = async (productId: string, quantity: number, variantId?: string) => {
    await addToCart(productId, quantity, variantId);
  };

  const getMainImage = (product: any) => {
    if (product.product_images?.length > 0) {
      return product.product_images.sort((a: any, b: any) => a.sort_order - b.sort_order)[0].image_url;
    }
    return '/logo.png';
  };

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Skeleton className="h-8 sm:h-12 w-48 sm:w-64 mx-auto mb-3 sm:mb-4 rounded-lg" />
            <Skeleton className="h-5 sm:h-6 w-80 sm:w-96 mx-auto rounded-lg" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-96 rounded-3xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      <div className="absolute top-12 sm:top-20 left-4 sm:left-10 w-24 sm:w-32 h-24 sm:h-32 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-32 sm:bottom-40 right-4 sm:right-20 w-32 sm:w-48 h-32 sm:h-48 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <header className="text-center mb-12 sm:mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4 sm:mb-6">
            <span className="text-xs sm:text-sm font-medium text-primary px-3 sm:px-4 py-1 bg-primary/20 rounded-full">
              🔥 Customer Favorites
            </span>
          </div>
          
          <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold text-foreground mb-3 sm:mb-6 tracking-tight">
            Best Selling
            <span className="block text-transparent bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text">
              Top Rated Products
            </span>
          </h2>
          <p className="text-sm sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-2 sm:mb-4 font-semibold">Customer Favorites & Most Popular Organic Supplements</p>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            Explore our best-selling herbal products trusted by thousands for natural wellness and holistic health
          </p>
        </header>

        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
              duration: enableSmoothScrolling ? animationDuration : 0,
              skipSnaps: false,
              dragFree: true
            }}
            className="w-full max-w-7xl mx-auto"
            setApi={setCarouselApi}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {products.map((product, index) => (
                <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div
                    className="group relative animate-fade-in cursor-pointer"
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                    onClick={() => navigate(`/product/${product.slug}`)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                  >
                    {/* Modern Product Card */}
                    <Card className="relative h-full flex flex-col bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover-elevate">
                      <CardContent className="p-0 flex flex-col h-full">
                        {/* Product Image Container */}
                        <div className="relative overflow-hidden bg-muted/30 aspect-square group-hover/product-image:scale-105 transition-transform duration-500">
                          <img
                            src={getMainImage(product)}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                         
                          {/* Sale Badge */}
                          {product.compare_price && product.compare_price > product.price && (
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg border-0 rounded-lg px-3 py-1.5 text-xs font-semibold">
                                Sale
                              </Badge>
                            </div>
                          )}

                          {/* Out of Stock Overlay */}
                          {product.inventory_quantity === 0 && (
                            <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center">
                              <Badge variant="secondary" className="text-sm font-medium py-2 px-4 rounded-lg shadow-lg">
                                Out of Stock
                              </Badge>
                            </div>
                          )}

                          {/* Quick Actions Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="bg-white/95 text-foreground hover:bg-white rounded-lg px-4 py-2 shadow-lg border-0 font-medium text-xs"
                                  onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Quick View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card/95 backdrop-blur-xl border-border/50">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{product.name}</DialogTitle>
                                </DialogHeader>
                                    {selectedProduct && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                          <img 
                                            src={getMainImage(selectedProduct)} 
                                            alt={selectedProduct.name} 
                                            className="w-full aspect-square object-contain rounded-2xl" 
                                          />
                                        </div>
                                        
                                        <div className="space-y-6">
                                          <div>
                                            <div className="flex items-center gap-3 mb-3">
                                              <span className="text-3xl font-bold text-foreground">
                                                {currency} {selectedProduct.price.toFixed(2)}
                                              </span>
                                              {selectedProduct.compare_price && selectedProduct.compare_price > selectedProduct.price && (
                                                <span className="text-lg text-muted-foreground line-through">
                                                  {currency} {selectedProduct.compare_price.toFixed(2)}
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          <div>
                                            <h4 className="font-semibold mb-3 text-lg">Description</h4>
                                            <p className="text-muted-foreground leading-relaxed">
                                              {selectedProduct.description || selectedProduct.short_description}
                                            </p>
                                          </div>

                                          <Button 
                                            onClick={() => handleAddToCartRequest(selectedProduct)} 
                                            disabled={cartLoading || selectedProduct.inventory_quantity === 0} 
                                            className="w-full rounded-full py-6 text-base font-medium" 
                                            size="lg"
                                          >
                                            <ShoppingCart className="h-5 w-5 mr-2" />
                                            {selectedProduct.inventory_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 p-3 sm:p-4 flex flex-col">
                          {/* Product Name & Description */}
                          <div className="mb-3 sm:mb-4">
                            <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-2 text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                              {product.name}
                            </h3>
                            {product.short_description && (
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {product.short_description}
                              </p>
                            )}
                          </div>

                          {/* Rating */}
                          <div className="mb-2 sm:mb-3">
                            <ProductRating
                              averageRating={ratings.find(r => r.productId === product.id)?.averageRating || 0}
                              reviewCount={ratings.find(r => r.productId === product.id)?.reviewCount || 0}
                              showCount={true}
                              size="sm"
                            />
                          </div>

                          {/* Price Section */}
                          <div className="mb-4 sm:mb-5">
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg sm:text-xl font-bold text-foreground">
                                {currency} {product.price.toFixed(2)}
                              </span>
                              {product.compare_price && product.compare_price > product.price && (
                                <span className="text-xs sm:text-sm text-muted-foreground line-through">
                                  {currency} {product.compare_price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Spacer */}
                          <div className="flex-1"></div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={(e) => { e.stopPropagation(); handleAddToCartRequest(product); }}
                              disabled={cartLoading || product.inventory_quantity === 0}
                              className="w-full rounded-lg font-semibold text-xs sm:text-sm py-2 sm:py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-white border-0"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              {product.inventory_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </Button>

                            <Button
                              onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.slug}`); }}
                              className="w-full rounded-lg font-semibold text-xs sm:text-sm py-2 sm:py-2.5"
                              variant="outline"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>

      {addToCartProduct && (
        <AddToCartModal
          product={addToCartProduct}
          isOpen={!!addToCartProduct}
          onClose={() => setAddToCartProduct(null)}
          onAddToCart={handleAddToCart}
          isLoading={cartLoading}
        />
      )}
    </section>
  );
};

export default BestSellingProducts;
