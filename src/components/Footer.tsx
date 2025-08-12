import { Leaf, Mail, Phone, Facebook, Instagram, ArrowUp, Heart, Award, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { HalalCertIcon, NaturalCertIcon, EcoFriendlyIcon, GMOFreeIcon, NoChemicalsIcon, OrganicCertIcon } from "@/components/icons/CertificationIcons";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const {
    storeName,
    storeEmail,
    storePhone
  } = useStoreSettings();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSubscribing(true);

    try {
      const { data, error } = await supabase.functions.invoke('newsletter-signup', {
        body: { email }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Thank you for subscribing to our newsletter!",
      });
      
      setEmail(''); // Clear the form
    } catch (error: any) {
      console.error('Newsletter signup error:', error);
      toast({
        title: "Subscription Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubscribing(false);
    }
  };
  const legalLinks = [{
    name: "Privacy Policy",
    href: "/privacy-policy"
  }, {
    name: "Terms of Service",
    href: "/terms-of-service"
  }, {
    name: "Cookie Policy",
    href: "/cookie-policy"
  }];
  const quickLinks = [{
    name: "Blog",
    href: "/blog"
  }, {
    name: "Shop",
    href: "/shop"
  }, {
    name: "Contact",
    href: "/contact"
  }];
  const certifications = [{
    icon: HalalCertIcon,
    label: "Halal Certified",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20"
  }, {
    icon: OrganicCertIcon,
    label: "100% Organic",
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20"
  }, {
    icon: EcoFriendlyIcon,
    label: "Eco-Friendly",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  }, {
    icon: GMOFreeIcon,
    label: "GMO Free",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20"
  }, {
    icon: NoChemicalsIcon,
    label: "Chemical Free",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  }, {
    icon: NaturalCertIcon,
    label: "100% Natural",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/20"
  }];
  return <footer className="relative bg-gradient-to-br from-background via-muted/5 to-primary/5 border-t border-border overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />
      <div className="absolute inset-0" style={{
      backgroundImage: `
          radial-gradient(circle at 25% 25%, hsl(var(--primary) / 0.05) 0%, transparent 45%),
          radial-gradient(circle at 75% 75%, hsl(var(--accent) / 0.05) 0%, transparent 45%),
          radial-gradient(circle at 50% 50%, hsl(var(--muted) / 0.02) 0%, transparent 70%)
        `
    }} />
      
      {/* Floating Herb Elements - Responsive */}
      <div className="absolute top-6 sm:top-10 left-4 sm:left-10 w-6 h-6 sm:w-8 sm:h-8 text-primary/20 animate-float">
        <Leaf className="w-full h-full" />
      </div>
      <div className="absolute top-16 sm:top-32 right-8 sm:right-16 w-4 h-4 sm:w-6 sm:h-6 text-accent/20 animate-float-delay">
        <Leaf className="w-full h-full rotate-45" />
      </div>
      <div className="absolute bottom-20 sm:bottom-40 left-8 sm:left-20 w-6 h-6 sm:w-10 sm:h-10 text-primary/15 animate-float-slow">
        <Leaf className="w-full h-full -rotate-12" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section - Company Info */}
        

        {/* Middle Section - Links & Newsletter */}
        <div className="py-8 sm:py-10 md:py-12 border-b border-border/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            
            {/* Quick Links - Left */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6 animate-fade-in flex flex-col items-center text-center">
              <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center">
                <div className="w-4 sm:w-6 h-0.5 bg-gradient-to-r from-primary to-transparent mr-2 sm:mr-3" />
                Quick Links
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {quickLinks.map(link => <li key={link.name}>
                    <a href={link.href} className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center justify-center group text-sm">
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.name}
                      </span>
                      <span className="ml-1 sm:ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                    </a>
                  </li>)}
              </ul>
            </div>

            {/* Newsletter Section - Middle */}
            <div className="md:col-span-2 lg:col-span-2 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/30 animate-fade-in" style={{
            animationDelay: '0.1s'
          }}>
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-center justify-center space-x-2 mb-1 sm:mb-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">
                      Join Our 
                      <span className="text-primary"> Community</span>
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed px-2">
                    Get exclusive herbal wellness tips and special offers.
                  </p>
                </div>
                
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2 max-w-sm mx-auto">
                  <Input 
                    type="email" 
                    placeholder="Your email address" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    disabled={isSubscribing}
                    className="h-9 sm:h-10 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-sm" 
                  />
                  <Button 
                    type="submit"
                    disabled={isSubscribing}
                    className="h-9 sm:h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubscribing ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Subscribing...</span>
                      </div>
                    ) : (
                      'Subscribe'
                    )}
                  </Button>
                </form>

                {/* Trust Badges */}
                <div className="flex justify-center items-center space-x-3 sm:space-x-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center">
                    <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500 mr-1" />
                    Secure
                  </span>
                  <span className="flex items-center">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-1 animate-pulse" />
                    Weekly Tips
                  </span>
                </div>
              </div>
            </div>

            {/* Legal Links - Right */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6 animate-fade-in flex flex-col items-center text-center" style={{
            animationDelay: '0.2s'
          }}>
              <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center">
                <div className="w-4 sm:w-6 h-0.5 bg-gradient-to-r from-accent to-transparent mr-2 sm:mr-3" />
                Legal
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {legalLinks.map(link => <li key={link.name}>
                    <a href={link.href} className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center justify-center group text-sm">
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.name}
                      </span>
                      <span className="ml-1 sm:ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                    </a>
                  </li>)}
              </ul>
            </div>

          </div>
        </div>

        {/* Certifications Section */}
        <div className="py-6 sm:py-8 border-b border-border/30">
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center justify-center text-center px-4">
              <div className="w-4 sm:w-6 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent mr-2 sm:mr-3" />
              <span className="whitespace-nowrap">Our Certifications & Standards</span>
              <div className="w-4 sm:w-6 h-0.5 bg-gradient-to-l from-emerald-500 to-transparent ml-2 sm:ml-3" />
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
              {certifications.map((cert, index) => {
              const IconComponent = cert.icon;
              return <div key={cert.label} className={`group ${cert.bgColor} border ${cert.borderColor} rounded-lg sm:rounded-xl p-2 sm:p-3 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in cursor-pointer`} style={{
                animationDelay: `${0.1 + index * 0.05}s`
              }}>
                  <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
                    <div className={`${cert.color} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    </div>
                    <span className="font-medium text-foreground text-[10px] sm:text-xs leading-tight">
                      {cert.label}
                    </span>
                  </div>
                </div>;
            })}
            </div>
          </div>
        </div>

        {/* Bottom Section - Social & Copyright */}
        <div className="py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 sm:space-y-6 lg:space-y-0 gap-4">
            
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-muted-foreground text-xs sm:text-sm order-2 lg:order-1">
              <span>© 2025 {storeName}.</span>
            </div>

            {/* Contact & Social Media */}
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6 order-1 lg:order-2">
              <span className="text-xs sm:text-sm font-medium text-foreground text-center">Connect With Us:</span>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <a href={`mailto:${storeEmail}`} className="p-2 sm:p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg sm:rounded-xl text-muted-foreground hover:text-green-600 hover:border-green-600/40 hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href={`tel:${storePhone}`} className="p-2 sm:p-3 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-lg sm:rounded-xl text-muted-foreground hover:text-violet-600 hover:border-violet-600/40 hover:from-violet-500/20 hover:to-purple-500/20 transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="https://www.instagram.com/neweraherbal/" target="_blank" rel="noopener noreferrer" className="p-2 sm:p-3 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg sm:rounded-xl text-muted-foreground hover:text-pink-500 hover:border-pink-500/40 hover:from-pink-500/20 hover:to-purple-500/20 transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="https://www.tiktok.com/@new.era7904?_t=ZS-8yCtFWlprdo&_r=1" target="_blank" rel="noopener noreferrer" className="p-2 sm:p-3 bg-gradient-to-br from-gray-500/10 to-black/10 border border-gray-500/20 rounded-lg sm:rounded-xl text-muted-foreground hover:text-black hover:border-black/40 hover:from-gray-500/20 hover:to-black/20 transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <TikTokIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a href="https://www.facebook.com/new.era.151908" target="_blank" rel="noopener noreferrer" className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg sm:rounded-xl text-muted-foreground hover:text-blue-600 hover:border-blue-600/40 hover:from-blue-500/20 hover:to-blue-600/20 transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Back to Top Button - Responsive */}
      <button 
        onClick={scrollToTop} 
        className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 p-3 sm:p-4 bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-50 animate-bounce" 
        aria-label="Back to top"
      >
        <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    </footer>;
};
export default Footer;