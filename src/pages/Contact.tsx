import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, Phone, Instagram, Facebook } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TikTokIcon from '@/components/icons/TikTokIcon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useStoreSettings } from '@/hooks/useStoreSettings';

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
      // Here you would typically send the form data to your backend
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Header />
      
      {/* Hero Section with Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-accent/5 to-primary/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23059669%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block p-1 bg-gradient-to-r from-primary to-accent rounded-full mb-6">
              <div className="bg-background rounded-full px-6 py-2">
                <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Get In Touch
                </span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
              Contact Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-20">
        {/* Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          {/* Left Side - Contact Form */}
          <div className="lg:col-span-7">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card to-muted/10 backdrop-blur-sm">
              <CardHeader className="pb-8">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Send us a Message
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Your full name"
                        className="h-12 border-2 focus:border-primary/50 transition-all duration-300 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                        className="h-12 border-2 focus:border-primary/50 transition-all duration-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="your.email@example.com"
                      className="h-12 border-2 focus:border-primary/50 transition-all duration-300 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      className="border-2 focus:border-primary/50 transition-all duration-300 rounded-xl resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
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
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Get in Touch</CardTitle>
                <p className="text-muted-foreground">
                  Reach out to us through any of these channels
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div className="group">
                  <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-primary/5 transition-all duration-300">
                    <div className="bg-gradient-to-r from-primary to-accent p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
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
                  <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-primary/5 transition-all duration-300">
                    <div className="bg-gradient-to-r from-accent to-primary p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
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
            <Card className="border-0 shadow-xl bg-gradient-to-br from-accent/5 to-primary/5 backdrop-blur-sm">
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
                      <div className="bg-gradient-to-br from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 p-6 rounded-2xl transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                        <social.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300 mx-auto" />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Response Promise */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
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
  );
};

export default Contact;