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
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoScroll = () => {
    if (!api || intervalRef.current) {
      return;
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

  useEffect(() => {
    if (!api || !enableSmoothScrolling) {
      return;
    }

    const handleUserInteractionStart = () => {
      isUserInteractingRef.current = true;
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
      stopAutoScroll();
    };

    const handleUserInteractionEnd = () => {
      isUserInteractingRef.current = false;
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
      // Resume auto-scroll after a delay
      resumeTimeoutRef.current = setTimeout(() => {
        if (!isUserInteractingRef.current && !isPaused) {
          startAutoScroll();
        }
      }, 1500);
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

  // Handle isPaused changes smoothly
  useEffect(() => {
    if (isPaused) {
      // Clear any pending resume
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
      // Don't stop immediately, let current scroll complete
      pauseTimeoutRef.current = setTimeout(() => {
        if (!isUserInteractingRef.current && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 300);
    } else {
      // Clear any pending pause
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      // Resume with a small delay for smoothness
      if (!isUserInteractingRef.current && !intervalRef.current && api && enableSmoothScrolling) {
        resumeTimeoutRef.current = setTimeout(() => {
          if (!isPaused && !isUserInteractingRef.current) {
            startAutoScroll();
          }
        }, 500);
      }
    }
  }, [isPaused, api, enableSmoothScrolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);
};