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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Shop</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts?.map((product) => (
                <Card key={product.id} className="group overflow-hidden border-0 bg-card shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                  <div className="relative overflow-hidden">
                    <img
                      src={getMainImage(product)}
                      alt={product.name}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.is_featured && (
                        <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    {product.compare_price && product.compare_price > product.price && (
                      <Badge className="absolute top-3 right-3 bg-destructive/90 text-destructive-foreground backdrop-blur-sm">
                        Sale
                      </Badge>
                    )}

                    {/* Out of Stock Overlay */}
                    {product.inventory_quantity === 0 && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                        <Badge variant="secondary" className="text-lg font-medium">Out of Stock</Badge>
                      </div>
                    )}

                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
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
                                       PKR {selectedProduct.price.toFixed(2)}
                                     </span>
                                     {selectedProduct.compare_price && selectedProduct.compare_price > selectedProduct.price && (
                                       <span className="text-lg text-muted-foreground line-through">
                                         PKR {selectedProduct.compare_price.toFixed(2)}
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

                                <Button
                                  onClick={() => handleAddToCart(selectedProduct)}
                                  disabled={addToCart.isPending || selectedProduct.inventory_quantity === 0}
                                  className="w-full"
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
                  
                  <CardContent className="p-5">
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
                        PKR {product.price.toFixed(2)}
                      </span>
                      {product.compare_price && product.compare_price > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          PKR {product.compare_price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={addToCart.isPending || product.inventory_quantity === 0}
                        className="flex-1 h-9"
                        variant="outline"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {product.inventory_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                      
                      <Button
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="flex-1 h-9"
                        size="sm"
                      >
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Results Count */}
          {!productsLoading && sortedProducts && sortedProducts.length > 0 && (
            <div className="text-center mt-8 text-muted-foreground">
              Showing {sortedProducts.length} of {products?.length || 0} products
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}