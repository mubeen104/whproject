import { useFeaturedProducts } from "@/hooks/useProducts";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const KitsDeals = () => {
  const {
    data: products,
    isLoading
  } = useFeaturedProducts();
  const {
    currency
  } = useStoreSettings();

  // Filter for kits & deals products
  const kitsDealsProducts = products?.filter(product => product.is_kits_deals) || [];
  if (isLoading) {
    return <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Kits & Deals</h2>
            <p className="text-lg text-muted-foreground">Special product bundles and exclusive deals</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {[...Array(6)].map((_, i) => <div key={i} className="animate-pulse">
                <Card className="h-96">
                  <CardContent className="p-0">
                    <div className="h-64 bg-muted rounded-t-lg"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>)}
          </div>
        </div>
      </section>;
  }
  if (kitsDealsProducts.length === 0) {
    return null;
  }
  return <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Kits & Deals</h2>
          <p className="text-lg text-muted-foreground">Special product bundles and exclusive deals</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {kitsDealsProducts.map(product => <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              <CardContent className="p-0">
                <Link to={`/products/${product.slug}`}>
                   <div className="relative aspect-square overflow-hidden">
                     {product.product_images?.[0] && <img src={product.product_images[0].image_url} alt={product.product_images[0].alt_text || product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />}
                    <div className="absolute top-4 left-4">
                      
                    </div>
                    {product.compare_price && product.compare_price > product.price && <div className="absolute top-4 right-4">
                        <Badge variant="destructive">
                          {Math.round((product.compare_price - product.price) / product.compare_price * 100)}% OFF
                        </Badge>
                      </div>}
                  </div>
                </Link>
                
                <div className="p-2 sm:p-4 lg:p-6">
                  <Link to={`/products/${product.slug}`}>
                    <h3 className="font-semibold text-sm sm:text-base lg:text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300 mb-1 sm:mb-2">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4 line-clamp-2">
                    {product.short_description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center text-sm sm:text-lg font-bold text-foreground">
                        <span className="mr-1">{currency}</span>
                        {product.price.toFixed(2)}
                      </div>
                      {product.compare_price && product.compare_price > product.price && <div className="flex items-center text-xs sm:text-sm text-muted-foreground line-through">
                          <span className="mr-1">{currency}</span>
                          {product.compare_price.toFixed(2)}
                        </div>}
                    </div>
                    
                    <Button size="sm" asChild className="text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 rounded-full">
                      <Link to={`/products/${product.slug}`}>
                        <span className="hidden sm:inline">View Deal</span>
                        <span className="sm:hidden">View</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>
        
        <div className="text-center mt-12">
          <Button size="lg" variant="outline" asChild>
            <Link to="/shop?section=kits-deals">View All Deals</Link>
          </Button>
        </div>
      </div>
    </section>;
};
export default KitsDeals;