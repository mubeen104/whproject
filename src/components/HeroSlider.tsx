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

  // Get auto scroll speed from first slide or default to 5000ms
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

  if (isLoading || !slides || slides.length === 0) {
    return (
      <section className="relative h-screen w-full bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 animate-pulse" />
        <div className="flex items-center justify-center h-full">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading slides...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden">
      <div className="w-full aspect-[16/9] max-w-full">
        <Carousel 
          setApi={setApi} 
          className="w-full h-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="h-full">
            {slides.map((slide, index) => (
              <CarouselItem key={slide.id} className="h-full">
                <div className="relative h-full w-full group">
                  {/* 16:9 aspect ratio image (1408x768) without cropping */}
                  <img 
                    src={slide.image_url} 
                    alt={slide.title}
                    className="w-full h-full object-contain bg-gradient-to-br from-muted/20 to-background"
                  />
                
                {/* Subtle gradient overlay for better contrast on indicators */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                
                {/* Optional overlay for text if link exists */}
                {slide.link_url && (
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <div className="text-center text-white animate-fade-in">
                      <h2 className="text-4xl md:text-6xl font-bold mb-4 text-shadow-lg">
                        {slide.title}
                      </h2>
                      {slide.subtitle && (
                        <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto text-shadow">
                          {slide.subtitle}
                        </p>
                      )}
                      <a
                        href={slide.link_url}
                        className="inline-flex items-center px-8 py-4 bg-primary hover:bg-primary-hover text-primary-foreground rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-elevated"
                      >
                        {slide.link_text || 'Shop Now'}
                        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>


        {/* Modern slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`transition-all duration-300 ${
                current === index + 1 
                  ? 'w-8 h-2 bg-white rounded-full' 
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80 rounded-full hover:scale-125'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
      </div>

      {/* Floating animated elements */}
      <div className="absolute top-1/4 right-20 w-6 h-6 bg-white/20 rounded-full animate-ping" />
      <div className="absolute top-3/4 left-20 w-4 h-4 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-32 w-8 h-8 bg-accent/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
    </section>
  );
};

export default HeroSlider;