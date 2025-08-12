import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Blog = () => {
  const { data: blogPosts, isLoading, error } = useBlogPosts(true);

  const getExcerpt = (content: string, maxLength = 150) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading blog posts...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-destructive">Error loading blog posts</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Health & Wellness Blog - Natural Herbal Tips</title>
        <meta name="description" content="Discover natural health tips, herbal remedies, and wellness advice from our experts. Learn about organic living and natural healing methods." />
        <meta name="keywords" content="herbal blog, natural health, wellness tips, organic living, herbal remedies" />
        <link rel="canonical" href="/blog" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Health & Wellness Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover natural health tips, herbal remedies, and wellness advice from our experts
            </p>
          </div>

          {/* Blog Posts Grid */}
          {blogPosts && blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(post.created_at), 'MMM dd, yyyy')}
                    </div>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {getExcerpt(post.content)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/blog/${post.slug}`}>
                      <Button variant="outline" className="w-full">
                        Read More
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                No blog posts yet
              </h3>
              <p className="text-muted-foreground">
                Check back soon for helpful health and wellness articles!
              </p>
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Blog;