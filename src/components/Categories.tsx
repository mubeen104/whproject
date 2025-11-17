import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, Coffee, Sparkles, Droplets, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUISettings } from "@/hooks/useStoreSettings";
import { useState } from "react";
import { useCarouselAutoScroll } from "@/hooks/useCarouselAutoScroll";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Categories = () => {
  const { data: categories = [], isLoading } = useCategories();
  const navigate = useNavigate();
  const { carouselScrollSpeed, animationDuration, enableSmoothScrolling } = useUISettings();
  const [carouselApi, setCarouselApi] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Use centralized auto-scroll hook
  useCarouselAutoScroll(carouselApi, isPaused);
  const getIconForCategory = (slug: string) => {
    const iconMap: {
      [key: string]: JSX.Element;
    } = {
      supplements: <Leaf className="h-8 w-8 text-primary" />,
      "teas-beverages": <Coffee className="h-8 w-8 text-primary" />,
      skincare: <Sparkles className="h-8 w-8 text-primary" />,
      "essential-oils": <Droplets className="h-8 w-8 text-primary" />,
      superfoods: <Zap className="h-8 w-8 text-primary" />
    };
    return iconMap[slug] || <Leaf className="h-8 w-8 text-primary" />;
  };
  const getImageForCategory = (slug: string) => {
    const imageMap: {
      [key: string]: string;
    } = {
      supplements: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop&crop=center",
      "teas-beverages": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop&crop=center",
      skincare: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=300&h=200&fit=crop&crop=center",
      "essential-oils": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=300&h=200&fit=crop&crop=center",
      superfoods: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&crop=center"
    };
    return imageMap[slug] || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop&crop=center";
  };
  const getColorForCategory = (slug: string) => {
    const colorMap: {
      [key: string]: string;
    } = {
      supplements: "from-amber-400 to-orange-600",
      "teas-beverages": "from-green-400 to-green-600",
      skincare: "from-pink-400 to-rose-600",
      "essential-oils": "from-purple-400 to-purple-600",
      superfoods: "from-emerald-400 to-teal-600"
    };
    return colorMap[slug] || "from-green-400 to-green-600";
  };
  if (isLoading) {
    return <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our carefully curated categories of natural wellness products, 
              each designed to support your healthy lifestyle.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {Array.from({
            length: 6
          }).map((_, index) => <Card key={index} className="border-border overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="w-full h-48" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>;
  }
  return <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/10 via-transparent to-primary/5" />
      <div className="absolute inset-0" style={{
      backgroundImage: `radial-gradient(circle at 30% 70%, hsl(var(--accent) / 0.05) 0%, transparent 50%),
                         radial-gradient(circle at 70% 30%, hsl(var(--primary) / 0.05) 0%, transparent 50%)`
    }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Section Header with SEO headings */}
        <header className="text-center mb-20 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent w-32" />
            <span className="mx-4 text-sm font-semibold text-accent uppercase tracking-wider">Herbal Categories</span>
            <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent w-32" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent">
            Shop Organic Herbal Products by Category
          </h2>
          <p className="text-2xl md:text-3xl text-muted-foreground mb-4 font-semibold">Natural Supplements, Ayurvedic Herbs & Wellness Solutions</p>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
            Explore our expertly curated categories of premium natural herbal products, organic wellness supplements, ayurvedic remedies, and holistic health solutions designed to support your healthy lifestyle journey
          </p>
        </header>

        {/* Enhanced Categories Carousel */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
              duration: enableSmoothScrolling ? 600 : 0,
              skipSnaps: false,
              dragFree: true
            }}
            className="w-full max-w-7xl mx-auto"
            setApi={setCarouselApi}
          >
          <CarouselContent className="-ml-2 md:-ml-4">
            {categories.map((category, index) => (
              <CarouselItem key={category.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/2 lg:basis-1/3">
                <Card className="group cursor-pointer border border-border/50 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:rotate-1 overflow-hidden animate-fade-in" style={{
                  animationDelay: `${index * 0.1}s`,
                  transition: `all ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
                }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                >
                  <CardContent className="p-0">
                    {/* Enhanced Category Image */}
                    <div className="relative h-40 sm:h-48 lg:h-56 overflow-hidden">
                      <img src={category.image_url || getImageForCategory(category.slug)} alt={category.name} className="w-full h-full object-cover group-hover:scale-110" 
                        style={{
                          transition: `transform 600ms cubic-bezier(0.4, 0, 0.2, 1)`
                        }} />
                      
                      {/* Enhanced Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-60 group-hover:opacity-80" 
                        style={{
                          transition: `opacity 600ms cubic-bezier(0.4, 0, 0.2, 1)`
                        }} />
                      
                      {/* Floating Icon Badge */}
                      
                      
                      {/* Category Name Overlay */}
                      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                        <h3 className="sr-only">{category.name} - Organic Herbal Products</h3>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 group-hover:text-accent"
                          style={{
                            transition: `color 600ms cubic-bezier(0.4, 0, 0.2, 1)`
                          }}>
                          {category.name}
                        </p>
                      </div>
                    </div>

                    {/* Enhanced Category Info */}
                    <div className="p-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 lg:space-y-4">
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 group-hover:text-foreground transition-colors duration-300">
                        {category.description}
                      </p>

                      <Button variant="outline" className="w-full group border-2 border-primary/20 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 transition-all duration-300 font-semibold text-xs sm:text-sm py-2 sm:py-2.5" onClick={() => {
                        navigate(`/category/${category.slug}`);
                        window.scrollTo({
                          top: 0,
                          behavior: 'smooth'
                        });
                      }}>
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          <span className="hidden sm:inline">Explore Collection</span>
                          <span className="sm:hidden">Explore</span>
                        </span>
                        <span className="ml-1 sm:ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        </div>
      </div>
    </section>;
};
export default Categories;