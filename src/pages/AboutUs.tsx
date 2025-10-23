import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Award, Heart, Users } from 'lucide-react';

export default function AboutUs() {
  return (
    <>
      <Helmet>
        <title>About New Era Herbals | Premium Organic Herbal Products & Natural Wellness Experts</title>
        <meta name="description" content="Learn about New Era Herbals' commitment to premium organic herbal products, natural remedies, and holistic wellness solutions. Discover our mission to provide certified organic supplements and ayurvedic herbs." />
        <meta name="keywords" content="about herbal company, organic supplement provider, natural wellness experts, herbal product specialists, ayurvedic herbs, certified organic, holistic health company" />
        <link rel="canonical" href="/about" />
        <meta property="og:title" content="About New Era Herbals | Premium Organic Herbal Products" />
        <meta property="og:description" content="Premium organic herbal products and natural wellness solutions from trusted experts." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-muted/20 border-b">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23059669%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          <div className="relative container mx-auto px-4 py-20">
            <header className="text-center max-w-4xl mx-auto">
              <div className="inline-block p-1 bg-primary/10 rounded-full mb-8">
                <div className="bg-background rounded-full px-8 py-3 shadow-lg">
                  <span className="text-sm font-bold text-primary">Our Story</span>
                </div>
              </div>
              <h1 className="text-6xl md:text-7xl font-bold mb-8 text-foreground leading-tight">
                About New Era Herbals
              </h1>
              <h2 className="text-3xl md:text-4xl text-muted-foreground mb-4">
                Your Trusted Source for Premium Organic Herbal Products
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Committed to providing certified organic supplements, natural remedies, and holistic wellness solutions for a healthier, more balanced life
              </p>
            </header>
          </div>
        </section>

        <main className="container mx-auto px-4 py-20 max-w-6xl">
          {/* Mission Section */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Our Mission</h2>
              <h3 className="text-2xl text-muted-foreground mb-4">Empowering Natural Wellness Through Quality Herbal Products</h3>
            </div>
            <Card className="border-2 shadow-xl">
              <CardContent className="p-8 md:p-12">
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  At New Era Herbals, we believe in the transformative power of nature. Our mission is to provide premium organic herbal products, natural remedies, and ayurvedic wellness solutions that support your journey to optimal health and vitality.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We source only the finest certified organic herbs, botanicals, and natural ingredients from sustainable suppliers worldwide. Every product in our collection is carefully selected to meet the highest standards of purity, potency, and effectiveness for holistic wellness.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Values Section */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Our Core Values</h2>
              <h3 className="text-2xl text-muted-foreground">Principles That Guide Our Natural Wellness Approach</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                    <Leaf className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-2xl font-bold text-foreground mb-4">Organic & Natural</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    We prioritize certified organic ingredients and natural formulations free from synthetic additives, ensuring pure and authentic herbal supplements for your wellness journey.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="bg-accent/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                    <Award className="h-8 w-8 text-accent" />
                  </div>
                  <h4 className="text-2xl font-bold text-foreground mb-4">Quality Assurance</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Every herbal product undergoes rigorous testing and quality control to guarantee potency, purity, and safety. We maintain the highest standards in natural wellness products.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="bg-secondary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                    <Heart className="h-8 w-8 text-secondary" />
                  </div>
                  <h4 className="text-2xl font-bold text-foreground mb-4">Holistic Wellness</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    We embrace traditional ayurvedic wisdom combined with modern science to offer comprehensive natural remedies that support mind, body, and spirit balance.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-2xl font-bold text-foreground mb-4">Customer Care</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Your wellness journey is our priority. We provide expert guidance, educational resources, and personalized support to help you achieve your natural health goals.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Product Quality Section */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Premium Organic Herbal Products</h2>
              <h3 className="text-2xl text-muted-foreground">What Sets Our Natural Wellness Solutions Apart</h3>
            </div>
            
            <Card className="border-2 shadow-xl bg-gradient-to-br from-card to-muted/10">
              <CardContent className="p-8 md:p-12">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xl font-semibold text-foreground mb-3">🌿 Certified Organic Ingredients</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      All our herbal supplements use certified organic herbs and botanicals sourced from trusted sustainable farms, ensuring maximum purity and environmental responsibility.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-semibold text-foreground mb-3">🔬 Scientific Validation</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Our natural remedies combine traditional ayurvedic knowledge with modern scientific research to deliver effective holistic wellness solutions backed by evidence.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-semibold text-foreground mb-3">✨ Third-Party Testing</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Every batch of our organic supplements undergoes independent laboratory testing for purity, potency, and safety to ensure the highest quality natural health products.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-semibold text-foreground mb-3">🌍 Sustainable Practices</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      We partner with ethical suppliers who share our commitment to environmental sustainability, fair trade, and preserving natural herbal resources for future generations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Commitment Section */}
          <section>
            <Card className="border-2 shadow-2xl bg-primary/5">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Our Commitment to Your Natural Health
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
                  Whether you're seeking organic herbal supplements for daily wellness, natural remedies for specific health concerns, or ayurvedic solutions for holistic balance, New Era Herbals is your trusted partner in natural health. We're dedicated to providing premium organic products, expert guidance, and exceptional service to support your journey to optimal wellness.
                </p>
                <p className="text-lg text-muted-foreground italic">
                  "Empowering health naturally, one herb at a time."
                </p>
              </CardContent>
            </Card>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
