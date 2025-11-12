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
  const animationFrameRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const isUserInteractingRef = useRef(false);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    const wasPaused = isPausedRef.current;
    isPausedRef.current = isPaused;

    if (!wasPaused && isPaused) {
      pauseTimeRef.current = performance.now();
    } else if (wasPaused && !isPaused && pauseTimeRef.current > 0) {
      const pauseDuration = performance.now() - pauseTimeRef.current;
      lastScrollTimeRef.current += pauseDuration;
      pauseTimeRef.current = 0;
    }
  }, [isPaused]);

  const scrollLoop = (timestamp: number) => {
    if (!api || !enableSmoothScrolling) {
      return;
    }

    const elapsed = timestamp - lastScrollTimeRef.current;

    if (elapsed >= carouselScrollSpeed && !isUserInteractingRef.current && !isPausedRef.current) {
      lastScrollTimeRef.current = timestamp;

      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }

    animationFrameRef.current = requestAnimationFrame(scrollLoop);
  };

  const startAutoScroll = () => {
    if (!api || !enableSmoothScrolling || animationFrameRef.current) {
      return;
    }

    lastScrollTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(scrollLoop);
  };

  const stopAutoScroll = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  useEffect(() => {
    if (!api || !enableSmoothScrolling) {
      return;
    }

    const handleUserInteractionStart = () => {
      isUserInteractingRef.current = true;
    };

    const handleUserInteractionEnd = () => {
      isUserInteractingRef.current = false;
      lastScrollTimeRef.current = performance.now();
    };

    api.on('pointerDown', handleUserInteractionStart);
    api.on('pointerUp', handleUserInteractionEnd);
    api.on('select', handleUserInteractionEnd);

    startAutoScroll();

    return () => {
      stopAutoScroll();
      api.off('pointerDown', handleUserInteractionStart);
      api.off('pointerUp', handleUserInteractionEnd);
      api.off('select', handleUserInteractionEnd);
    };
  }, [api, carouselScrollSpeed, enableSmoothScrolling]);

  useEffect(() => {
    if (isPaused || !enableSmoothScrolling) {
      stopAutoScroll();
    } else if (api && !animationFrameRef.current && !isUserInteractingRef.current) {
      startAutoScroll();
    }
  }, [isPaused, api, enableSmoothScrolling]);

  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, []);
};