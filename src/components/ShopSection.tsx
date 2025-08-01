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
import { useGuestCart } from '@/hooks/useGuestCart';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ShopSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { addToCart, isLoading: cartLoading } = useGuestCart();
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
      product.product_categories?.some(pc => pc.categories.slug === selectedCategory);
    
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
      case 'kits-deals':
        return (b.is_kits_deals ? 1 : 0) - (a.is_kits_deals ? 1 : 0);
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart(product.id, 1);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getMainImage = (product: any) => {
    if (product.product_images?.length > 0) {
      return product.product_images.sort((a: any, b: any) => a.sort_order - b.sort_order)[0].image_url;
    }
    return '/placeholder.svg';
  };

  return (
    <section id="shop" className="py-20 bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Modern Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 right-20 w-48 h-48 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-secondary/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
      
      <div className="relative container mx-auto px-4">
        {/* Modern Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-6">
            <span className="text-sm font-medium text-primary px-4 py-1 bg-primary/20 rounded-full">
              🛍️ Shop
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Our
            <span className="block text-transparent bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text">
              Products
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Discover our collection of premium natural products crafted for your wellness journey
          </p>
        </div>

        {/* Modern Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 p-6 bg-card/40 backdrop-blur-xl border border-border/20 rounded-3xl shadow-lg">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-border/30 bg-background/50 backdrop-blur-sm"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-52 h-12 rounded-2xl border-border/30 bg-background/50 backdrop-blur-sm">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/20 bg-card/90 backdrop-blur-xl">
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-52 h-12 rounded-2xl border-border/30 bg-background/50 backdrop-blur-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/20 bg-card/90 backdrop-blur-xl">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="kits-deals">Kits & Deals</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Modern Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="group relative">
                <div className="relative bg-card/40 backdrop-blur-xl border border-border/20 rounded-3xl p-1 shadow-lg">
                  <Card className="relative bg-card/80 backdrop-blur-sm border-0 rounded-3xl overflow-hidden shadow-none">
                    <CardContent className="p-0">
                      <Skeleton className="w-full aspect-square rounded-t-3xl" />
                      <div className="p-6 space-y-4">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-4 w-4 rounded-full" />
                          ))}
                        </div>
                        <Skeleton className="h-6 w-24" />
                        <div className="flex gap-3">
                          <Skeleton className="h-10 flex-1 rounded-full" />
                          <Skeleton className="h-10 flex-1 rounded-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        ) : sortedProducts?.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto bg-muted/20 rounded-full flex items-center justify-center mb-6">
              <div className="text-6xl">🔍</div>
            </div>
            <h3 className="text-2xl font-semibold mb-3">No products found</h3>
            <p className="text-muted-foreground text-lg">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No products are currently available'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {sortedProducts?.slice(0, 12).map((product, index) => (
              <div
                key={product.id}
                className="group relative animate-fade-in hover-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Floating Card Container */}
                <div className="relative bg-card/40 backdrop-blur-xl border border-border/20 rounded-3xl p-1 shadow-lg group-hover:shadow-2xl transition-all duration-700 group-hover:border-primary/30">
                  {/* Gradient Border Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                  
                  <Card className="relative bg-card/80 backdrop-blur-sm border-0 rounded-3xl overflow-hidden shadow-none">
                    <CardContent className="p-0">
                      {/* Product Image Container */}
                       <div className="relative overflow-hidden rounded-t-3xl aspect-square">
                         <img
                           src={getMainImage(product)}
                           alt={product.name}
                           className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                         />
                        
                        {/* Floating Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.is_featured && (
                            <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground shadow-lg border-0 rounded-full px-3 py-1 text-xs font-medium">
                              Featured
                            </Badge>
                          )}
                          {product.compare_price && product.compare_price > product.price && (
                            <Badge className="bg-red-500/90 backdrop-blur-sm text-white shadow-lg border-0 rounded-full px-3 py-1 text-xs font-medium">
                              Sale
                            </Badge>
                          )}
                        </div>

                        {/* Out of Stock Overlay */}
                        {product.inventory_quantity === 0 && (
                          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center rounded-t-3xl">
                            <Badge variant="secondary" className="text-base font-medium py-2 px-4 rounded-full shadow-lg">
                              Out of Stock
                            </Badge>
                          </div>
                        )}

                        {/* Quick Actions Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-t-3xl">
                          <div className="flex gap-3">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="bg-white/95 text-foreground hover:bg-white rounded-full px-4 py-2 shadow-lg border-0"
                                  onClick={() => setSelectedProduct(product)}
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
                                      {selectedProduct.product_images?.length > 1 && (
                                        <div className="grid grid-cols-4 gap-3">
                                          {selectedProduct.product_images.slice(1, 5).map((image: any) => (
                                             <img
                                               key={image.id}
                                               src={image.image_url}
                                               alt={image.alt_text || selectedProduct.name}
                                               className="w-full aspect-square object-contain rounded-xl border"
                                             />
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="space-y-6">
                                      <div>
                                        <div className="flex items-center gap-3 mb-3">
                                           <span className="text-3xl font-bold text-foreground">
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
                                        <h4 className="font-semibold mb-3 text-lg">Description</h4>
                                        <p className="text-muted-foreground leading-relaxed">
                                          {selectedProduct.description || selectedProduct.short_description}
                                        </p>
                                      </div>

                                      <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                          <span>SKU:</span>
                                          <span className="font-medium">{selectedProduct.sku || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span>Availability:</span>
                                          <span className={selectedProduct.inventory_quantity > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                            {selectedProduct.inventory_quantity > 0 
                                              ? `${selectedProduct.inventory_quantity} in stock`
                                              : 'Out of stock'
                                            }
                                          </span>
                                        </div>
                                      </div>

                                      <Button
                                        onClick={() => handleAddToCart(selectedProduct)}
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

                      {/* Product Info */}
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300 mb-2">
                            {product.name}
                          </h3>
                          {product.short_description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {product.short_description}
                            </p>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} 
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-2">(4.5)</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xl text-foreground">
                              Rs {product.price.toFixed(2)}
                            </span>
                            {product.compare_price && product.compare_price > product.price && (
                              <span className="text-sm text-muted-foreground line-through">
                                Rs {product.compare_price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleAddToCart(product)}
                            disabled={cartLoading || product.inventory_quantity === 0}
                            className="flex-1 rounded-full font-medium"
                            variant="outline"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {product.inventory_quantity === 0 ? 'Out of Stock' : 'Add'}
                          </Button>
                          
                          <Button
                            onClick={() => navigate(`/product/${product.id}`)}
                            className="flex-1 rounded-full font-medium"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modern Show More Button */}
        {!productsLoading && sortedProducts && sortedProducts.length > 12 && (
          <div className="text-center mt-16">
            <Button 
              onClick={() => navigate('/shop')} 
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-full px-8 py-6 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 border-0"
            >
              View All Products
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </div>
        )}

        {/* Results Count */}
        {!productsLoading && sortedProducts && sortedProducts.length > 0 && (
          <div className="text-center mt-8 text-muted-foreground">
            <div className="inline-flex items-center px-4 py-2 bg-muted/50 rounded-full text-sm">
              Showing {Math.min(sortedProducts.length, 12)} of {products?.length || 0} products
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopSection;