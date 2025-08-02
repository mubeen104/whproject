import { Leaf, Mail, Phone, Facebook, Instagram, ArrowUp, Heart, Award, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { HalalCertIcon, NaturalCertIcon, EcoFriendlyIcon, GMOFreeIcon, NoChemicalsIcon, OrganicCertIcon } from "@/components/icons/CertificationIcons";
import { useState } from "react";
const Footer = () => {
  const {
    storeName,
    storeEmail,
    storePhone
  } = useStoreSettings();
  const [email, setEmail] = useState('');
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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
    name: "About Us",
    href: "/about"
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
      
      {/* Floating Herb Elements */}
      <div className="absolute top-10 left-10 w-8 h-8 text-primary/20 animate-float">
        <Leaf className="w-full h-full" />
      </div>
      <div className="absolute top-32 right-16 w-6 h-6 text-accent/20 animate-float-delay">
        <Leaf className="w-full h-full rotate-45" />
      </div>
      <div className="absolute bottom-40 left-20 w-10 h-10 text-primary/15 animate-float-slow">
        <Leaf className="w-full h-full -rotate-12" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section - Company Info */}
        <div className="py-16 border-b border-border/30">
          <div className="grid lg:grid-cols-3 gap-12 items-center">
            
            {/* Brand Section */}
            

            {/* Newsletter Section - Middle */}
            <div className="lg:col-span-2 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 border border-border/30 animate-fade-in">
              <div className="text-center space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                      Join Our Wellness 
                      <span className="text-primary"> Community</span>
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Get exclusive herbal wellness tips, early access to new products, and special member discounts delivered to your inbox.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 h-11 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300" />
                  <Button className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Subscribe
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="flex justify-center items-center space-x-6 text-xs text-muted-foreground pt-2">
                  <span className="flex items-center">
                    <ShieldCheck className="w-3 h-3 text-green-500 mr-1" />
                    Secure & Private
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse" />
                    Weekly Tips
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-1 animate-pulse" />
                    Exclusive Offers
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Middle Section - Links & Newsletter */}
        <div className="py-12 border-b border-border/30">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Quick Links - Left */}
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold text-foreground flex items-center">
                <div className="w-6 h-0.5 bg-gradient-to-r from-primary to-transparent mr-3" />
                Quick Links
              </h3>
              <ul className="space-y-3">
                {quickLinks.map(link => <li key={link.name}>
                    <a href={link.href} className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center group text-sm">
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.name}
                      </span>
                      <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                    </a>
                  </li>)}
              </ul>
            </div>

            {/* Newsletter Section - Middle */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-6 border border-border/30 animate-fade-in" style={{
              animationDelay: '0.1s'
            }}>
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <Mail className="w-3 h-3 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      Join Our 
                      <span className="text-primary"> Community</span>
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Get exclusive herbal wellness tips and special offers.
                  </p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Input 
                    type="email" 
                    placeholder="Your email address" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="h-10 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300" 
                  />
                  <Button className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Subscribe
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="flex justify-center items-center space-x-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center">
                    <ShieldCheck className="w-3 h-3 text-green-500 mr-1" />
                    Secure
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse" />
                    Weekly Tips
                  </span>
                </div>
              </div>
            </div>

            {/* Legal Links - Right */}
            <div className="space-y-6 animate-fade-in" style={{
              animationDelay: '0.2s'
            }}>
              <h3 className="text-lg font-bold text-foreground flex items-center">
                <div className="w-6 h-0.5 bg-gradient-to-r from-accent to-transparent mr-3" />
                Legal
              </h3>
              <ul className="space-y-3">
                {legalLinks.map(link => <li key={link.name}>
                    <a href={link.href} className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center group text-sm">
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.name}
                      </span>
                      <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                    </a>
                  </li>)}
              </ul>
            </div>

          </div>
        </div>

        {/* Certifications Section */}
        <div className="py-8 border-b border-border/30">
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-foreground flex items-center justify-center">
              <div className="w-6 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent mr-3" />
              Our Certifications & Standards
              <div className="w-6 h-0.5 bg-gradient-to-l from-emerald-500 to-transparent ml-3" />
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {certifications.map((cert, index) => {
                const IconComponent = cert.icon;
                return <div key={cert.label} className={`group ${cert.bgColor} border ${cert.borderColor} rounded-xl p-3 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in cursor-pointer`} style={{
                  animationDelay: `${0.1 + index * 0.05}s`
                }}>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`${cert.color} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-foreground text-xs leading-tight">
                      {cert.label}
                    </span>
                  </div>
                </div>;
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section - Social & Copyright */}
        <div className="py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-muted-foreground text-sm">
              <span>© 2025 {storeName}. Crafted with</span>
              <Heart className="h-4 w-4 text-red-500 animate-pulse" />
              <span>for your wellness journey</span>
            </div>

            {/* Contact & Social Media */}
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium text-foreground">Connect With Us:</span>
              <div className="flex items-center space-x-3">
                <a href={`mailto:${storeEmail}`} className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl text-muted-foreground hover:text-green-600 hover:border-green-600/40 hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <Mail className="h-5 w-5" />
                </a>
                <a href={`tel:${storePhone}`} className="p-3 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl text-muted-foreground hover:text-violet-600 hover:border-violet-600/40 hover:from-violet-500/20 hover:to-purple-500/20 transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <Phone className="h-5 w-5" />
                </a>
                <a href="https://www.instagram.com/neweraherbal/" target="_blank" rel="noopener noreferrer" className="p-3 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl text-muted-foreground hover:text-pink-500 hover:border-pink-500/40 hover:from-pink-500/20 hover:to-purple-500/20 transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://www.tiktok.com/@new.era7904?_t=ZS-8yCtFWlprdo&_r=1" target="_blank" rel="noopener noreferrer" className="p-3 bg-gradient-to-br from-gray-500/10 to-black/10 border border-gray-500/20 rounded-xl text-muted-foreground hover:text-black hover:border-black/40 hover:from-gray-500/20 hover:to-black/20 transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <TikTokIcon className="h-5 w-5" />
                </a>
                <a href="https://www.facebook.com/new.era.151908" target="_blank" rel="noopener noreferrer" className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl text-muted-foreground hover:text-blue-600 hover:border-blue-600/40 hover:from-blue-500/20 hover:to-blue-600/20 transition-all duration-300 hover:scale-110 hover:shadow-lg">
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Back to Top Button */}
      <button onClick={scrollToTop} className="fixed bottom-24 right-6 p-4 bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-50 animate-bounce" aria-label="Back to top">
        <ArrowUp className="h-5 w-5" />
      </button>
    </footer>;
};
export default Footer;