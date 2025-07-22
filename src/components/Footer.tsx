import { Leaf, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const quickLinks = [
    { name: "About Us", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Shipping Info", href: "#" },
    { name: "Returns", href: "#" },
    { name: "FAQ", href: "#" },
    { name: "Blog", href: "#" }
  ];

  const categories = [
    { name: "Herbal Teas", href: "#" },
    { name: "Supplements", href: "#" },
    { name: "Essential Oils", href: "#" },
    { name: "Skincare", href: "#" },
    { name: "Superfoods", href: "#" },
    { name: "Gift Sets", href: "#" }
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" }
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-primary-foreground/20">
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <h3 className="text-2xl font-bold">Stay Connected with Nature</h3>
            <p className="text-primary-foreground/80">
              Subscribe to our newsletter for wellness tips, new product launches, and exclusive offers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60 focus:border-primary-foreground"
              />
              <Button variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent-hover">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center">
                <img 
                  src="/lovable-uploads/22303e3e-d2dd-4bad-a05f-9245ad435b33.png" 
                  alt="New Era Herbals Logo" 
                  className="h-16 w-auto"
                />
              </div>
              
              <p className="text-primary-foreground/80 leading-relaxed">
                Dedicated to providing premium natural wellness products sourced 
                ethically from trusted growers worldwide.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-accent" />
                  <span className="text-sm">+92 304 307 3838</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-accent" />
                  <span className="text-sm">neweraorganic101@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-primary-foreground/80 hover:text-accent transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Categories</h3>
              <ul className="space-y-3">
                {categories.map((category) => (
                  <li key={category.name}>
                    <a
                      href={category.href}
                      className="text-primary-foreground/80 hover:text-accent transition-colors duration-200"
                    >
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Certifications & Trust */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Certifications</h3>
              <div className="space-y-4">
                <div className="bg-primary-foreground/10 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🌱</div>
                  <p className="text-sm font-medium">USDA Organic</p>
                </div>
                <div className="bg-primary-foreground/10 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <p className="text-sm font-medium">FDA Approved</p>
                </div>
                <div className="bg-primary-foreground/10 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🔒</div>
                  <p className="text-sm font-medium">Secure Checkout</p>
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
              © 2025 New Era Herbals. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors duration-200">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors duration-200">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors duration-200">
                <Twitter className="h-5 w-5" />
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-4">
              {legalLinks.map((link, index) => (
                <span key={link.name} className="flex items-center space-x-4">
                  <a
                    href={link.href}
                    className="text-primary-foreground/80 hover:text-accent transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                  {index < legalLinks.length - 1 && (
                    <span className="text-primary-foreground/40">|</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;