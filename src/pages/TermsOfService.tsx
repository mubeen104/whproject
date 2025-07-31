import { Leaf } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsOfService = () => {
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
            <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: July 31, 2025</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
              Welcome to Herbal Bloom. By accessing our website, you agree to these terms and conditions.
            </p>

            <h2>1. Use of Website</h2>
            <p>
              By using our website, you agree to:
            </p>
            <ul>
              <li>Use the website lawfully</li>
              <li>Not interfere with the website's security</li>
              <li>Not use the website for unauthorized purposes</li>
              <li>Provide accurate information when making purchases</li>
            </ul>

            <h2>2. Products and Services</h2>
            <p>
              We strive to provide accurate product descriptions and pricing. However:
            </p>
            <ul>
              <li>We reserve the right to modify or discontinue products</li>
              <li>Product images are representative only</li>
              <li>Prices are subject to change without notice</li>
            </ul>

            <h2>3. Ordering and Payment</h2>
            <p>
              When placing an order:
            </p>
            <ul>
              <li>You must provide accurate billing and shipping information</li>
              <li>Payment is required at time of order</li>
              <li>We accept major credit cards and other specified payment methods</li>
            </ul>

            <h2>4. Shipping and Delivery</h2>
            <ul>
              <li>Delivery times are estimates only</li>
              <li>Risk of loss passes to you upon delivery</li>
              <li>You are responsible for providing accurate shipping information</li>
            </ul>

            <h2>5. Returns and Refunds</h2>
            <p>
              Our return policy:
            </p>
            <ul>
              <li>30-day return window for unused products</li>
              <li>Original packaging required</li>
              <li>Shipping costs for returns are buyer's responsibility</li>
            </ul>

            <h2>6. Disclaimer</h2>
            <p>
              We provide our website and services "as is" without any warranty or condition.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have questions about our Terms of Service, please contact us at:
            </p>
            <ul>
              <li>Email: legal@herbalbloom.com</li>
              <li>Phone: 1-800-HERBAL</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
