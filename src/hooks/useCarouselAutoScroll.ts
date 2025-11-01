import { useEffect, useRef } from 'react';
import { useUISettings } from '@/hooks/useStoreSettings';

interface CarouselApi {
  canScrollNext(): boolean;
  scrollNext(): void;
  scrollTo(index: number): void;
  on(event: string, callback: () => void): void;
  off(event: string, callback: () => void): void;
}

export const useCarouselAutoScroll = (api: CarouselApi | undefined, isPaused: boolean = false) => {
  const { carouselScrollSpeed, enableSmoothScrolling } = useUISettings();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUserInteractingRef = useRef(false);

  useEffect(() => {
    if (!api || !enableSmoothScrolling) {
      return;
    }

    const startAutoScroll = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        // Only auto-scroll if user is not currently interacting and not paused
        if (!isUserInteractingRef.current && !isPaused) {
          if (api.canScrollNext()) {
            api.scrollNext();
          } else {
            api.scrollTo(0);
          }
        }
      }, carouselScrollSpeed);
    };

    const stopAutoScroll = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleUserInteractionStart = () => {
      isUserInteractingRef.current = true;
      stopAutoScroll();
    };

    const handleUserInteractionEnd = () => {
      isUserInteractingRef.current = false;
      // Resume auto-scroll after a delay
      setTimeout(() => {
        if (!isUserInteractingRef.current) {
          startAutoScroll();
        }
      }, 2000);
    };

    // Set up event listeners for user interactions
    api.on('pointerDown', handleUserInteractionStart);
    api.on('select', handleUserInteractionEnd);

    // Start auto-scroll
    startAutoScroll();

    // Cleanup function
    return () => {
      stopAutoScroll();
      api.off('pointerDown', handleUserInteractionStart);
      api.off('select', handleUserInteractionEnd);
    };
  }, [api, carouselScrollSpeed, enableSmoothScrolling, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};