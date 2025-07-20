import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedProducts = () => {
  const { data: products = [], isLoading } = useFeaturedProducts();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (productId: string) => {
    if (!user) {
      return;
    }
    addToCart.mutate({ productId, quantity: 1 });
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
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Products
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our most popular herbal supplements and wellness products, 
            carefully selected for their quality and effectiveness.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border-border"
            >
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.product_images?.[0]?.image_url || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center"}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badge */}
                  {product.is_featured && (
                    <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                      Featured
                    </Badge>
                  )}
                  
                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Sale Badge */}
                  {product.compare_price && product.compare_price > product.price && (
                    <div className="absolute bottom-3 left-3 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium">
                      Save {Math.round((1 - product.price / product.compare_price) * 100)}%
                    </div>
                  )}
                  
                  {/* Out of Stock Overlay */}
                  {product.inventory_quantity === 0 && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Badge variant="secondary" className="text-lg">Out of Stock</Badge>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center space-x-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < 4 ? "fill-accent text-accent" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      4.8 (124)
                    </span>
                  </div>

                  {/* Benefits */}
                  <div className="flex flex-wrap gap-1">
                    {product.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded capitalize"
                      >
                        {tag.replace('-', ' ')}
                      </span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-primary">${product.price}</span>
                      {product.compare_price && product.compare_price > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.compare_price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  {user ? (
                    <Button 
                      className="w-full group-hover:bg-primary-hover transition-colors"
                      size="sm"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.inventory_quantity === 0 || addToCart.isPending}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  ) : (
                    <AuthModal>
                      <Button 
                        className="w-full group-hover:bg-primary-hover transition-colors"
                        size="sm"
                        disabled={product.inventory_quantity === 0}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </AuthModal>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;