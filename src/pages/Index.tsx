import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import KitsDeals from "@/components/KitsDeals";
import Categories from "@/components/Categories";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="space-y-16">
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
      </div>
      <Footer />
    </div>
  );
};

export default Index;
