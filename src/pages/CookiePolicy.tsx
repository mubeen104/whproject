import { Leaf } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Cookie Policy</h1>
            <p className="text-muted-foreground">Last updated: July 31, 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
              This Cookie Policy explains how we use cookies and similar technologies to recognize you when you visit our website.
            </p>

            <h2>What are Cookies?</h2>
            <p>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work efficiently and provide useful information to website owners.
            </p>

            <h2>How We Use Cookies</h2>
            <p>
              We use cookies for the following purposes:
            </p>
            <ul>
              <li>Essential cookies for website functionality</li>
              <li>Analytics cookies to understand how visitors use our website</li>
              <li>Preference cookies to remember your settings and choices</li>
              <li>Marketing cookies for targeted advertising</li>
            </ul>

            <h2>Types of Cookies We Use</h2>
            <h3>Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function and cannot be switched off. They include:
            </p>
            <ul>
              <li>Session cookies for navigation</li>
              <li>Shopping cart cookies</li>
              <li>Authentication cookies</li>
            </ul>

            <h3>Analytics Cookies</h3>
            <p>
              These help us understand how visitors interact with our website:
            </p>
            <ul>
              <li>Page visit statistics</li>
              <li>Traffic sources</li>
              <li>Time spent on site</li>
            </ul>

            <h2>Your Cookie Choices</h2>
            <p>
              You can control cookies through your browser settings:
            </p>
            <ul>
              <li>Block all cookies</li>
              <li>Delete existing cookies</li>
              <li>Allow cookies from specific websites</li>
            </ul>

            <h2>Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. The updated version will be indicated by an updated "Last updated" date.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have questions about our Cookie Policy, please contact us at:
            </p>
            <ul>
              <li>Email: privacy@herbalbloom.com</li>
              <li>Phone: 1-800-HERBAL</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CookiePolicy;
