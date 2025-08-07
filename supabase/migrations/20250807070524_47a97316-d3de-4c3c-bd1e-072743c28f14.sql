-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for newsletter_subscribers (admin only)
CREATE POLICY "Admin can view all newsletter subscribers" 
  ON public.newsletter_subscribers 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can manage newsletter subscribers" 
  ON public.newsletter_subscribers 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for contact_submissions (admin only)
CREATE POLICY "Admin can view all contact submissions" 
  ON public.contact_submissions 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can manage contact submissions" 
  ON public.contact_submissions 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON public.newsletter_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at ON public.contact_submissions(submitted_at);

-- Create triggers for updated_at columns
CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();