type PixelPlatform = 'google_ads' | 'meta_pixel' | 'tiktok_pixel' | 'linkedin_insight' |
  'twitter_pixel' | 'pinterest_tag' | 'snapchat_pixel' | 'microsoft_advertising' |
  'reddit_pixel' | 'quora_pixel';

interface PixelState {
  isLoaded: boolean;
  isReady: boolean;
  error?: string;
  attempts: number;
}

class PixelManager {
  private pixels: Map<string, PixelState> = new Map();
  private readyCallbacks: Map<string, Array<() => void>> = new Map();
  private maxRetries = 3;
  private retryDelay = 1000;

  markAsLoaded(platform: PixelPlatform, pixelId: string): void {
    const key = `${platform}_${pixelId}`;
    const state = this.pixels.get(key) || { isLoaded: false, isReady: false, attempts: 0 };
    state.isLoaded = true;
    this.pixels.set(key, state);
  }

  markAsReady(platform: PixelPlatform, pixelId: string): void {
    const key = `${platform}_${pixelId}`;
    const state = this.pixels.get(key) || { isLoaded: false, isReady: false, attempts: 0 };
    state.isReady = true;
    this.pixels.set(key, state);

    // Execute ready callbacks
    const callbacks = this.readyCallbacks.get(key) || [];
    callbacks.forEach(cb => cb());
    this.readyCallbacks.delete(key);
  }

  markAsError(platform: PixelPlatform, pixelId: string, error: string): void {
    const key = `${platform}_${pixelId}`;
    const state = this.pixels.get(key) || { isLoaded: false, isReady: false, attempts: 0 };
    state.error = error;
    state.attempts += 1;
    this.pixels.set(key, state);
  }

  isReady(platform: PixelPlatform, pixelId: string): boolean {
    const key = `${platform}_${pixelId}`;
    return this.pixels.get(key)?.isReady || false;
  }

  isLoaded(platform: PixelPlatform, pixelId: string): boolean {
    const key = `${platform}_${pixelId}`;
    return this.pixels.get(key)?.isLoaded || false;
  }

  onReady(platform: PixelPlatform, pixelId: string, callback: () => void): void {
    const key = `${platform}_${pixelId}`;
    if (this.isReady(platform, pixelId)) {
      callback();
      return;
    }

    const callbacks = this.readyCallbacks.get(key) || [];
    callbacks.push(callback);
    this.readyCallbacks.set(key, callbacks);
  }

  waitForReady(platform: PixelPlatform, pixelId: string, timeoutMs = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      const key = `${platform}_${pixelId}`;

      if (this.isReady(platform, pixelId)) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error(`Pixel ${key} failed to load within ${timeoutMs}ms`));
      }, timeoutMs);

      this.onReady(platform, pixelId, () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  canRetry(platform: PixelPlatform, pixelId: string): boolean {
    const key = `${platform}_${pixelId}`;
    const state = this.pixels.get(key);
    return !state || state.attempts < this.maxRetries;
  }

  getState(platform: PixelPlatform, pixelId: string): PixelState | undefined {
    const key = `${platform}_${pixelId}`;
    return this.pixels.get(key);
  }

  reset(): void {
    this.pixels.clear();
    this.readyCallbacks.clear();
  }

  checkPixelAvailability(platform: PixelPlatform): boolean {
    switch (platform) {
      case 'google_ads':
        return typeof window.gtag !== 'undefined';
      case 'meta_pixel':
        return typeof window.fbq !== 'undefined';
      case 'tiktok_pixel':
        return typeof window.ttq !== 'undefined';
      case 'linkedin_insight':
        return typeof window.lintrk !== 'undefined';
      case 'twitter_pixel':
        return typeof window.twq !== 'undefined';
      case 'pinterest_tag':
        return typeof window.pintrk !== 'undefined';
      case 'snapchat_pixel':
        return typeof window.snaptr !== 'undefined';
      case 'microsoft_advertising':
        return typeof window.uetq !== 'undefined';
      case 'reddit_pixel':
        return typeof window.rdt !== 'undefined';
      case 'quora_pixel':
        return typeof window.qp !== 'undefined';
      default:
        return false;
    }
  }
}

export const pixelManager = new PixelManager();
