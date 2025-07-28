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
import { useCart } from '@/hooks/useCart';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useToast } from '@/hooks/use-toast';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Update search term and category when URL changes
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || 'all';
    setSearchTerm(urlSearch);
    setSelectedCategory(urlCategory);
  }, [searchParams]);

  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { addToCart } = useCart();
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23059669%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block p-1 bg-gradient-to-r from-primary to-accent rounded-full mb-6">
              <div className="bg-background rounded-full px-6 py-2">
                <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Premium Collection
                </span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
              Shop
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover our collection of premium natural products crafted for your wellness journey.
            </p>
          </div>
        </div>
      </section>
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          {/* Enhanced Filters and Search */}
          <Card className="mb-12 border-0 shadow-xl bg-gradient-to-r from-card/80 to-muted/20 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search for natural products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 text-lg border-2 focus:border-primary/50 rounded-xl transition-all duration-300 bg-background/50"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 lg:w-auto">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-56 h-14 border-2 rounded-xl">
                      <div className="flex items-center">
                        <Filter className="h-5 w-5 mr-3 text-primary" />
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
                    <SelectTrigger className="w-full sm:w-56 h-14 border-2 rounded-xl">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden border-0 shadow-lg">
                  <Skeleton className="h-80 w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="h-5 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-1/2 mb-6" />
                    <div className="flex gap-3">
                      <Skeleton className="h-12 flex-1" />
                      <Skeleton className="h-12 w-12" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedProducts?.length === 0 ? (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-muted/20 to-background">
              <CardContent className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                  <Search className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4">No products found</h3>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filters to find what you\'re looking for'
                    : 'No products are currently available in our collection'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sortedProducts?.map((product, index) => (
                <Card 
                  key={product.id} 
                  className="group overflow-hidden border-0 bg-gradient-to-br from-card to-muted/10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in"
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
                    
                    {/* Enhanced Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.is_featured && (
                        <Badge className="bg-gradient-to-r from-primary to-accent text-white shadow-lg backdrop-blur-sm">
                          ⭐ Featured
                        </Badge>
                      )}
                    </div>
                    
                    {product.compare_price && product.compare_price > product.price && (
                      <Badge className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg backdrop-blur-sm">
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
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="secondary"
                            size="lg"
                            className="bg-white/95 text-foreground hover:bg-white shadow-xl backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-transform duration-300"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <Eye className="h-5 w-5 mr-2" />
                            Quick View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
                                     <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
                                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
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
                      <span className="font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
                        className="flex-1 h-12 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300"
                        variant="outline"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {product.inventory_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                      
                      <Button
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="flex-1 h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Enhanced Results Count */}
          {!productsLoading && sortedProducts && sortedProducts.length > 0 && (
            <Card className="mt-12 border-0 bg-gradient-to-r from-muted/20 to-transparent">
              <CardContent className="text-center py-8">
                <p className="text-lg text-muted-foreground">
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