import { useNavigate } from 'react-router-dom';
import { useFeaturedCategories } from '@/hooks/useCategories';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const FeaturedCategories = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useFeaturedCategories();

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Featured Collections</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Explore Our Categories
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover premium herbal products carefully curated for your wellness journey
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const gradientClass = category.color_scheme || 'from-green-400 to-green-600';
            
            return (
              <Card
                key={category.id}
                className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 hover:border-primary/50 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/category/${category.slug}`)}
              >
                <CardContent className="p-0">
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-60 group-hover:opacity-40 transition-opacity duration-300`} />
                    
                    {/* Floating Badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-foreground shadow-lg">
                      Featured
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 bg-card">
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                        {category.description}
                      </p>
                    )}
                    
                    {/* CTA Button */}
                    <Button
                      variant="ghost"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/category/${category.slug}`);
                      }}
                    >
                      <span>Explore Collection</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>

                  {/* Decorative Border Effect */}
                  <div className={`absolute inset-0 border-2 border-transparent bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} style={{ margin: '-2px', borderRadius: 'inherit' }} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/shop')}
            className="group"
          >
            View All Products
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
