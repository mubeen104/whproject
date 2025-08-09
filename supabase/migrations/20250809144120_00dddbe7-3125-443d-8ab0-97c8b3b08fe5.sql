-- Add missing email configuration settings
INSERT INTO public.settings (key, value, category, description) VALUES
('from_email', 'noreply@neweraherbals.com', 'email', 'From email address for outgoing emails'),
('contact_email', 'neweraorganic101@gmail.com', 'email', 'Email address to receive contact form submissions'),
('support_email', 'support@neweraherbals.com', 'email', 'Customer support email address'),
('email_domain', 'neweraherbals.com', 'email', 'Verified email domain for sending emails'),
('website_url', 'https://neweraherbals.com', 'store', 'Store website URL')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description;