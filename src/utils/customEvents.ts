// Create a global tracking instance that works without hooks
const globalTracking = (() => {
  let trackEvent: any = null;
  
  return {
    setTracker: (tracker: any) => { trackEvent = tracker; },
    track: (eventName: string, data?: any) => {
      if (trackEvent) trackEvent(eventName, data);
    }
  };
})();

// Custom event tracking utilities for e-commerce
export const trackSearch = (searchTerm: string, results?: number) => {
  globalTracking.track('Search', {
    search_term: searchTerm,
    number_of_results: results
  });
};

export const trackWishlistAdd = (productData: { product_id: string; product_name?: string; value?: number; currency?: string }) => {
  globalTracking.track('AddToWishlist', {
    content_ids: [productData.product_id],
    content_name: productData.product_name,
    value: productData.value,
    currency: productData.currency || 'PKR'
  });
};

export const trackProductView = (productData: { product_id: string; product_name?: string; category?: string; value?: number; currency?: string }) => {
  globalTracking.track('ViewContent', {
    content_ids: [productData.product_id],
    content_name: productData.product_name,
    content_category: productData.category,
    value: productData.value,
    currency: productData.currency || 'PKR',
    content_type: 'product'
  });
};

export const trackCategoryView = (categoryData: { category_name: string; products_count?: number }) => {
  globalTracking.track('ViewCategory', {
    content_category: categoryData.category_name,
    num_items: categoryData.products_count
  });
};

export const trackSignUp = (method?: string) => {
  globalTracking.track('CompleteRegistration', {
    method: method || 'email'
  });
};

export const trackLogin = (method?: string) => {
  globalTracking.track('Login', {
    method: method || 'email'
  });
};

export const trackNewsletterSignup = () => {
  globalTracking.track('Subscribe', {
    content_name: 'newsletter'
  });
};

export const trackContactForm = (formType?: string) => {
  globalTracking.track('Contact', {
    content_name: formType || 'contact_form'
  });
};

export const trackCustomEvent = (eventName: string, eventData?: any) => {
  globalTracking.track(`Custom_${eventName}`, eventData);
};

export const trackLead = (leadData?: { lead_type?: string; value?: number; currency?: string }) => {
  globalTracking.track('Lead', {
    content_name: leadData?.lead_type || 'general',
    value: leadData?.value,
    currency: leadData?.currency || 'PKR'
  });
};

export const trackDownload = (downloadData: { file_name: string; file_type?: string }) => {
  globalTracking.track('Download', {
    content_name: downloadData.file_name,
    content_type: downloadData.file_type
  });
};