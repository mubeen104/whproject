import { useState, useEffect } from "react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi 
} from "@/components/ui/carousel";
import { useHeroSlides } from "@/hooks/useHeroSlides";


const HeroSlider = () => {
  const { data: slides, isLoading } = useHeroSlides();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  

  // Use slide-specific speed or default
  const autoScrollSpeed = slides?.[0]?.auto_scroll_speed || 5000;

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

    // Auto-scroll with configurable speed
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, autoScrollSpeed);

    return () => clearInterval(interval);
  }, [api, autoScrollSpeed]);

  if (isLoading) {
    return (
      <section className="relative w-full overflow-hidden">
        <div className="w-full aspect-[16/9] sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-[21/9] max-w-full">
          <div className="relative h-full w-full bg-gradient-to-br from-muted/20 to-background animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            
            {/* Skeleton content */}
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 animate-fade-in">
                <div className="w-20 h-20 mx-auto">
                  <div className="w-full h-full border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted/40 rounded-full w-32 mx-auto animate-pulse" />
                  <div className="h-3 bg-muted/30 rounded-full w-24 mx-auto animate-pulse" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
            
            {/* Skeleton slide indicators */}
            <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="w-6 sm:w-8 h-1.5 sm:h-2 bg-white/20 rounded-full animate-pulse"
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <section className="relative w-full overflow-hidden">
        <div className="w-full aspect-[16/9] sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-[21/9] max-w-full">
          <div className="relative h-full w-full bg-gradient-to-br from-muted/20 to-background flex items-center justify-center">
            <div className="text-center animate-fade-in">
              <p className="text-muted-foreground text-lg">No slides available</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden">
      <div className="w-full aspect-[16/9] sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-[21/9] max-w-full">
        <Carousel 
          setApi={setApi} 
          className="w-full h-full"
          opts={{
            align: "start",
            loop: true,
            skipSnaps: false,
            dragFree: false
          }}
        >
          <CarouselContent className="h-full">
            {slides.map((slide, index) => (
              <CarouselItem key={slide.id} className="h-full">
                <div className="relative h-full w-full group animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  {/* Responsive image with proper object-fit and loading optimization */}
                  <img 
                    src={slide.image_url} 
                    alt={slide.title}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="w-full h-full object-cover sm:object-contain md:object-cover bg-gradient-to-br from-muted/20 to-background group-hover:scale-[1.02]"
                      style={{
                        transition: `transform 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out`
                      }}
                    onLoad={(e) => {
                      // Add smooth transition when image loads
                      e.currentTarget.style.opacity = '1';
                    }}
                    onError={(e) => {
                      // Fallback for broken images
                      e.currentTarget.style.background = 'linear-gradient(135deg, hsl(var(--muted)), hsl(var(--background)))';
                    }}
                  />
                
                {/* Subtle gradient overlay for better contrast on indicators */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                
                {/* Professional overlay with gradient backdrop */}
                {slide.link_url && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out flex items-center justify-center p-4 sm:p-6 md:p-8">
                    <div className="text-center text-white transform translate-y-4 group-hover:translate-y-0 transition-all duration-700 ease-out max-w-full">
                      <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 text-shadow-lg px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                        {slide.title}
                      </h2>
                      {slide.subtitle && (
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-5 md:mb-6 max-w-xs sm:max-w-lg md:max-w-2xl mx-auto text-shadow px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300">
                          {slide.subtitle}
                        </p>
                      )}
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 delay-400 transform scale-95 group-hover:scale-100">
                        <a
                          href={slide.link_url}
                          className="relative inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-full font-semibold transition-all duration-500 hover:scale-110 hover:shadow-2xl shadow-lg text-sm sm:text-base overflow-hidden group/button"
                        >
                          {/* Animated background shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/button:translate-x-full transition-transform duration-1000 ease-out" />
                          
                          {/* Button glow effect */}
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-primary/90 opacity-0 group-hover/button:opacity-100 transition-opacity duration-300 blur-sm" />
                          
                          <span className="relative z-10 truncate max-w-[120px] sm:max-w-none">
                            {slide.link_text || 'Shop Now'}
                          </span>
                          <svg className="relative z-10 ml-1 sm:ml-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transform group-hover/button:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>


        {/* Modern slide indicators */}
        <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`${
                current === index + 1 
                  ? 'w-6 sm:w-8 h-1.5 sm:h-2 bg-white rounded-full' 
                  : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/80 rounded-full hover:scale-125'
              }`}
              style={{
                transition: `all 500ms cubic-bezier(0.4, 0, 0.2, 1)`
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
      </div>

      {/* Floating animated elements - responsive positioning */}
      <div className="absolute top-1/4 right-4 sm:right-8 md:right-12 lg:right-20 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-white/20 rounded-full animate-ping" />
      <div className="absolute top-3/4 left-4 sm:left-8 md:left-12 lg:left-20 w-3 h-3 sm:w-4 sm:h-4 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-8 sm:right-16 md:right-24 lg:right-32 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-accent/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
    </section>
  );
};

export default HeroSlider;