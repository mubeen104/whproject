import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, Coffee, Sparkles, Droplets, Zap } from "lucide-react";

const Categories = () => {
  const { data: categories = [], isLoading } = useCategories();

  const getIconForCategory = (slug: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      supplements: <Leaf className="h-8 w-8 text-primary" />,
      "teas-beverages": <Coffee className="h-8 w-8 text-primary" />,
      skincare: <Sparkles className="h-8 w-8 text-primary" />,
      "essential-oils": <Droplets className="h-8 w-8 text-primary" />,
      superfoods: <Zap className="h-8 w-8 text-primary" />
    };
    return iconMap[slug] || <Leaf className="h-8 w-8 text-primary" />;
  };

  const getImageForCategory = (slug: string) => {
    const imageMap: { [key: string]: string } = {
      supplements: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop&crop=center",
      "teas-beverages": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop&crop=center",
      skincare: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=300&h=200&fit=crop&crop=center",
      "essential-oils": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=300&h=200&fit=crop&crop=center",
      superfoods: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&crop=center"
    };
    return imageMap[slug] || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop&crop=center";
  };

  const getColorForCategory = (slug: string) => {
    const colorMap: { [key: string]: string } = {
      supplements: "from-amber-400 to-orange-600",
      "teas-beverages": "from-green-400 to-green-600",
      skincare: "from-pink-400 to-rose-600",
      "essential-oils": "from-purple-400 to-purple-600",
      superfoods: "from-emerald-400 to-teal-600"
    };
    return colorMap[slug] || "from-green-400 to-green-600";
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="border-border overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="w-full h-48" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Shop by Category
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our carefully curated categories of natural wellness products, 
            each designed to support your healthy lifestyle.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className="group cursor-pointer hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border-border overflow-hidden"
            >
              <CardContent className="p-0">
                {/* Category Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={category.image_url || getImageForCategory(category.slug)}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getColorForCategory(category.slug)} opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
                  
                  {/* Icon Badge */}
                  <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-card-foreground p-2 rounded-full">
                    {getIconForCategory(category.slug)}
                  </div>
                </div>

                {/* Category Info */}
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    {category.name}
                  </h3>
                  
                  <p className="text-muted-foreground">
                    {category.description}
                  </p>

                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
                  >
                    Shop Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;