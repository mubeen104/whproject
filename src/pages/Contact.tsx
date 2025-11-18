import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, Phone, Instagram, Facebook } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import TikTokIcon from '@/components/icons/TikTokIcon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { storeEmail, storePhone } = useStoreSettings();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('contact-form', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        }
      });

      if (error) throw error;
      
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    {
      icon: Instagram,
      href: "https://www.instagram.com/neweraherbal/",
      label: "Instagram"
    },
    {
      icon: TikTokIcon,
      href: "https://www.tiktok.com/@new.era7904?_t=ZS-8yCtFWlprdo&_r=1",
      label: "TikTok"
    },
    {
      icon: Facebook,
      href: "https://www.facebook.com/new.era.151908",
      label: "Facebook"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Contact New Era Herbals | Customer Support for Organic Herbal Products & Natural Wellness</title>
        <meta name="description" content="Get in touch with New Era Herbals for questions about our premium organic herbal products, natural supplements, and wellness solutions. Expert customer support for all your herbal health needs." />
        <meta name="keywords" content="herbal products contact, natural supplements support, organic health customer service, wellness products inquiry, herbal medicine questions, ayurvedic support, natural remedies help" />
        <link rel="canonical" content="https://www.neweraherbals.com/contact" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.neweraherbals.com/contact" />
        <meta property="og:title" content="Contact New Era Herbals | Customer Support" />
        <meta property="og:description" content="Get in touch with our expert team for questions about organic herbal products and natural wellness solutions." />
        <meta property="og:image" content="https://www.neweraherbals.com/logo.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Contact New Era Herbals" />
        <meta name="twitter:description" content="Expert support for your natural wellness journey." />
        
        {/* Breadcrumb Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.neweraherbals.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Contact",
                "item": "https://www.neweraherbals.com/contact"
              }
            ]
          })}
        </script>
        
        {/* ContactPage Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact New Era Herbals",
            "description": "Get in touch with New Era Herbals for expert support on organic herbal products",
            "url": "https://www.neweraherbals.com/contact"
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        <Breadcrumbs />

      {/* Hero Section with SEO headings */}
      <section className="relative overflow-hidden bg-muted/20 border-b">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23059669%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="relative container mx-auto px-4 py-20 animate-fade-in">
          <header className="text-center max-w-4xl mx-auto">
            <div className="inline-block p-1 bg-primary/10 rounded-full mb-8 hover:bg-primary/20 transition-all duration-300 hover:scale-105">
              <div className="bg-background rounded-full px-8 py-3 shadow-lg">
                <span className="text-sm font-bold text-primary">
                  Natural Health Support
                </span>
              </div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-8 text-foreground leading-tight animate-scale-in">
              Contact New Era Herbals
            </h1>
            <h2 className="text-3xl md:text-4xl text-muted-foreground mb-4">Expert Guidance for Your Wellness Journey</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Have questions about our organic herbal products, natural remedies, or wellness solutions? Our expert team is here to help guide your holistic health journey.
            </p>
          </header>
        </div>
      </section>

      <main className="container mx-auto px-4 py-20">
        {/* Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {/* Left Side - Contact Form */}
          <div className="lg:col-span-7">
            <Card className="border-2 shadow-2xl bg-card backdrop-blur-sm hover:shadow-3xl hover:border-primary/20 transition-all duration-500 hover:-translate-y-1">
              <CardHeader className="pb-8">
                <CardTitle className="text-3xl font-bold text-primary">
                  <h3>Send us a Message About Natural Health Products</h3>
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Questions about our organic herbal supplements, natural remedies, or wellness products? Fill out the form below and our expert team will get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 transform hover:scale-105 transition-all duration-300">
                      <Label htmlFor="name" className="text-sm font-semibold">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Your full name"
                        className="h-12 border-2 focus:border-primary focus:shadow-lg hover:border-primary/50 transition-all duration-300 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2 transform hover:scale-105 transition-all duration-300">
                      <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        className="h-12 border-2 focus:border-primary focus:shadow-lg hover:border-primary/50 transition-all duration-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 transform hover:scale-105 transition-all duration-300">
                    <Label htmlFor="email" className="text-sm font-semibold">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="your.email@example.com"
                      className="h-12 border-2 focus:border-primary focus:shadow-lg hover:border-primary/50 transition-all duration-300 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2 transform hover:scale-105 transition-all duration-300">
                    <Label htmlFor="message" className="text-sm font-semibold">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      className="border-2 focus:border-primary focus:shadow-lg hover:border-primary/50 transition-all duration-300 rounded-xl resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-xl"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Contact Information */}
          <div className="lg:col-span-5 space-y-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Card className="border-2 shadow-xl bg-card backdrop-blur-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  <h3>Get in Touch with Our Wellness Experts</h3>
                </CardTitle>
                <p className="text-muted-foreground">
                  Reach out through any of these channels for natural health support
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div className="group">
                  <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-primary/5 hover:scale-105 transition-all duration-300">
                    <div className="bg-primary p-3 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Email</h3>
                      <a 
                        href={`mailto:${storeEmail}`}
                        className="text-muted-foreground hover:text-primary transition-colors duration-300 break-all"
                      >
                        {storeEmail}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="group">
                  <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-primary/5 hover:scale-105 transition-all duration-300">
                    <div className="bg-accent p-3 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Phone</h3>
                      <a 
                        href={`tel:${storePhone.replace(/\s+/g, '')}`}
                        className="text-muted-foreground hover:text-primary transition-colors duration-300"
                      >
                        {storePhone}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media Card */}
            <Card className="border-2 shadow-xl bg-card backdrop-blur-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Follow Us</CardTitle>
                <p className="text-muted-foreground">
                  Stay connected on social media
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden"
                      aria-label={social.label}
                    >
                      <div className="bg-primary/10 hover:bg-primary/20 p-6 rounded-2xl transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-2 group-hover:scale-110">
                        <social.icon className="h-8 w-8 text-primary group-hover:scale-125 transition-transform duration-300 mx-auto" />
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Response Promise */}
            <Card className="border-2 shadow-xl bg-green-50 dark:bg-green-950/20 hover:shadow-2xl hover:border-green-400/30 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-4 hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Quick Response</h3>
                <p className="text-sm text-muted-foreground">
                  We typically respond to all inquiries within 24 hours during business days.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

        <Footer />
      </div>
    </>
  );
};

export default Contact;