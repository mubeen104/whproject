import { useFeaturedProducts } from "@/hooks/useProducts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { RupeeIcon } from "./icons/RupeeIcon";

const KitsDeals = () => {
  const { data: products, isLoading } = useFeaturedProducts();
  
  // Filter for kits & deals products
  const kitsDealsProducts = products?.filter(product => product.is_kits_deals) || [];

  if (isLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Kits & Deals</h2>
            <p className="text-lg text-muted-foreground">Special product bundles and exclusive deals</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card className="h-96">
                  <CardContent className="p-0">
                    <div className="h-64 bg-muted rounded-t-lg"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (kitsDealsProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Kits & Deals</h2>
          <p className="text-lg text-muted-foreground">Special product bundles and exclusive deals</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {kitsDealsProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <CardContent className="p-0">
                <Link to={`/products/${product.slug}`}>
                  <div className="relative h-64 overflow-hidden">
                    {product.product_images?.[0] && (
                      <img
                        src={product.product_images[0].image_url}
                        alt={product.product_images[0].alt_text || product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-primary text-primary-foreground">
                        Deal
                      </Badge>
                    </div>
                    {product.compare_price && product.compare_price > product.price && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="destructive">
                          {Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}% OFF
                        </Badge>
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="p-6">
                  <Link to={`/products/${product.slug}`}>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.short_description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-lg font-bold text-foreground">
                        <RupeeIcon className="w-4 h-4" />
                        {product.price.toFixed(2)}
                      </div>
                      {product.compare_price && product.compare_price > product.price && (
                        <div className="flex items-center text-sm text-muted-foreground line-through">
                          <RupeeIcon className="w-3 h-3" />
                          {product.compare_price.toFixed(2)}
                        </div>
                      )}
                    </div>
                    
                    <Button size="sm" asChild>
                      <Link to={`/products/${product.slug}`}>
                        View Deal
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button size="lg" variant="outline" asChild>
            <Link to="/shop?section=kits-deals">View All Deals</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default KitsDeals;