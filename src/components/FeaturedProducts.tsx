import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, ShoppingBag, Star, Eye, ShoppingCart } from "lucide-react";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { AuthModal } from "@/components/auth/AuthModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const FeaturedProducts = () => {
  const { data: products = [], isLoading } = useFeaturedProducts();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { currency } = useStoreSettings();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddToCart = (product: any) => {
    if (!user) {
      return;
    }
    addToCart.mutate({ productId: product.id, quantity: 1 });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const getMainImage = (product: any) => {
    if (product.product_images?.length > 0) {
      return product.product_images.sort((a: any, b: any) => a.sort_order - b.sort_order)[0].image_url;
    }
    return '/placeholder.svg';
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Products
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our most popular herbal supplements and wellness products, 
              carefully selected for their quality and effectiveness.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border-border">
                <CardContent className="p-0">
                  <Skeleton className="w-full h-48 rounded-t-lg" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-1">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-transparent to-muted/20" />
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.05) 0%, transparent 50%),
                         radial-gradient(circle at 80% 50%, hsl(var(--accent) / 0.05) 0%, transparent 50%)`
      }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent w-24" />
            <span className="mx-4 text-sm font-semibold text-primary uppercase tracking-wider">Best Sellers</span>
            <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent w-24" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Featured Products
          </h2>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
            Discover our most popular herbal supplements and wellness products, 
            carefully selected for their quality and effectiveness.
          </p>
        </div>

        {/* Enhanced Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <Card 
              key={product.id} 
              className="group overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:rotate-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-0">
                {/* Enhanced Product Image */}
                <div className="relative overflow-hidden rounded-t-xl">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={getMainImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  
                  {/* Animated Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  
                  {/* Enhanced Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.is_featured && (
                      <Badge className="bg-primary shadow-lg animate-pulse">
                        ⭐ Featured
                      </Badge>
                    )}
                  </div>
                  
                  {product.compare_price && product.compare_price > product.price && (
                    <Badge className="absolute top-4 right-4 bg-red-500 text-white shadow-lg animate-bounce">
                      🔥 Sale
                    </Badge>
                  )}
                  
                  {/* Out of Stock Overlay */}
                  {product.inventory_quantity === 0 && (
                    <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center">
                      <Badge variant="secondary" className="text-lg font-medium shadow-lg">Out of Stock</Badge>
                    </div>
                  )}

                  {/* Enhanced Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/90 text-foreground hover:bg-white"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Quick View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{product.name}</DialogTitle>
                        </DialogHeader>
                        {selectedProduct && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <img
                                src={getMainImage(selectedProduct)}
                                alt={selectedProduct.name}
                                className="w-full h-96 object-cover rounded-lg"
                              />
                              {selectedProduct.product_images?.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                  {selectedProduct.product_images.slice(1, 5).map((image: any) => (
                                    <img
                                      key={image.id}
                                      src={image.image_url}
                                      alt={image.alt_text || selectedProduct.name}
                                      className="w-full h-20 object-cover rounded border"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                   <span className="text-2xl font-bold">
                                     Rs {selectedProduct.price.toFixed(2)}
                                   </span>
                                   {selectedProduct.compare_price && selectedProduct.compare_price > selectedProduct.price && (
                                     <span className="text-lg text-muted-foreground line-through">
                                       Rs {selectedProduct.compare_price.toFixed(2)}
                                     </span>
                                   )}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground mb-4">
                                  <Star className="h-4 w-4 fill-current text-yellow-400 mr-1" />
                                  4.5 (23 reviews)
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Description</h4>
                                <p className="text-muted-foreground leading-relaxed">
                                  {selectedProduct.description || selectedProduct.short_description}
                                </p>
                              </div>


                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>SKU:</span>
                                  <span>{selectedProduct.sku || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Availability:</span>
                                  <span className={selectedProduct.inventory_quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                                    {selectedProduct.inventory_quantity > 0 
                                      ? `${selectedProduct.inventory_quantity} in stock`
                                      : 'Out of stock'
                                    }
                                  </span>
                                </div>
                              </div>

                              {user ? (
                                <Button
                                  onClick={() => handleAddToCart(selectedProduct)}
                                  disabled={addToCart.isPending || selectedProduct.inventory_quantity === 0}
                                  className="w-full"
                                  size="lg"
                                >
                                  <ShoppingCart className="h-5 w-5 mr-2" />
                                  {selectedProduct.inventory_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </Button>
                              ) : (
                                <AuthModal>
                                  <Button 
                                    className="w-full"
                                    size="lg"
                                    disabled={selectedProduct.inventory_quantity === 0}
                                  >
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    Add to Cart
                                  </Button>
                                </AuthModal>
                              )}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
                      {product.name}
                    </h3>
                    {product.short_description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {product.short_description}
                      </p>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3.5 w-3.5 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} 
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">(4.5)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-bold text-xl text-foreground">
                      Rs {product.price.toFixed(2)}
                    </span>
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        Rs {product.compare_price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {user ? (
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={addToCart.isPending || product.inventory_quantity === 0}
                        className="flex-1 h-9"
                        variant="outline"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {product.inventory_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    ) : (
                      <AuthModal>
                        <Button 
                          className="flex-1 h-9"
                          variant="outline"
                          disabled={product.inventory_quantity === 0}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </AuthModal>
                    )}
                    
                    <Button
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="flex-1 h-9"
                      size="sm"
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate('/shop')}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;