import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Categories = () => {
  const categories = [
    {
      name: "Herbal Teas",
      description: "Premium organic tea blends",
      image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop&crop=center",
      productCount: "45+ products",
      color: "from-green-400 to-green-600"
    },
    {
      name: "Supplements",
      description: "Natural health supplements",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=200&fit=crop&crop=center",
      productCount: "60+ products",
      color: "from-amber-400 to-orange-600"
    },
    {
      name: "Essential Oils",
      description: "Pure therapeutic grade oils",
      image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=300&h=200&fit=crop&crop=center",
      productCount: "30+ products",
      color: "from-purple-400 to-purple-600"
    },
    {
      name: "Skincare",
      description: "Natural beauty products",
      image: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=300&h=200&fit=crop&crop=center",
      productCount: "25+ products",
      color: "from-pink-400 to-rose-600"
    },
    {
      name: "Superfoods",
      description: "Nutrient-dense whole foods",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&crop=center",
      productCount: "35+ products",
      color: "from-emerald-400 to-teal-600"
    },
    {
      name: "Gift Sets",
      description: "Curated wellness bundles",
      image: "https://images.unsplash.com/photo-1549062572-544a64fb0c56?w=300&h=200&fit=crop&crop=center",
      productCount: "15+ products",
      color: "from-blue-400 to-indigo-600"
    }
  ];

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
              key={category.name}
              className="group cursor-pointer hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border-border overflow-hidden"
            >
              <CardContent className="p-0">
                {/* Category Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
                  
                  {/* Product Count Badge */}
                  <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-card-foreground px-2 py-1 rounded text-xs font-medium">
                    {category.productCount}
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