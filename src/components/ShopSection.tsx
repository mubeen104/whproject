import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Eye, Search, Filter, Star } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useCategories } from '@/hooks/useCategories';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ShopSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { addToCart } = useCart();
  const { currency } = useStoreSettings();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Listen for search events from header
  useEffect(() => {
    const handleSearchEvent = (event: CustomEvent) => {
      setSearchTerm(event.detail.query);
    };

    window.addEventListener('search-products', handleSearchEvent as EventListener);
    return () => {
      window.removeEventListener('search-products', handleSearchEvent as EventListener);
    };
  }, []);

  // Filter and sort products
  const filteredProducts = products?.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
      product.tags?.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = filteredProducts?.sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const handleAddToCart = (product: any) => {
    addToCart.mutate(
      { productId: product.id, quantity: 1 }
    );
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

  return (
    <section id="shop" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Shop Our Products</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our collection of premium natural products crafted for your wellness journey.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-muted/50 rounded-lg">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedProducts?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No products are currently available'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedProducts?.slice(0, 12).map((product, index) => (
              <Card 
                key={product.id} 
                className="group overflow-hidden border-2 border-border bg-card shadow-lg hover:shadow-2xl hover:border-primary/30 transition-all duration-500 hover:-translate-y-4 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative overflow-hidden">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={getMainImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  
                  {/* Enhanced Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.is_featured && (
                      <Badge className="bg-primary text-primary-foreground shadow-lg backdrop-blur-sm animate-pulse">
                        ⭐ Featured
                      </Badge>
                    )}
                  </div>
                  
                  {product.compare_price && product.compare_price > product.price && (
                    <Badge className="absolute top-4 right-4 bg-red-500 text-white shadow-lg backdrop-blur-sm">
                      {Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}% OFF
                    </Badge>
                  )}

                  {/* Out of Stock Overlay */}
                  {product.inventory_quantity === 0 && (
                    <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center">
                      <Badge variant="secondary" className="text-lg font-medium px-6 py-2">Out of Stock</Badge>
                    </div>
                  )}

                  {/* Enhanced Quick Actions Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="secondary"
                          size="lg"
                          className="bg-white text-foreground hover:bg-white/90 shadow-xl backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-all duration-300 hover:scale-110"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Eye className="h-5 w-5 mr-2" />
                          Quick View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-primary">
                            {product.name}
                          </DialogTitle>
                        </DialogHeader>
                        {selectedProduct && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <div className="aspect-square overflow-hidden rounded-2xl">
                                <img
                                  src={getMainImage(selectedProduct)}
                                  alt={selectedProduct.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {selectedProduct.product_images?.length > 1 && (
                                <div className="grid grid-cols-4 gap-3">
                                  {selectedProduct.product_images.slice(1, 5).map((image: any) => (
                                    <div key={image.id} className="aspect-square overflow-hidden rounded-xl">
                                      <img
                                        src={image.image_url}
                                        alt={image.alt_text || selectedProduct.name}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-6">
                              <div>
                                <div className="flex items-center gap-3 mb-3">
                                   <span className="text-3xl font-bold text-primary">
                                     Rs {selectedProduct.price.toFixed(2)}
                                   </span>
                                   {selectedProduct.compare_price && selectedProduct.compare_price > selectedProduct.price && (
                                     <span className="text-xl text-muted-foreground line-through">
                                       Rs {selectedProduct.compare_price.toFixed(2)}
                                     </span>
                                   )}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground mb-6">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                                    ))}
                                  </div>
                                  <span className="ml-2">4.5 (23 reviews)</span>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold text-lg mb-3">Description</h4>
                                <p className="text-muted-foreground leading-relaxed">
                                  {selectedProduct.description || selectedProduct.short_description}
                                </p>
                              </div>

                              <Card className="border-0 bg-muted/20">
                                <CardContent className="p-4 space-y-3">
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">SKU:</span>
                                    <span>{selectedProduct.sku || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">Availability:</span>
                                    <span className={selectedProduct.inventory_quantity > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                      {selectedProduct.inventory_quantity > 0 
                                        ? `${selectedProduct.inventory_quantity} in stock`
                                        : 'Out of stock'
                                      }
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>

                              <Button
                                onClick={() => handleAddToCart(selectedProduct)}
                                disabled={addToCart.isPending || selectedProduct.inventory_quantity === 0}
                                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
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
                
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="font-bold text-xl leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-2">
                      {product.name}
                    </h3>
                    {product.short_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {product.short_description}
                      </p>
                    )}
                  </div>

                  {/* Enhanced Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">(4.5)</span>
                  </div>

                  {/* Enhanced Price */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="font-bold text-2xl text-primary">
                      Rs {product.price.toFixed(2)}
                    </span>
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="text-lg text-muted-foreground line-through">
                        Rs {product.compare_price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={addToCart.isPending || product.inventory_quantity === 0}
                      className="flex-1 h-12 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/10 transition-all duration-300"
                      variant="outline"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.inventory_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                    
                    <Button
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="flex-1 h-12 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Show More Button */}
        {!productsLoading && sortedProducts && sortedProducts.length > 12 && (
          <div className="text-center mt-8">
            <Button onClick={() => navigate('/shop')} variant="outline" size="lg">
              View All Products
            </Button>
          </div>
        )}

        {/* Results Count */}
        {!productsLoading && sortedProducts && sortedProducts.length > 0 && (
          <div className="text-center mt-8 text-muted-foreground">
            Showing {Math.min(sortedProducts.length, 12)} of {products?.length || 0} products
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopSection;