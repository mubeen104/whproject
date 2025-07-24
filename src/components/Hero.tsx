import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, Star } from "lucide-react";
import heroImage from "@/assets/hero-herbals.jpg";

const Hero = () => {
  return (
    <section id="hero" className="relative bg-gradient-hero min-h-[80vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-accent">
                <Leaf className="h-5 w-5" />
                <span className="text-sm font-medium uppercase tracking-wide">100% Natural</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
                Pure Wellness
                <span className="block text-accent">From Nature</span>
              </h1>
              
              <p className="text-lg text-primary-foreground/90 max-w-xl leading-relaxed">
                Discover our premium collection of organic herbs, natural supplements, and wellness products 
                carefully sourced from trusted growers around the world.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-primary-foreground/80">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <Star className="h-4 w-4 fill-accent text-accent" />
                <Star className="h-4 w-4 fill-accent text-accent" />
                <Star className="h-4 w-4 fill-accent text-accent" />
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="ml-2 text-sm">4.9/5 from 2,500+ reviews</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 group"
                asChild
              >
                <a href="/shop">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary-foreground/20 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground hover:text-primary backdrop-blur-sm"
                asChild
              >
                <a href="/contact">
                  Learn More
                </a>
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="bg-primary-foreground/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Leaf className="h-6 w-6 text-accent" />
                </div>
                <p className="text-sm text-primary-foreground/90 font-medium">Organic</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary-foreground/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-accent font-bold">✓</span>
                </div>
                <p className="text-sm text-primary-foreground/90 font-medium">Lab Tested</p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary-foreground/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <span className="text-accent font-bold">🌱</span>
                </div>
                <p className="text-sm text-primary-foreground/90 font-medium">Sustainable</p>
              </div>
            </div>
          </div>

          {/* Right Content - Product Showcase */}
          <div className="relative lg:block animate-scale-in">
            <div className="relative">
              <img
                src={heroImage}
                alt="Natural herbal products"
                className="rounded-2xl shadow-elevated w-full h-[500px] object-cover"
              />
              
              {/* Floating Badge */}
              <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium animate-float">
                New Arrivals
              </div>
              
              {/* Product Preview Card */}
              <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-4 shadow-medium">
                <p className="text-card-foreground font-medium">Premium Tea Blend</p>
                <p className="text-muted-foreground text-sm">Chamomile & Lavender</p>
                <p className="text-primary font-bold mt-1">PKR 4,999</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-20 h-20 bg-accent/10 rounded-full animate-float"></div>
      <div className="absolute bottom-20 left-20 w-12 h-12 bg-primary-foreground/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
    </section>
  );
};

export default Hero;