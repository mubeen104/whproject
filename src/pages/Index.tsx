import { Helmet } from 'react-helmet-async';
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import KitsDeals from "@/components/KitsDeals";
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
        <link rel="canonical" href="/" />
        <meta property="og:title" content="New Era Herbals - Premium Organic Herbal Products & Natural Wellness Solutions" />
        <meta property="og:description" content="Discover premium organic herbal products, natural remedies, and wellness solutions for holistic health." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        <main className="space-y-16">
          <Hero />
          <div className="animate-fade-in">
            <FeaturedProducts />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <KitsDeals />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Categories />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <FeaturedBlogPosts />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <HomepageTestimonials />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
