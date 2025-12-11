/// <reference types="vite/client" />

// Global type declarations for advertising pixels and analytics
declare global {
  interface Window {
    dataLayer: any[];
    fbq: (...args: any[]) => void;
    gtag: (...args: any[]) => void;
    ttq: {
      track: (...args: any[]) => void;
      page: () => void;
    };
    pintrk: (...args: any[]) => void;
    snaptr: (...args: any[]) => void;
    uetq: any[];
    twq: (...args: any[]) => void;
    lintrk: (...args: any[]) => void;
    neTrack?: {
      viewContent: (productId: string, title: string, price: number, currency: string) => void;
      addToCart: (productId: string, title: string, price: number, currency: string, quantity?: number) => void;
      initiateCheckout: (orderTotal: number, currency: string) => void;
      purchase: (orderTotal: number, currency: string, productIds: string[]) => void;
    };
  }
}

export {};
