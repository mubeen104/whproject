import { Leaf, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import TikTokIcon from "@/components/icons/TikTokIcon";
const Footer = () => {
  const {
    storeName,
    storeEmail,
    storePhone
  } = useStoreSettings();
  const legalLinks = [{
    name: "Privacy Policy",
    href: "#"
  }, {
    name: "Terms of Service",
    href: "#"
  }, {
    name: "Cookie Policy",
    href: "#"
  }];
  return <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-primary-foreground/20">
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <h3 className="text-2xl font-bold">Stay Connected with Nature</h3>
            <p className="text-primary-foreground/80">
              Subscribe to our newsletter for wellness tips, new product launches, and exclusive offers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input type="email" placeholder="Enter your email" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60 focus:border-primary-foreground" />
              <Button variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent-hover">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Company Info */}
            <div className="space-y-8">
              <div className="flex items-center space-x-3">
                <Leaf className="h-8 w-8 text-accent" />
                <h2 className="text-2xl font-bold text-primary-foreground">{storeName}</h2>
              </div>
              
              <p className="text-primary-foreground/90 leading-relaxed text-lg">
                Dedicated to providing premium natural wellness products sourced 
                ethically from trusted growers worldwide. Pure, organic, and authentic.
              </p>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-primary-foreground/5 rounded-lg backdrop-blur-sm">
                  <div className="p-2 bg-accent/20 rounded-full">
                    <Phone className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-primary-foreground font-medium">{storePhone}</span>
                </div>
                <div className="flex items-center space-x-4 p-3 bg-primary-foreground/5 rounded-lg backdrop-blur-sm">
                  <div className="p-2 bg-accent/20 rounded-full">
                    <Mail className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-primary-foreground font-medium">{storeEmail}</span>
                </div>
              </div>
            </div>

            {/* Premium Certifications */}
            <div>
              <h3 className="text-xl font-bold mb-8 text-primary-foreground flex items-center">
                <div className="w-12 h-0.5 bg-gradient-to-r from-accent to-transparent mr-3"></div>
                Quality Certifications
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="group bg-gradient-to-br from-primary-foreground/10 to-primary-foreground/5 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/10 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl font-bold text-accent">حلال</div>
                    <span className="font-semibold text-primary-foreground group-hover:text-accent transition-colors">Halal Certified</span>
                  </div>
                </div>
                <div className="group bg-gradient-to-br from-primary-foreground/10 to-primary-foreground/5 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/10 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🌿</div>
                    <span className="font-semibold text-primary-foreground group-hover:text-accent transition-colors">100% Natural</span>
                  </div>
                </div>
                <div className="group bg-gradient-to-br from-primary-foreground/10 to-primary-foreground/5 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/10 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">♻️</div>
                    <span className="font-semibold text-primary-foreground group-hover:text-accent transition-colors">Eco-Friendly</span>
                  </div>
                </div>
                <div className="group bg-gradient-to-br from-primary-foreground/10 to-primary-foreground/5 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/10 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🚫</div>
                    <span className="font-semibold text-primary-foreground group-hover:text-accent transition-colors">GMO Free</span>
                  </div>
                </div>
                <div className="group bg-gradient-to-br from-primary-foreground/10 to-primary-foreground/5 backdrop-blur-sm rounded-xl p-4 border border-primary-foreground/10 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🧪</div>
                    <span className="font-semibold text-primary-foreground group-hover:text-accent transition-colors">No Chemicals</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-primary-foreground/80 text-sm">
              © 2025 {storeName}. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <a href="https://www.instagram.com/neweraherbal/" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-accent transition-colors duration-200">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.tiktok.com/@new.era7904?_t=ZS-8yCtFWlprdo&_r=1" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-accent transition-colors duration-200">
                <TikTokIcon className="h-5 w-5" />
              </a>
              <a href="https://www.facebook.com/new.era.151908" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 hover:text-accent transition-colors duration-200">
                <Facebook className="h-5 w-5" />
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-4">
              {legalLinks.map((link, index) => <span key={link.name} className="flex items-center space-x-4">
                  <a href={link.href} className="text-primary-foreground/80 hover:text-accent transition-colors duration-200 text-sm">
                    {link.name}
                  </a>
                  {index < legalLinks.length - 1 && <span className="text-primary-foreground/40">|</span>}
                </span>)}
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;