import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useCategoryBySlug } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ShoppingCart, ChevronRight, Home, SlidersHorizontal, X, Eye, ChevronDown, Filter, Star } from 'lucide-react';
import { useGuestCart } from '@/hooks/useGuestCart';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AddToCartModal } from '@/components/AddToCartModal';
import { useProductRatings } from '@/hooks/useProductRatings';
import { ProductRating } from '@/components/ProductRating';

const PRODUCTS_PER_PAGE = 12;

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useCategoryBySlug(slug || '');
  const { addToCart } = useGuestCart();
  const { currency } = useStoreSettings();
  const { toast } = useToast();

  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [addToCartProduct, setAddToCartProduct] = useState<any>(null);
  const [comparisonProducts, setComparisonProducts] = useState<any[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState(PRODUCTS_PER_PAGE);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useRef<HTMLDivElement | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-96 bg-muted animate-pulse" />
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 gap-8">
            <Skeleton className="h-48 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-96 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
          <Button onClick={() => navigate('/shop')}>Browse Shop</Button>
        </div>
      </div>
    );
  }

  const { category, products, relatedCategories } = data;

  // Get subcategories
  const subcategories = relatedCategories.filter(cat => cat.parent_id === category.id);

  // Filter products
  let filteredProducts = products.filter((p) => {
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    const matchesStock = !showInStockOnly || p.inventory_quantity > 0;
    const matchesSubcategory = selectedSubcategories.length === 0 || selectedSubcategories.includes(p.category_id);
    return matchesPrice && matchesStock && matchesSubcategory;
  });

  // Sort products
  switch (sortBy) {
    case 'price-asc':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      filteredProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Pagination
  const paginatedProducts = filteredProducts.slice(0, displayedProducts);
  const productIds = paginatedProducts.map(p => p.id);
  const { data: ratings = [] } = useProductRatings(productIds);

  // Infinite scroll
  useEffect(() => {
    setHasMore(displayedProducts < filteredProducts.length);
  }, [displayedProducts, filteredProducts.length]);

  const loadMore = useCallback(() => {
    if (displayedProducts < filteredProducts.length) {
      setDisplayedProducts(prev => Math.min(prev + PRODUCTS_PER_PAGE, filteredProducts.length));
    }
  }, [displayedProducts, filteredProducts.length]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (lastProductRef.current) {
      observerRef.current.observe(lastProductRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loadMore]);

  // Reset pagination when filters change
  useEffect(() => {
    setDisplayedProducts(PRODUCTS_PER_PAGE);
  }, [sortBy, priceRange, showInStockOnly, selectedSubcategories]);

  const getMainImage = (product: any) => {
    return product.product_images?.[0]?.image_url || '/placeholder.svg';
  };

  const handleAddToCartRequest = (product: any) => {
    setAddToCartProduct(product);
  };

  const handleAddToCart = async (productId: string, quantity: number, variantId?: string) => {
    await addToCart.mutateAsync({ productId, quantity, variantId });
    setAddToCartProduct(null);
    toast({ title: 'Success', description: 'Product added to cart' });
  };

  const toggleSubcategory = (categoryId: string) => {
    setSelectedSubcategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleComparison = (product: any) => {
    setComparisonProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else if (prev.length < 4) {
        return [...prev, product];
      } else {
        toast({ title: 'Limit Reached', description: 'You can compare up to 4 products', variant: 'destructive' });
        return prev;
      }
    });
  };

  const clearFilters = () => {
    setPriceRange([0, 10000]);
    setShowInStockOnly(false);
    setSelectedSubcategories([]);
  };

  const activeFiltersCount =
    (priceRange[0] !== 0 || priceRange[1] !== 10000 ? 1 : 0) +
    (showInStockOnly ? 1 : 0) +
    selectedSubcategories.length;

  const FilterSection = () => (
    <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
      <Card className="border-2 border-border/50 bg-card/40 backdrop-blur-xl shadow-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-6 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg">Filters</h3>
                <p className="text-xs text-muted-foreground">Refine your search</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="rounded-full">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-200 ${
                  isFiltersOpen ? 'transform rotate-180' : ''
                }`}
              />
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-6 pt-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price Range */}
              <div>
                <label className="text-sm font-semibold mb-3 block">Price Range</label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={10000}
                  step={100}
                  className="mb-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{currency} {priceRange[0]}</span>
                  <span>{currency} {priceRange[1]}</span>
                </div>
              </div>

              {/* Stock Filter */}
              <div>
                <label className="text-sm font-semibold mb-3 block">Availability</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="in-stock"
                    checked={showInStockOnly}
                    onCheckedChange={(checked) => setShowInStockOnly(!!checked)}
                  />
                  <label
                    htmlFor="in-stock"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    In Stock Only
                  </label>
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-semibold mb-3 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name: A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subcategories */}
            {subcategories.length > 0 && (
              <div>
                <label className="text-sm font-semibold mb-3 block">Subcategories</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {subcategories.map(subcat => (
                    <Button
                      key={subcat.id}
                      variant={selectedSubcategories.includes(subcat.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleSubcategory(subcat.id)}
                      className="justify-start"
                    >
                      {subcat.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Active Filters & Clear */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
                </span>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );

  const gradientClass = category.color_scheme || 'from-green-400 to-green-600';

  return (
    <>
      <Helmet>
        <title>{category.name} | Natural Earth Herbals</title>
        <meta
          name="description"
          content={category.description || `Browse our ${category.name} collection`}
        />
        <link rel="canonical" href={`https://yourdomain.com/category/${category.slug}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-96 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${category.banner_image_url || category.image_url})`,
            }}
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-80`} />
          <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
            <nav className="flex items-center space-x-2 text-sm text-white/90 mb-4">
              <Link to="/" className="hover:text-white transition-colors">
                <Home className="h-4 w-4" />
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/shop" className="hover:text-white transition-colors">
                Shop
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white font-medium">{category.name}</span>
            </nav>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xl text-white/90 max-w-2xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {category.description}
              </p>
            )}
            <div className="mt-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-lg px-4 py-2">
                {filteredProducts.length} Products
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="space-y-8">
            {/* Filters */}
            <FilterSection />

            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="default" className="ml-2 rounded-full">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSection />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Product Comparison Bar */}
            {comparisonProducts.length > 0 && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Comparing {comparisonProducts.length} product{comparisonProducts.length > 1 ? 's' : ''}</span>
                    {comparisonProducts.map(p => (
                      <Badge key={p.id} variant="secondary" className="gap-1">
                        {p.name}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => toggleComparison(p)} />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => {/* Open comparison modal */}}>
                      Compare
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setComparisonProducts([])}>
                      Clear
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">No products found with current filters.</p>
                <Button onClick={clearFilters}>Reset Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map((product, index) => {
                  const isLastProduct = index === paginatedProducts.length - 1;
                  const isInComparison = comparisonProducts.some(p => p.id === product.id);

                  return (
                    <div
                      key={product.id}
                      ref={isLastProduct ? lastProductRef : null}
                      className="group relative animate-fade-in cursor-pointer"
                      style={{
                        animationDelay: `${index * 0.05}s`,
                        transition: 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                        willChange: 'transform'
                      }}
                      onClick={() => navigate(`/product/${product.slug}`)}
                    >
                      {/* Floating Card Container */}
                      <div className="relative bg-card/40 backdrop-blur-xl border border-border/20 rounded-3xl p-1 shadow-lg group-hover:shadow-2xl group-hover:border-primary/30 group-hover:scale-105"
                        style={{ transition: 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)', willChange: 'transform, box-shadow, border-color' }}>

                        {/* Gradient Border Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-sm"
                          style={{ transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)' }} />

                        <Card className="relative overflow-hidden border-0 bg-card rounded-3xl">
                          <CardContent className="p-0">
                            {/* Image Container */}
                            <div className="relative aspect-square bg-muted rounded-t-3xl overflow-hidden">
                              <img
                                src={getMainImage(product)}
                                alt={product.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                              />

                              {/* Badges */}
                              {product.compare_price && product.compare_price > product.price && (
                                <Badge className="absolute top-3 left-3 bg-red-500 text-white rounded-full shadow-lg backdrop-blur-sm">
                                  Sale
                                </Badge>
                              )}
                              {product.is_new_arrival && (
                                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground rounded-full shadow-lg backdrop-blur-sm">
                                  New
                                </Badge>
                              )}
                              {product.is_best_seller && (
                                <Badge className="absolute top-3 right-3 bg-amber-500 text-white rounded-full shadow-lg backdrop-blur-sm">
                                  Best Seller
                                </Badge>
                              )}

                              {/* Comparison Checkbox */}
                              <div className="absolute top-3 left-3 z-10">
                                <Checkbox
                                  checked={isInComparison}
                                  onCheckedChange={() => toggleComparison(product)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="bg-white/90 backdrop-blur"
                                />
                              </div>

                              {/* Out of Stock Overlay */}
                              {product.inventory_quantity === 0 && (
                                <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center rounded-t-3xl">
                                  <Badge variant="secondary" className="text-base font-medium py-2 px-4 rounded-full shadow-lg">
                                    Out of Stock
                                  </Badge>
                                </div>
                              )}

                              {/* Quick View Overlay */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-t-3xl">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="bg-white/95 text-foreground hover:bg-white rounded-full px-4 py-2 shadow-lg border-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedProduct(product);
                                      }}
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
                                        <div>
                                          <img
                                            src={getMainImage(selectedProduct)}
                                            alt={selectedProduct.name}
                                            className="w-full aspect-square object-contain rounded-2xl"
                                          />
                                        </div>
                                        <div className="space-y-4">
                                          <div className="text-3xl font-bold">
                                            {currency} {selectedProduct.price.toFixed(2)}
                                          </div>
                                          <ProductRating
                                            averageRating={ratings.find(r => r.productId === selectedProduct.id)?.averageRating || 0}
                                            reviewCount={ratings.find(r => r.productId === selectedProduct.id)?.reviewCount || 0}
                                            size="md"
                                          />
                                          <p className="text-muted-foreground">
                                            {selectedProduct.description || selectedProduct.short_description}
                                          </p>
                                          <Button
                                            className="w-full"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleAddToCartRequest(selectedProduct);
                                            }}
                                            disabled={selectedProduct.inventory_quantity === 0}
                                          >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            {selectedProduct.inventory_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>

                            {/* Product Info */}
                            <div className="p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3">
                              <h3 className="font-bold text-sm sm:text-base lg:text-lg line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                                {product.name}
                              </h3>

                              {product.short_description && (
                                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2">
                                  {product.short_description}
                                </p>
                              )}

                              {/* Price */}
                              <div className="flex items-center justify-between mb-2 sm:mb-4">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-bold text-sm sm:text-lg lg:text-xl text-foreground">
                                    {currency} {product.price.toFixed(2)}
                                  </span>
                                  {product.compare_price && product.compare_price > product.price && (
                                    <span className="text-xs sm:text-sm text-muted-foreground line-through">
                                      {currency} {product.compare_price.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Rating */}
                              <div className="mb-2 sm:mb-4">
                                <ProductRating
                                  averageRating={ratings.find(r => r.productId === product.id)?.averageRating || 0}
                                  reviewCount={ratings.find(r => r.productId === product.id)?.reviewCount || 0}
                                  showCount={true}
                                  size="sm"
                                />
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCartRequest(product);
                                  }}
                                  disabled={product.inventory_quantity === 0}
                                  className="flex-1 rounded-full font-medium text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3"
                                  variant="outline"
                                >
                                  <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                  <span className="hidden sm:inline">
                                    {product.inventory_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                  </span>
                                  <span className="sm:hidden">Add</span>
                                </Button>

                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/product/${product.slug}`);
                                  }}
                                  className="flex-1 rounded-full font-medium text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3"
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Schema.org Structured Data */}
                      <div itemScope itemType="https://schema.org/Product" className="hidden">
                        <meta itemProp="name" content={product.name} />
                        <meta itemProp="description" content={product.short_description || product.description} />
                        <meta itemProp="image" content={getMainImage(product)} />
                        <meta itemProp="sku" content={product.sku || product.id} />
                        <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
                          <meta itemProp="price" content={product.price.toString()} />
                          <meta itemProp="priceCurrency" content="USD" />
                          <meta itemProp="availability" content={product.inventory_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Loading More Indicator */}
            {hasMore && (
              <div className="text-center py-8">
                <Skeleton className="h-12 w-full max-w-md mx-auto" />
              </div>
            )}
          </div>
        </div>

        {/* Related Categories */}
        {relatedCategories.length > 0 && (
          <div className="bg-muted/30 py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8">Explore More Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {relatedCategories.map((cat) => (
                  <Card
                    key={cat.id}
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
                    onClick={() => navigate(`/category/${cat.slug}`)}
                  >
                    <CardContent className="p-0">
                      <div className="relative h-32 bg-muted">
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${cat.color_scheme || 'from-green-400 to-green-600'} opacity-40 group-hover:opacity-60 transition-opacity`} />
                      </div>
                      <div className="p-3 text-center">
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {cat.name}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add to Cart Modal */}
      {addToCartProduct && (
        <AddToCartModal
          product={addToCartProduct}
          onClose={() => setAddToCartProduct(null)}
          onAddToCart={handleAddToCart}
          isLoading={addToCart.isPending}
        />
      )}
    </>
  );
};

export default Category;
