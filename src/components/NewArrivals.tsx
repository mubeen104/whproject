import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, ShoppingCart } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useNewArrivals } from "@/hooks/useProducts";
import { useGuestCart } from "@/hooks/useGuestCart";
import { useStoreSettings, useUISettings } from "@/hooks/useStoreSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddToCartModal } from "@/components/AddToCartModal";
import { useCarouselAutoScroll } from "@/hooks/useCarouselAutoScroll";
import { useProductRatings } from "@/hooks/useProductRatings";
import { ProductRating } from "@/components/ProductRating";

const NewArrivals = () => {
  const { data: newArrivals = [], isLoading } = useNewArrivals();
  
  // Filter out kits & deals products
  const products = newArrivals.filter(product => !product.is_kits_deals);

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
      <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-64 mx-auto mb-4 rounded-lg" />
            <Skeleton className="h-6 w-96 mx-auto rounded-lg" />
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
    <section className="py-20 bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 right-20 w-48 h-48 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-6">
            <span className="text-sm font-medium text-primary px-4 py-1 bg-primary/20 rounded-full">
              ✨ Just Launched
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            New Arrivals
            <span className="block text-transparent bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text">
              Latest Products
            </span>
          </h2>
          <p className="text-2xl md:text-3xl text-muted-foreground mb-4 font-semibold">Discover Our Newest Organic Herbal Products & Natural Remedies</p>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Be the first to experience our latest collection of premium organic supplements and natural wellness solutions
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
                      animationDelay: `${index * 0.1}s`,
                      transition: `transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
                      willChange: 'transform'
                    }}
                    onClick={() => navigate(`/product/${product.slug}`)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                  >
                    <div className="relative bg-card/40 backdrop-blur-xl border border-border/20 rounded-3xl p-1 shadow-lg group-hover:shadow-2xl group-hover:border-primary/30 group-hover:scale-105"
                      style={{ transition: `all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)`, willChange: 'transform, box-shadow, border-color' }}>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-sm"
                        style={{ transition: `opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)` }} />

                      <Card className="relative bg-card/80 backdrop-blur-sm border-0 rounded-3xl overflow-hidden shadow-none">
                        <CardContent className="p-0">
                          <div className="relative overflow-hidden rounded-t-3xl aspect-square">
                            <img
                              src={getMainImage(product)}
                              alt={product.name}
                              className="w-full h-full object-contain group-hover:scale-110"
                              style={{ transition: `transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)`, willChange: 'transform' }}
                            />
                            
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-gradient-to-r from-primary to-accent text-white shadow-lg border-0 rounded-full px-3 py-1 text-xs font-medium">
                                New
                              </Badge>
                            </div>

                            {product.compare_price && product.compare_price > product.price && (
                              <div className="absolute top-3 right-3">
                                <Badge className="bg-red-500/90 backdrop-blur-sm text-white shadow-lg border-0 rounded-full px-3 py-1 text-xs font-medium">
                                  Sale
                                </Badge>
                              </div>
                            )}

                            {product.inventory_quantity === 0 && (
                              <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center rounded-t-3xl">
                                <Badge variant="secondary" className="text-base font-medium py-2 px-4 rounded-full shadow-lg">
                                  Out of Stock
                                </Badge>
                              </div>
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-t-3xl">
                              <div className="flex gap-3">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      className="bg-white/95 text-foreground hover:bg-white rounded-full px-4 py-2 shadow-lg border-0" 
                                      onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      Quick View
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
                                    <DialogHeader>
                                      <DialogTitle className="text-2xl">{product.name}</DialogTitle>
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
                          </div>

                          <div className="p-2 sm:p-4 lg:p-6">
                            <div className="mb-2 sm:mb-3 lg:mb-4">
                              <h3 className="sr-only">{product.name}</h3>
                              <p className="font-semibold text-sm sm:text-base lg:text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300 mb-1 sm:mb-2">
                                {product.name}
                              </p>
                              {product.short_description && (
                                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                  {product.short_description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between mb-2 sm:mb-4 lg:mb-6">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-sm sm:text-lg lg:text-xl text-foreground">
                                  {currency} {product.price.toFixed(2)}
                                </span>
                                {product.compare_price && product.compare_price > product.price && (
                                  <span className="text-xs sm:text-sm text-muted-foreground line-through">
                                    {currency} {product.compare_price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Rating */}
                            <div className="mb-2 sm:mb-4 lg:mb-6">
                              <ProductRating
                                averageRating={ratings.find(r => r.productId === product.id)?.averageRating || 0}
                                reviewCount={ratings.find(r => r.productId === product.id)?.reviewCount || 0}
                                showCount={true}
                                size="sm"
                              />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 lg:gap-3">
                              <Button 
                                onClick={(e) => { e.stopPropagation(); handleAddToCartRequest(product); }} 
                                disabled={cartLoading || product.inventory_quantity === 0} 
                                className="flex-1 rounded-full font-medium text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3" 
                                variant="outline"
                              >
                                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">{product.inventory_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                                <span className="sm:hidden">Add</span>
                              </Button>

                              <Button 
                                onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.slug}`); }} 
                                className="flex-1 rounded-full font-medium text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3"
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>

      <AddToCartModal
        product={addToCartProduct}
        isOpen={!!addToCartProduct}
        onClose={() => setAddToCartProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </section>
  );
};

export default NewArrivals;
