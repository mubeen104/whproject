import { useSettings } from '@/hooks/useSettings';

export const useStoreSettings = () => {
  const { data: storeSettings, isLoading } = useSettings('store');
  
  return {
    storeName: storeSettings?.store_name || 'New Era Herbals',
    storeEmail: storeSettings?.store_email || 'neweraorganic101@gmail.com',
    storePhone: storeSettings?.store_phone || '+92 304 307 3838',
    storeAddress: storeSettings?.store_address || '',
    storeDescription: storeSettings?.store_description || 'Premium natural wellness products',
    currency: storeSettings?.currency || 'PKR',
    taxRate: storeSettings?.tax_rate || 0,
    shippingRate: storeSettings?.shipping_rate || 500,
    freeShippingThreshold: storeSettings?.free_shipping_threshold || 10000,
    isLoading
  };
};