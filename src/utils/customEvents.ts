import { trackEvent } from '@/components/PixelTracker';

// Custom event tracking utilities for e-commerce

export const trackSearch = (searchTerm: string, results?: number) => {
  trackEvent('Search', {
    search_term: searchTerm,
    number_of_results: results
  });
};

export const trackWishlistAdd = (productData: { product_id: string; product_name?: string; value?: number; currency?: string }) => {
  trackEvent('AddToWishlist', {
    content_ids: [productData.product_id],
    content_name: productData.product_name,
    value: productData.value,
    currency: productData.currency || 'PKR'
  });
};

export const trackProductView = (productData: { product_id: string; product_name?: string; category?: string; value?: number; currency?: string }) => {
  trackEvent('ViewContent', {
    content_ids: [productData.product_id],
    content_name: productData.product_name,
    content_category: productData.category,
    value: productData.value,
    currency: productData.currency || 'PKR',
    content_type: 'product'
  });
};

export const trackCategoryView = (categoryData: { category_name: string; products_count?: number }) => {
  trackEvent('ViewCategory', {
    content_category: categoryData.category_name,
    num_items: categoryData.products_count
  });
};

export const trackSignUp = (method?: string) => {
  trackEvent('CompleteRegistration', {
    method: method || 'email'
  });
};

export const trackLogin = (method?: string) => {
  trackEvent('Login', {
    method: method || 'email'
  });
};

export const trackNewsletterSignup = () => {
  trackEvent('Subscribe', {
    content_name: 'newsletter'
  });
};

export const trackContactForm = (formType?: string) => {
  trackEvent('Contact', {
    content_name: formType || 'contact_form'
  });
};

export const trackCustomEvent = (eventName: string, eventData?: any) => {
  trackEvent(`Custom_${eventName}`, eventData);
};

// Conversion tracking for different marketing goals
export const trackLead = (leadData?: { lead_type?: string; value?: number; currency?: string }) => {
  trackEvent('Lead', {
    content_name: leadData?.lead_type || 'general',
    value: leadData?.value,
    currency: leadData?.currency || 'PKR'
  });
};

export const trackDownload = (downloadData: { file_name: string; file_type?: string }) => {
  trackEvent('Download', {
    content_name: downloadData.file_name,
    content_type: downloadData.file_type
  });
};