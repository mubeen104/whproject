import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useCategoryBySlug } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ShoppingCart, ChevronRight, Home, SlidersHorizontal, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useCategoryBySlug(slug || '');
  const { addToCart } = useCart();
  
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [filterOpen, setFilterOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-96 bg-muted animate-pulse" />
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
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

  // Filter and sort products
  let filteredProducts = products.filter(
    (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
  );

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
    default: // newest
      filteredProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const handleAddToCart = async (product: any) => {
    await addToCart.mutateAsync({
      productId: product.id,
      quantity: 1,
      variantId: undefined,
    });
    toast.success(`${product.name} added to cart`);
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Price Range</label>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={10000}
              step={100}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(priceRange[0])}</span>
              <span>{formatCurrency(priceRange[1])}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPriceRange([0, 10000])}
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
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
            {/* Breadcrumbs */}
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <FilterSidebar />
              </div>
            </aside>

            {/* Products Section */}
            <div className="lg:col-span-3">
              {/* Sort and Mobile Filter */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">All Products</h2>
                <div className="flex items-center gap-4">
                  {/* Mobile Filter */}
                  <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterSidebar />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
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

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No products found in this price range.</p>
                  <Button onClick={() => setPriceRange([0, 10000])} className="mt-4">
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product, index) => {
                    const mainImage = product.product_images?.[0]?.image_url || '/placeholder.svg';
                    
                    return (
                      <Card
                        key={product.id}
                        className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <CardContent className="p-0">
                          <div
                            className="relative h-64 bg-muted cursor-pointer overflow-hidden"
                            onClick={() => navigate(`/product/${product.slug}`)}
                          >
                            <img
                              src={mainImage}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            {product.is_new_arrival && (
                              <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                                New
                              </Badge>
                            )}
                            {product.is_best_seller && (
                              <Badge className="absolute top-3 right-3 bg-amber-500 text-white">
                                Best Seller
                              </Badge>
                            )}
                          </div>
                          <div className="p-4">
                            <h3
                              className="font-semibold text-lg mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                              onClick={() => navigate(`/product/${product.slug}`)}
                            >
                              {product.name}
                            </h3>
                            {product.short_description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {product.short_description}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-2xl font-bold text-primary">
                                  {formatCurrency(product.price)}
                                </span>
                                {product.compare_price && product.compare_price > product.price && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    {formatCurrency(product.compare_price)}
                                  </span>
                                )}
                              </div>
                              <Button
                                onClick={() => handleAddToCart(product)}
                                size="sm"
                                className="gap-2"
                              >
                                <ShoppingCart className="h-4 w-4" />
                                Add
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
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
    </>
  );
};

export default Category;
