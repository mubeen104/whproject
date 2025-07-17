import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBag, Star } from "lucide-react";

const FeaturedProducts = () => {
  const products = [
    {
      id: 1,
      name: "Organic Turmeric Capsules",
      price: "$29.99",
      originalPrice: "$39.99",
      rating: 4.8,
      reviews: 127,
      badge: "Best Seller",
      badgeColor: "bg-accent text-accent-foreground",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center",
      benefits: ["Anti-inflammatory", "Joint Health", "Immune Support"]
    },
    {
      id: 2,
      name: "Lavender Sleep Tea",
      price: "$19.99",
      rating: 4.9,
      reviews: 89,
      badge: "New",
      badgeColor: "bg-primary text-primary-foreground",
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop&crop=center",
      benefits: ["Better Sleep", "Stress Relief", "Calming"]
    },
    {
      id: 3,
      name: "Ashwagandha Root Extract",
      price: "$34.99",
      rating: 4.7,
      reviews: 203,
      badge: "Popular",
      badgeColor: "bg-secondary text-secondary-foreground",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center",
      benefits: ["Stress Relief", "Energy Boost", "Mental Clarity"]
    },
    {
      id: 4,
      name: "Green Tea Extract",
      price: "$24.99",
      rating: 4.6,
      reviews: 156,
      badge: "Organic",
      badgeColor: "bg-muted text-muted-foreground",
      image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop&crop=center",
      benefits: ["Antioxidants", "Metabolism", "Heart Health"]
    }
  ];

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
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badge */}
                  <Badge className={`absolute top-3 left-3 ${product.badgeColor}`}>
                    {product.badge}
                  </Badge>
                  
                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Sale Badge */}
                  {product.originalPrice && (
                    <div className="absolute bottom-3 left-3 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium">
                      Save {Math.round((1 - parseFloat(product.price.slice(1)) / parseFloat(product.originalPrice.slice(1))) * 100)}%
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
                            i < Math.floor(product.rating)
                              ? "fill-accent text-accent"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>

                  {/* Benefits */}
                  <div className="flex flex-wrap gap-1">
                    {product.benefits.slice(0, 2).map((benefit) => (
                      <span
                        key={benefit}
                        className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-primary">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button 
                    className="w-full group-hover:bg-primary-hover transition-colors"
                    size="sm"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
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