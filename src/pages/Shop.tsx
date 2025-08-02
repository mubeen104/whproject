import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Eye, Search, Filter, Star } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useGuestCart } from '@/hooks/useGuestCart';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useToast } from '@/hooks/use-toast';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [productType, setProductType] = useState<string>('all'); // New state for product type
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Update search term and category when URL changes
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || 'all';
    const urlSection = searchParams.get('section');
    setSearchTerm(urlSearch);
    setSelectedCategory(urlCategory);
    
    // Handle special sections
    if (urlSection === 'kits-deals') {
      setSortBy('kits-deals');
    }
  }, [searchParams]);

  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { addToCart, isLoading: cartLoading } = useGuestCart();
  const { currency } = useStoreSettings();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Filter and sort products
  const filteredProducts = products?.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
      product.product_categories?.some(pc => pc.categories.slug === selectedCategory);
    
    const matchesType = productType === 'all' || 
      (productType === 'kits-deals' && product.is_kits_deals) ||
      (productType === 'single-items' && !product.is_kits_deals);
    
    return matchesSearch && matchesCategory && matchesType;
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
        description: "Failed to add product to cart.",
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-muted/20 border-b">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23059669%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 animate-fade-in">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block p-1 bg-primary/10 rounded-full mb-6 sm:mb-8 hover:bg-primary/20 transition-all duration-300 hover:scale-105">
              <div className="bg-background rounded-full px-4 sm:px-6 md:px-8 py-2 sm:py-3 shadow-lg">
                <span className="text-xs sm:text-sm font-bold text-primary">
                  Premium Collection
                </span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 text-foreground leading-tight animate-scale-in">
              Shop
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in px-4" style={{ animationDelay: '0.2s' }}>
              Discover our collection of premium natural products crafted for your wellness journey.
            </p>
          </div>
        </div>
      </section>
      
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
          {/* Enhanced Filters and Search */}
          <Card className="mb-8 sm:mb-10 md:mb-12 border-2 shadow-xl bg-card backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:border-primary/20">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex-1 relative group">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5 group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300" />
                  <Input
                    placeholder="Search for natural products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 sm:pl-12 h-12 sm:h-14 text-base sm:text-lg border-2 focus:border-primary focus:shadow-lg rounded-xl transition-all duration-300 bg-background hover:bg-muted/20"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Select value={productType} onValueChange={setProductType}>
                    <SelectTrigger className="w-full h-12 sm:h-14 border-2 rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center">
                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-primary" />
                        <SelectValue placeholder="Product Type" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2">
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="single-items">Single Items</SelectItem>
                      <SelectItem value="kits-deals">Kits & Deals</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full h-12 sm:h-14 border-2 rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center">
                        <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-primary" />
                        <SelectValue placeholder="All Categories" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:col-span-2 lg:col-span-1 h-12 sm:h-14 border-2 rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-300">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2">
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="group relative">
                  <div className="relative bg-card/40 backdrop-blur-xl border border-border/20 rounded-2xl sm:rounded-3xl p-1 shadow-lg">
                    <Card className="relative bg-card/80 backdrop-blur-sm border-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-none">
                      <CardContent className="p-0">
                        <Skeleton className="w-full aspect-[4/3] rounded-t-2xl sm:rounded-t-3xl" />
                        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                          <Skeleton className="h-4 sm:h-5 w-3/4" />
                          <Skeleton className="h-3 sm:h-4 w-full" />
                          <Skeleton className="h-3 sm:h-4 w-2/3" />
                          <div className="flex gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Skeleton key={i} className="h-3 w-3 sm:h-4 sm:w-4 rounded-full" />
                            ))}
                          </div>
                          <Skeleton className="h-5 sm:h-6 w-20 sm:w-24" />
                          <div className="flex gap-2 sm:gap-3">
                            <Skeleton className="h-8 sm:h-10 flex-1 rounded-full" />
                            <Skeleton className="h-8 sm:h-10 flex-1 rounded-full" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedProducts?.length === 0 ? (
            <Card className="border-2 shadow-xl bg-muted/10 hover:shadow-2xl transition-all duration-300">
              <CardContent className="text-center py-12 sm:py-16 md:py-20 px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-all duration-300 hover:scale-110">
                  <Search className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">No products found</h3>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-md mx-auto">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filters to find what you\'re looking for'
                    : 'No products are currently available in our collection'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {sortedProducts?.map((product, index) => (
                <div
                  key={product.id}
                  className="group relative animate-fade-in hover-scale"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Floating Card Container */}
                  <div className="relative bg-card/40 backdrop-blur-xl border border-border/20 rounded-2xl sm:rounded-3xl p-1 shadow-lg group-hover:shadow-2xl transition-all duration-700 group-hover:border-primary/30">
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                    
                    <Card className="relative bg-card/80 backdrop-blur-sm border-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-none">
                      <CardContent className="p-0">
                        {/* Product Image Container */}
                        <div className="relative overflow-hidden rounded-t-2xl sm:rounded-t-3xl aspect-[4/3]">
                          <img
                            src={getMainImage(product)}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          
                          {/* Floating Badges */}
                          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-2">
                            {product.is_featured && (
                              <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground shadow-lg border-0 rounded-full px-2 py-1 sm:px-3 text-xs font-medium">
                                Featured
                              </Badge>
                            )}
                            {product.is_kits_deals && (
                              <Badge className="bg-accent/90 backdrop-blur-sm text-accent-foreground shadow-lg border-0 rounded-full px-2 py-1 sm:px-3 text-xs font-medium">
                                Kit & Deal
                              </Badge>
                            )}
                            {product.compare_price && product.compare_price > product.price && (
                              <Badge className="bg-red-500/90 backdrop-blur-sm text-white shadow-lg border-0 rounded-full px-2 py-1 sm:px-3 text-xs font-medium">
                                Sale
                              </Badge>
                            )}
                          </div>

                          {/* Out of Stock Overlay */}
                          {product.inventory_quantity === 0 && (
                            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center rounded-t-2xl sm:rounded-t-3xl">
                              <Badge variant="secondary" className="text-sm sm:text-base font-medium py-1.5 px-3 sm:py-2 sm:px-4 rounded-full shadow-lg">
                                Out of Stock
                              </Badge>
                            </div>
                          )}

                          {/* Quick Actions Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-t-2xl sm:rounded-t-3xl">
                            <div className="flex gap-2 sm:gap-3">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className="bg-white/95 text-foreground hover:bg-white rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-lg border-0 text-xs sm:text-sm"
                                    onClick={() => setSelectedProduct(product)}
                                  >
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                    Quick View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-2xl m-2 sm:m-4">
                                  <DialogHeader className="px-1 sm:px-0">
                                    <DialogTitle className="text-lg sm:text-xl md:text-2xl pr-8">{product.name}</DialogTitle>
                                  </DialogHeader>
                                  {selectedProduct && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                                      <div className="space-y-3 sm:space-y-4">
                                        <img
                                          src={getMainImage(selectedProduct)}
                                          alt={selectedProduct.name}
                                          className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-xl sm:rounded-2xl"
                                        />
                                        {selectedProduct.product_images?.length > 1 && (
                                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                                            {selectedProduct.product_images.slice(1, 5).map((image: any) => (
                                              <img
                                                key={image.id}
                                                src={image.image_url}
                                                alt={image.alt_text || selectedProduct.name}
                                                className="w-full h-16 sm:h-20 object-cover rounded-lg sm:rounded-xl border"
                                              />
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="space-y-4 sm:space-y-6">
                                        <div>
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                             <span className="text-2xl sm:text-3xl font-bold text-foreground">
                                               {currency} {selectedProduct.price.toFixed(2)}
                                             </span>
                                             {selectedProduct.compare_price && selectedProduct.compare_price > selectedProduct.price && (
                                               <span className="text-base sm:text-lg text-muted-foreground line-through">
                                                 {currency} {selectedProduct.compare_price.toFixed(2)}
                                               </span>
                                             )}
                                          </div>
                                          <div className="flex items-center text-sm text-muted-foreground mb-4">
                                            <Star className="h-4 w-4 fill-current text-yellow-400 mr-1" />
                                            4.5 (23 reviews)
                                          </div>
                                        </div>

                                        <div>
                                          <h4 className="font-semibold mb-2 sm:mb-3 text-base sm:text-lg">Description</h4>
                                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                            {selectedProduct.description || selectedProduct.short_description}
                                          </p>
                                        </div>

                                        <div className="space-y-2 sm:space-y-3">
                                          <div className="flex justify-between text-xs sm:text-sm">
                                            <span>SKU:</span>
                                            <span className="font-medium">{selectedProduct.sku || 'N/A'}</span>
                                          </div>
                                          <div className="flex justify-between text-xs sm:text-sm">
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
                          className="w-full rounded-full py-4 sm:py-6 text-sm sm:text-base font-medium"
                          size="lg"
                        >
                                          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
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
                        <div className="p-4 sm:p-6">
                          <div className="mb-3 sm:mb-4">
                            <h3 className="font-semibold text-base sm:text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300 mb-2">
                              {product.name}
                            </h3>
                            {product.short_description && (
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {product.short_description}
                              </p>
                            )}
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-3 sm:mb-4">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 sm:h-4 sm:w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} 
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1 sm:ml-2">(4.5)</span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span className="font-bold text-lg sm:text-xl text-foreground">
                                {currency} {product.price.toFixed(2)}
                              </span>
                              {product.compare_price && product.compare_price > product.price && (
                                <span className="text-xs sm:text-sm text-muted-foreground line-through">
                                  {currency} {product.compare_price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 sm:gap-3">
                            <Button
                              onClick={() => handleAddToCart(product)}
                              disabled={cartLoading || product.inventory_quantity === 0}
                              className="flex-1 rounded-full font-medium text-xs sm:text-sm py-2 sm:py-2.5"
                              variant="outline"
                            >
                              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                              {product.inventory_quantity === 0 ? 'Out of Stock' : 'Add'}
                            </Button>
                            
                            <Button
                              onClick={() => navigate(`/product/${product.id}`)}
                              className="flex-1 rounded-full font-medium text-xs sm:text-sm py-2 sm:py-2.5"
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

          {/* Enhanced Results Count */}
          {!productsLoading && sortedProducts && sortedProducts.length > 0 && (
            <Card className="mt-8 sm:mt-10 md:mt-12 border-0 bg-gradient-to-r from-muted/20 to-transparent">
              <CardContent className="text-center py-6 sm:py-8 px-4">
                <p className="text-base sm:text-lg text-muted-foreground">
                  Showing <span className="font-semibold text-primary">{sortedProducts.length}</span> of <span className="font-semibold">{products?.length || 0}</span> premium products
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}