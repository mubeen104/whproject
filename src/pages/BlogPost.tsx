import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { useBlogPost } from '@/hooks/useBlogPosts';
import { format } from 'date-fns';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
            <Link to="/blog">
              <Button>Back to Blog</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.meta_title || post.title}</title>
        <meta name="description" content={post.meta_description || post.title} />
        <link rel="canonical" href={`/blog/${post.slug}`} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            {/* Article Header */}
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                {post.title}
              </h1>
              
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.created_at), 'MMMM dd, yyyy')}
                </div>
              </div>
            </header>

            {/* Article Content */}
            <article className="prose prose-lg max-w-none">
              <div 
                dangerouslySetInnerHTML={{ __html: post.content }}
                className="text-foreground"
              />
            </article>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default BlogPost;