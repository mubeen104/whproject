import { Leaf, Mail, Phone, MapPin, Facebook, Instagram, Twitter, ArrowUp, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { useState } from "react";

const Footer = () => {
  const {
    storeName,
    storeEmail,
    storePhone
  } = useStoreSettings();
  
  const [email, setEmail] = useState('');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const legalLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" }
  ];

  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Shop", href: "/shop" },
    { name: "Contact", href: "/contact" }
  ];

  const certifications = [
    { icon: "حلال", label: "Halal Certified", color: "text-green-400" },
    { icon: "🌿", label: "100% Natural", color: "text-emerald-400" },
    { icon: "♻️", label: "Eco-Friendly", color: "text-blue-400" },
    { icon: "🚫", label: "GMO Free", color: "text-red-400" },
    { icon: "🧪", label: "No Chemicals", color: "text-purple-400" }
  ];

  return (
    <footer className="relative bg-background border-t border-border overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/20 via-transparent to-primary/5" />
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.03) 0%, transparent 50%),
                         radial-gradient(circle at 80% 20%, hsl(var(--accent) / 0.03) 0%, transparent 50%)`
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-16 border-b border-border/50">
          <div className="text-center max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                Stay Connected with 
                <span className="text-primary"> Nature</span>
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Subscribe to our newsletter for wellness tips, new product launches, and exclusive offers.
                Join our community of wellness enthusiasts.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-300"
              />
              <Button 
                className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Subscribe
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex justify-center items-center space-x-8 text-sm text-muted-foreground pt-4">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                No Spam
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" />
                Unsubscribe Anytime
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse" />
                Weekly Updates
              </span>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2 space-y-8 animate-fade-in">
              <div className="flex items-center space-x-3 group">
                <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
                  <Leaf className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{storeName}</h2>
              </div>
              
              <p className="text-muted-foreground leading-relaxed text-lg max-w-md">
                Dedicated to providing premium natural wellness products sourced 
                ethically from trusted growers worldwide. Pure, organic, and authentic.
              </p>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-card border border-border/50 rounded-xl hover:border-primary/30 transition-all duration-300 group">
                  <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{storePhone}</span>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-card border border-border/50 rounded-xl hover:border-primary/30 transition-all duration-300 group">
                  <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{storeEmail}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-xl font-bold text-foreground flex items-center">
                <div className="w-8 h-0.5 bg-gradient-to-r from-primary to-transparent mr-3" />
                Quick Links
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center group"
                    >
                      <span className="group-hover:translate-x-2 transition-transform duration-300">
                        {link.name}
                      </span>
                      <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Certifications */}
            <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-xl font-bold text-foreground flex items-center">
                <div className="w-8 h-0.5 bg-gradient-to-r from-accent to-transparent mr-3" />
                Certifications
              </h3>
              <div className="space-y-3">
                {certifications.map((cert, index) => (
                  <div 
                    key={cert.label}
                    className="group bg-card border border-border/50 rounded-xl p-3 hover:border-primary/30 transition-all duration-300 hover:shadow-md animate-fade-in"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`text-xl ${cert.color} group-hover:scale-110 transition-transform duration-300`}>
                        {cert.icon}
                      </div>
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                        {cert.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-8 border-t border-border/50">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-muted-foreground">
              <span>© 2025 {storeName}. Made with</span>
              <Heart className="h-4 w-4 text-red-500 animate-pulse" />
              <span>for your wellness</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium text-foreground">Follow Us:</span>
              <div className="flex items-center space-x-4">
                <a 
                  href="https://www.instagram.com/neweraherbal/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-3 bg-card border border-border/50 rounded-full text-muted-foreground hover:text-pink-500 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all duration-300 hover:scale-110"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="https://www.tiktok.com/@new.era7904?_t=ZS-8yCtFWlprdo&_r=1" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-3 bg-card border border-border/50 rounded-full text-muted-foreground hover:text-black hover:border-black/30 hover:bg-black/5 transition-all duration-300 hover:scale-110"
                >
                  <TikTokIcon className="h-5 w-5" />
                </a>
                <a 
                  href="https://www.facebook.com/new.era.151908" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-3 bg-card border border-border/50 rounded-full text-muted-foreground hover:text-blue-600 hover:border-blue-600/30 hover:bg-blue-600/5 transition-all duration-300 hover:scale-110"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6">
              {legalLinks.map((link, index) => (
                <a 
                  key={link.name}
                  href={link.href} 
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-24 right-6 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-50 animate-bounce"
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </footer>
  );
};

export default Footer;