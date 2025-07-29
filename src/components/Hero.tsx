import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Star } from "lucide-react";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import heroImage from "@/assets/hero-herbals.jpg";
const Hero = () => {
  const {
    storeName,
    storeDescription,
    currency
  } = useStoreSettings();

  return (
    <section id="hero" className="relative bg-background min-h-[85vh] flex items-center overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary) / 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, hsl(var(--accent) / 0.1) 0%, transparent 50%)`
        }} />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-20 h-20 bg-primary/10 rounded-full animate-pulse opacity-60" />
      <div className="absolute top-40 left-10 w-12 h-12 bg-accent/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-32 right-32 w-16 h-16 bg-primary/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 text-primary group">
                <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
                  <Leaf className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold uppercase tracking-wider">100% Natural & Organic</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Pure Wellness
                <span className="block text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  From Nature
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                {storeDescription || "Discover our premium collection of organic herbs, natural supplements, and wellness products carefully sourced from trusted growers around the world."}
              </p>
            </div>

            {/* Trust Indicators with Animation */}
            <div className="flex items-center space-x-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center space-x-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-5 w-5 fill-yellow-400 text-yellow-400 animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
                <span className="ml-3 text-sm font-medium text-foreground">4.9/5 from 2,500+ reviews</span>
              </div>
            </div>

            {/* CTA Buttons with Enhanced Hover Effects */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button 
                size="lg" 
                className="group bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                asChild
              >
                <a href="/shop">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </a>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="group border-2 border-primary/20 text-foreground hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105" 
                asChild
              >
                <a href="/contact">
                  Learn More
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </a>
              </Button>
            </div>

            {/* Enhanced Features Grid */}
            <div className="grid grid-cols-3 gap-6 pt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              {[
                { icon: <Leaf className="h-6 w-6" />, label: "100% Organic", color: "text-green-600" },
                { icon: <span className="text-xl font-bold">✓</span>, label: "Lab Tested", color: "text-blue-600" },
                { icon: <span className="text-xl">🌱</span>, label: "Sustainable", color: "text-emerald-600" }
              ].map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-card border border-border/50 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:bg-primary/5 transition-all duration-300 shadow-sm hover:shadow-md">
                    <span className={feature.color}>{feature.icon}</span>
                  </div>
                  <p className="text-sm text-foreground font-medium group-hover:text-primary transition-colors duration-300">
                    {feature.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Enhanced Product Showcase */}
          <div className="relative lg:block animate-scale-in" style={{ animationDelay: '0.8s' }}>
            <div className="relative group">
              {/* Main Image with Hover Effect */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="Natural herbal products" 
                  className="w-full h-[550px] object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              {/* Floating Quality Badge */}
              <div className="absolute -top-4 -left-4 bg-card border border-border shadow-lg rounded-xl p-4 animate-bounce" style={{ animationDelay: '1s' }}>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-foreground">Premium Quality</span>
                </div>
              </div>
              
              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -right-6 bg-card border border-border shadow-xl rounded-xl p-6 animate-fade-in" style={{ animationDelay: '1.2s' }}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">2,500+</div>
                  <div className="text-xs text-muted-foreground">Happy Customers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Hero;