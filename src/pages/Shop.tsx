import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ShoppingCart, Eye, Search, Filter, Star, ChevronDown } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useGuestCart } from '@/hooks/useGuestCart';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useToast } from '@/hooks/use-toast';
import { AddToCartModal } from '@/components/AddToCartModal';
import { useShopTracking } from '@/hooks/useShopTracking';
import { supabase } from '@/integrations/supabase/client';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [productType, setProductType] = useState<string>('all'); // New state for product type
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [addToCartProduct, setAddToCartProduct] = useState<any>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [productVariants, setProductVariants] = useState<Record<string, any[]>>({});

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
  const {
    data: products,
    isLoading: productsLoading
  } = useProducts();
  const {
    data: categories,
    isLoading: categoriesLoading
  } = useCategories();
  const {
    addToCart,
    isLoading: cartLoading
  } = useGuestCart();
  const {
    currency
  } = useStoreSettings();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();

  // Filter and sort products
  const filteredProducts = products?.filter(product => {
    const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.description?.toLowerCase().includes(searchTerm.toLowerCase()) || product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || product.product_categories?.some(pc => pc.categories.slug === selectedCategory);
    const matchesType = productType === 'all' || productType === 'kits-deals' && product.is_kits_deals || productType === 'single-items' && !product.is_kits_deals;
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

  // Fetch all product variants once
  useEffect(() => {
    const fetchVariants = async () => {
      if (!sortedProducts || sortedProducts.length === 0) return;

      const { data } = await supabase
        .from('product_variants')
        .select('*')
        .eq('is_active', true)
        .in('product_id', sortedProducts.map(p => p.id));

      if (data) {
        const variantsByProduct = data.reduce((acc, variant) => {
          if (!acc[variant.product_id]) {
            acc[variant.product_id] = [];
          }
          acc[variant.product_id].push(variant);
          return acc;
        }, {} as Record<string, any[]>);
        setProductVariants(variantsByProduct);
      }
    };

    fetchVariants();
  }, [sortedProducts]);

  // Track shop page views and product list impressions
  useShopTracking(sortedProducts, selectedCategory, searchTerm);

  const handleAddToCartRequest = (product: any) => {
    setAddToCartProduct(product);
  };
  const handleAddToCart = async (productId: string, quantity: number, variantId?: string) => {
    await addToCart(productId, quantity, variantId);
  };
  const getMainImage = (product: any) => {
    if (product.product_images?.length > 0) {
      return product.product_images.sort((a: any, b: any) => a.sort_order - b.sort_order)[0].image_url;
    }
    return '/logo.png';
  };
  return (
    <>
      <Helmet>
        <title>Shop Premium Natural Herbal Products & Organic Supplements | New Era Herbals</title>
        <meta name="description" content="Browse our collection of premium natural herbal products, organic supplements, ayurvedic herbs, and wellness solutions. Shop certified organic herbs, herbal teas, natural remedies, and holistic health products." />
        <meta name="keywords" content="herbal products, natural supplements, organic health, wellness products, herbal shop, ayurvedic products, herbal medicine, natural remedies shop, organic supplements online, herbal wellness, natural health store" />
        <link rel="canonical" content="https://www.neweraherbals.com/shop" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.neweraherbals.com/shop" />
        <meta property="og:title" content="Shop Premium Natural Herbal Products & Organic Supplements" />
        <meta property="og:description" content="Browse our collection of premium natural herbal products and organic wellness solutions." />
        <meta property="og:image" content="https://www.neweraherbals.com/logo.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Shop Premium Natural Herbal Products" />
        <meta name="twitter:description" content="Browse our collection of premium natural herbal products and organic wellness solutions." />
        <meta name="twitter:image" content="https://www.neweraherbals.com/logo.png" />
        
        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.neweraherbals.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Shop",
                "item": "https://www.neweraherbals.com/shop"
              }
            ]
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
      
      {/* Hero Section with SEO-optimized headings */}
      <section className="relative overflow-hidden bg-muted/20 border-b">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23059669%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">Premium Organic Herbal Products & Natural Supplements</h1>
            <p className="text-2xl md:text-3xl text-muted-foreground mb-4 font-semibold">Ayurvedic Wellness Solutions for Holistic Health & Natural Healing</p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our curated collection of certified organic supplements, ayurvedic herbs, herbal teas, and natural remedies for complete wellness
            </p>
          </div>
        </div>
      </section>
      
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
          {/* Modern Filters Section */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-2xl mx-auto">
                
                
              </div>
            </div>

            {/* Collapsible Filter Pills */}
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <Card className="relative border-0 shadow-2xl bg-gradient-to-br from-card/95 via-card/90 to-muted/30 backdrop-blur-xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all duration-500 rounded-2xl overflow-hidden">
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 opacity-50 rounded-2xl" />
                <div className="absolute inset-[1px] bg-gradient-to-br from-card/95 via-card/90 to-muted/30 backdrop-blur-xl rounded-2xl" />
                
                <CardContent className="relative p-6 sm:p-8">
                  <div className="space-y-6">
                    {/* Filter Header with Toggle */}
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent group">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl transition-all duration-300 group-hover:from-primary/30 group-hover:to-accent/30 group-hover:scale-110">
                            <Filter className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <span className="block font-bold text-lg text-foreground">Filters</span>
                            <span className="block text-sm text-muted-foreground">Refine your search</span>
                          </div>
                          {(productType !== 'all' || selectedCategory !== 'all' || searchTerm) && <Badge variant="secondary" className="ml-2 h-6 px-3 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all duration-300">
                              {[productType !== 'all' ? 1 : 0, selectedCategory !== 'all' ? 1 : 0, searchTerm ? 1 : 0].reduce((a, b) => a + b, 0)} active
                            </Badge>}
                        </div>
                        <div className="p-2 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-all duration-300">
                          <ChevronDown className={`h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-300 ${isFiltersOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-6 animate-accordion-down data-[state=closed]:animate-accordion-up">
                      {/* Elegant Divider */}
                      <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                      
                      {/* Filter Pills Layout */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Product Type Filter */}
                        <div className="space-y-3 group">
                          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <div className="w-2 h-2 bg-gradient-to-r from-primary to-accent rounded-full" />
                            Product Type
                          </label>
                          <Select value={productType} onValueChange={setProductType}>
                            <SelectTrigger className="h-12 border-2 border-border/50 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md">
                              <div className="flex items-center">
                                <div className="p-1.5 bg-primary/10 rounded-lg mr-3">
                                  <ShoppingCart className="h-4 w-4 text-primary" />
                                </div>
                                <SelectValue placeholder="Select type" />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-2 shadow-xl backdrop-blur-xl">
                              <SelectItem value="all">All Products</SelectItem>
                              <SelectItem value="single-items">Single Items</SelectItem>
                              <SelectItem value="kits-deals">Kits & Deals</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Category Filter */}
                        <div className="space-y-3 group">
                          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <div className="w-2 h-2 bg-gradient-to-r from-accent to-secondary rounded-full" />
                            Category
                          </label>
                          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="h-12 border-2 border-border/50 rounded-xl hover:border-accent/50 hover:bg-accent/5 transition-all duration-300 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-2 shadow-xl backdrop-blur-xl">
                              <SelectItem value="all">All Categories</SelectItem>
                              {categories?.map(category => <SelectItem key={category.id} value={category.slug}>
                                  {category.name}
                                </SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Sort Filter */}
                        <div className="space-y-3 group">
                          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <div className="w-2 h-2 bg-gradient-to-r from-secondary to-primary rounded-full" />
                            Sort By
                          </label>
                          <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-12 border-2 border-border/50 rounded-xl hover:border-secondary/50 hover:bg-secondary/5 transition-all duration-300 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md">
                              <SelectValue placeholder="Sort options" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-2 shadow-xl backdrop-blur-xl">
                              <SelectItem value="newest">Newest First</SelectItem>
                              <SelectItem value="name">Name A-Z</SelectItem>
                              <SelectItem value="price-low">Price: Low to High</SelectItem>
                              <SelectItem value="price-high">Price: High to Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Active Filters Display */}
                      {(productType !== 'all' || selectedCategory !== 'all' || searchTerm) && <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/20 rounded-xl border border-border/30 backdrop-blur-sm">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                              Active filters:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {productType !== 'all' && <Badge variant="secondary" className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 hover:scale-105 bg-primary/10 text-primary border-primary/20 px-3 py-1" onClick={() => setProductType('all')}>
                                  {productType === 'kits-deals' ? 'Kits & Deals' : 'Single Items'} ✕
                                </Badge>}
                              {selectedCategory !== 'all' && <Badge variant="secondary" className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 hover:scale-105 bg-accent/10 text-accent border-accent/20 px-3 py-1" onClick={() => setSelectedCategory('all')}>
                                  {categories?.find(c => c.slug === selectedCategory)?.name} ✕
                                </Badge>}
                              {searchTerm && <Badge variant="secondary" className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 hover:scale-105 bg-secondary/10 text-secondary border-secondary/20 px-3 py-1" onClick={() => setSearchTerm('')}>
                                  "{searchTerm}" ✕
                                </Badge>}
                            </div>
                          </div>
                        </div>}
                    </CollapsibleContent>
                  </div>
                </CardContent>
              </Card>
            </Collapsible>
          </div>

          {/* Products Grid */}
          {productsLoading ? <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {[...Array(8)].map((_, i) => <div key={i} className="group relative">
                  <div className="relative bg-card/40 backdrop-blur-xl border border-border/20 rounded-3xl p-1 shadow-lg">
                    <Card className="relative bg-card/80 backdrop-blur-sm border-0 rounded-3xl overflow-hidden shadow-none">
                      <CardContent className="p-0">
                        <Skeleton className="w-full aspect-square rounded-t-3xl" />
                        <div className="p-6 space-y-4">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                          <div className="flex gap-1 mb-3">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-4 w-4 rounded-full" />)}
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
                </div>)}
            </div> : sortedProducts?.length === 0 ? <Card className="border-2 shadow-xl bg-muted/10 hover:shadow-2xl transition-all duration-300">
              <CardContent className="text-center py-12 sm:py-16 md:py-20 px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-all duration-300 hover:scale-110">
                  <Search className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">No products found</h3>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-md mx-auto">
                  {searchTerm || selectedCategory !== 'all' ? 'Try adjusting your search or filters to find what you\'re looking for' : 'No products are currently available in our collection'}
                </p>
              </CardContent>
            </Card> : <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {sortedProducts?.map((product, index) => <div
                key={product.id}
                className="group relative animate-fade-in hover-scale cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/product/${product.slug}`)}
              >
                  {/* Schema.org microdata for Meta Pixel catalog detection */}
                  {/* If product has variants, include microdata for each variant */}
                  {productVariants[product.id]?.length > 0 ? (
                    productVariants[product.id].map((variant: any) => (
                      <div key={variant.id} itemScope itemType="https://schema.org/Product" style={{ display: 'none' }}>
                        <meta itemProp="productID" content={variant.sku || variant.id} />
                        <meta itemProp="sku" content={variant.sku || variant.id} />
                        <meta itemProp="name" content={`${product.name} - ${variant.name}`} />
                        <meta itemProp="description" content={variant.description || product.description || product.short_description || ''} />
                        <meta itemProp="image" content={getMainImage(product)} />
                        <meta itemProp="brand" content="New Era Herbals" />
                        <link itemProp="availability" href={variant.inventory_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
                        <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
                          <meta itemProp="price" content={(variant.price || product.price).toString()} />
                          <meta itemProp="priceCurrency" content="PKR" />
                          <meta itemProp="availability" content={variant.inventory_quantity > 0 ? "in stock" : "out of stock"} />
                          <link itemProp="availability" href={variant.inventory_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
                          <meta itemProp="url" content={`https://www.neweraherbals.com/product/${product.slug || product.id}`} />
                        </div>
                      </div>
                    ))
                  ) : (
                    /* No variants - single microdata for parent product */
                    <div itemScope itemType="https://schema.org/Product" style={{ display: 'none' }}>
                      <meta itemProp="productID" content={product.sku || product.id} />
                      <meta itemProp="sku" content={product.sku || product.id} />
                      <meta itemProp="name" content={product.name} />
                      <meta itemProp="description" content={product.description || product.short_description || ''} />
                      <meta itemProp="image" content={getMainImage(product)} />
                      <meta itemProp="brand" content="New Era Herbals" />
                      <link itemProp="availability" href={product.inventory_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
                      <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
                        <meta itemProp="price" content={product.price.toString()} />
                        <meta itemProp="priceCurrency" content="PKR" />
                        <meta itemProp="availability" content={product.inventory_quantity > 0 ? "in stock" : "out of stock"} />
                        <link itemProp="availability" href={product.inventory_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
                        <meta itemProp="url" content={`https://www.neweraherbals.com/product/${product.slug || product.id}`} />
                      </div>
                    </div>
                  )}

                  {/* Floating Card Container */}
                  <div className="relative bg-card/40 backdrop-blur-xl border border-border/20 rounded-3xl p-1 shadow-lg group-hover:shadow-2xl transition-all duration-700 group-hover:border-primary/30">
                    {/* Gradient Border Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                    
                    <Card className="relative bg-card/80 backdrop-blur-sm border-0 rounded-3xl overflow-hidden shadow-none">
                      <CardContent className="p-0">
                        {/* Product Image Container */}
                         <div className="relative overflow-hidden rounded-t-3xl aspect-square">
                           <img src={getMainImage(product)} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                          
                           {/* Sale Badge Only */}
                           {product.compare_price && product.compare_price > product.price && <div className="absolute top-3 left-3">
                               <Badge className="bg-red-500/90 backdrop-blur-sm text-white shadow-lg border-0 rounded-full px-3 py-1 text-xs font-medium">
                                 Sale
                               </Badge>
                             </div>}

                          {/* Out of Stock Overlay */}
                          {product.inventory_quantity === 0 && <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center rounded-t-3xl">
                              <Badge variant="secondary" className="text-base font-medium py-2 px-4 rounded-full shadow-lg">
                                Out of Stock
                              </Badge>
                            </div>}

                          {/* Quick Actions Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-t-3xl">
                            <div className="flex gap-3">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" className="bg-white/95 text-foreground hover:bg-white rounded-full px-4 py-2 shadow-lg border-0" onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Quick View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-2xl">{product.name}</DialogTitle>
                                  </DialogHeader>
                                  {selectedProduct && <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                      <div className="space-y-4">
                                        <img src={getMainImage(selectedProduct)} alt={selectedProduct.name} className="w-full aspect-square object-contain rounded-2xl" />
                                        {selectedProduct.product_images?.length > 1 && <div className="grid grid-cols-4 gap-3">
                                            {selectedProduct.product_images.slice(1, 5).map((image: any) => <img key={image.id} src={image.image_url} alt={image.alt_text || selectedProduct.name} className="w-full aspect-square object-contain rounded-xl border" />)}
                                          </div>}
                                      </div>
                                      
                                      <div className="space-y-6">
                                        <div>
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                             <span className="text-2xl sm:text-3xl font-bold text-foreground">
                                               {currency} {selectedProduct.price.toFixed(2)}
                                             </span>
                                             {selectedProduct.compare_price && selectedProduct.compare_price > selectedProduct.price && <span className="text-base sm:text-lg text-muted-foreground line-through">
                                                 {currency} {selectedProduct.compare_price.toFixed(2)}
                                               </span>}
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
                                              {selectedProduct.inventory_quantity > 0 ? `${selectedProduct.inventory_quantity} in stock` : 'Out of stock'}
                                            </span>
                                          </div>
                                        </div>

                        <Button onClick={() => handleAddToCartRequest(selectedProduct)} disabled={cartLoading || selectedProduct.inventory_quantity === 0} className="w-full rounded-full py-4 sm:py-6 text-sm sm:text-base font-medium" size="lg">
                                          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                          {selectedProduct.inventory_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </Button>
                                      </div>
                                    </div>}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-2 sm:p-4 lg:p-6">
                          <div className="mb-2 sm:mb-3">
                            <h3 className="font-semibold text-sm sm:text-base lg:text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300 mb-1 sm:mb-2">
                              {product.name}
                            </h3>
                            {product.short_description && <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {product.short_description}
                              </p>}
                          </div>

                          {/* Rating */}
                          

                          {/* Price */}
                          <div className="flex items-center justify-between mb-2 sm:mb-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-sm sm:text-lg text-foreground">
                                {currency} {product.price.toFixed(2)}
                              </span>
                              {product.compare_price && product.compare_price > product.price && <span className="text-xs text-muted-foreground line-through">
                                  {currency} {product.compare_price.toFixed(2)}
                                </span>}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <Button onClick={(e) => { e.stopPropagation(); handleAddToCartRequest(product); }} disabled={cartLoading || product.inventory_quantity === 0} className="flex-1 rounded-full font-medium text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3" variant="outline">
                              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                              {product.inventory_quantity === 0 ? 'Out of Stock' : 'Add'}
                            </Button>
                            
                            <Button onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.slug}`); }} className="flex-1 rounded-full font-medium text-xs sm:text-sm py-2 sm:py-2.5">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>)}
            </div>}

          {/* Enhanced Results Count */}
          {!productsLoading && sortedProducts && sortedProducts.length > 0 && <Card className="mt-8 sm:mt-10 md:mt-12 border-0 bg-gradient-to-r from-muted/20 to-transparent">
              <CardContent className="text-center py-6 sm:py-8 px-4">
                <p className="text-base sm:text-lg text-muted-foreground">
                  Showing <span className="font-semibold text-primary">{sortedProducts.length}</span> of <span className="font-semibold">{products?.length || 0}</span> premium products
                </p>
              </CardContent>
            </Card>}
        </div>
      </main>

        <Footer />

        {/* Add to Cart Modal */}
        {addToCartProduct && <AddToCartModal product={addToCartProduct} isOpen={!!addToCartProduct} onClose={() => setAddToCartProduct(null)} onAddToCart={handleAddToCart} isLoading={cartLoading} />}
      </div>
    </>
  );
}