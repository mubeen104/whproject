import { Helmet } from 'react-helmet-async';
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BestSellingProducts from "@/components/BestSellingProducts";
import KitsDeals from "@/components/KitsDeals";
import NewArrivals from "@/components/NewArrivals";
import Categories from "@/components/Categories";
import FeaturedBlogPosts from "@/components/blog/FeaturedBlogPosts";
import HomepageTestimonials from "@/components/HomepageTestimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>New Era Herbals - Premium Organic Herbal Products & Natural Wellness Solutions</title>
        <meta name="description" content="Discover premium organic herbal products, natural remedies, and wellness solutions. Shop certified organic supplements, herbal teas, ayurvedic herbs, and natural health products for holistic wellness." />
        <meta name="keywords" content="herbal products, organic supplements, natural remedies, herbal teas, wellness products, organic health, ayurvedic herbs, natural wellness, herbal medicine, holistic health, organic skincare, herbal supplements, natural health products, plant-based wellness" />
        <link rel="canonical" href="https://www.neweraherbals.com/" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.neweraherbals.com/" />
        <meta property="og:title" content="New Era Herbals - Premium Organic Herbal Products & Natural Wellness Solutions" />
        <meta property="og:description" content="Discover premium organic herbal products, natural remedies, and wellness solutions for holistic health." />
        <meta property="og:image" content="https://www.neweraherbals.com/logo.png" />
        <meta property="og:site_name" content="New Era Herbals" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.neweraherbals.com/" />
        <meta name="twitter:title" content="New Era Herbals - Premium Organic Herbal Products" />
        <meta name="twitter:description" content="Discover premium organic herbal products, natural remedies, and wellness solutions for holistic health." />
        <meta name="twitter:image" content="https://www.neweraherbals.com/logo.png" />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="author" content="New Era Herbals" />
        
        {/* Structured Data - Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "New Era Herbals",
            "url": "https://www.neweraherbals.com",
            "logo": "https://www.neweraherbals.com/logo.png",
            "description": "Premium organic herbal products, natural remedies, and wellness solutions for holistic health",
            "sameAs": [
              "https://www.facebook.com/neweraherbals",
              "https://www.instagram.com/neweraherbals",
              "https://twitter.com/neweraherbals"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Service",
              "email": "info@neweraherbals.com"
            }
          })}
        </script>
        
        {/* Structured Data - WebSite */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "New Era Herbals",
            "url": "https://www.neweraherbals.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.neweraherbals.com/shop?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        <main className="space-y-16">
          <h1 className="sr-only">Premium Organic Herbal Products & Natural Wellness Solutions - New Era Herbals</h1>
          {/* 1. Hero Slides */}
          <Hero />
          {/* 2. Best Selling Products */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <BestSellingProducts />
          </div>
          {/* 3. Categories (merged - slider design with all categories) */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Categories />
          </div>
          {/* 4. Featured Kits */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <KitsDeals />
          </div>
          {/* 5. New Arrivals */}
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <NewArrivals />
          </div>
          {/* Additional Content */}
          <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <FeaturedBlogPosts />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <HomepageTestimonials />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
