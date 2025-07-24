-- Create a table for storing application settings
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on settings table
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage settings
CREATE POLICY "Admins can manage all settings" 
ON public.settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create policy for public to read certain settings (like store info)
CREATE POLICY "Public can read public settings" 
ON public.settings 
FOR SELECT 
USING (category IN ('store', 'public'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.settings (key, value, category, description) VALUES
('store_name', '"Natural Elements Herbals"', 'store', 'Store name displayed to customers'),
('store_email', '"admin@naturalelementsherbal.com"', 'store', 'Primary store contact email'),
('store_phone', '"+1 (555) 123-4567"', 'store', 'Store contact phone number'),
('store_address', '"123 Herbal Way, Wellness City, WC 12345"', 'store', 'Physical store address'),
('store_description', '"Premium natural health products and herbal supplements."', 'store', 'Store description for customers'),
('currency', '"USD"', 'store', 'Default store currency'),
('tax_rate', '8.5', 'store', 'Default tax rate percentage'),
('shipping_rate', '9.99', 'store', 'Default shipping rate'),
('free_shipping_threshold', '75.00', 'store', 'Minimum order value for free shipping'),
('order_confirmation_emails', 'true', 'email', 'Send order confirmation emails'),
('shipping_notification_emails', 'true', 'email', 'Send shipping notification emails'),
('marketing_emails', 'false', 'email', 'Send marketing emails'),
('low_stock_alerts', 'true', 'email', 'Send low stock alert emails'),
('require_email_verification', 'true', 'security', 'Require email verification for new accounts'),
('two_factor_auth', 'false', 'security', 'Enable two-factor authentication'),
('password_min_length', '8', 'security', 'Minimum password length requirement'),
('session_timeout', '30', 'security', 'Session timeout in minutes');