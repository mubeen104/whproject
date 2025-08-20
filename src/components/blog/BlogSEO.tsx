import { Helmet } from 'react-helmet-async';
import { BlogPost } from '@/hooks/useBlogPosts';

interface BlogSEOProps {
  post?: BlogPost;
  isListPage?: boolean;
}

const BlogSEO = ({ post, isListPage = false }: BlogSEOProps) => {
  if (isListPage) {
    return (
      <Helmet>
        <title>Health & Wellness Blog - Natural Herbal Tips | New Era Herbals</title>
        <meta 
          name="description" 
          content="Discover natural health tips, herbal remedies, and wellness advice from our experts. Learn about organic living and natural healing methods." 
        />
        <meta 
          name="keywords" 
          content="herbal blog, natural health, wellness tips, organic living, herbal remedies, natural healing, health blog, wellness blog" 
        />
        <link rel="canonical" href="/blog" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Health & Wellness Blog - Natural Herbal Tips" />
        <meta property="og:description" content="Discover natural health tips, herbal remedies, and wellness advice from our experts." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="/blog" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Health & Wellness Blog - Natural Herbal Tips" />
        <meta name="twitter:description" content="Discover natural health tips, herbal remedies, and wellness advice from our experts." />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "New Era Herbals Health & Wellness Blog",
            "description": "Natural health tips, herbal remedies, and wellness advice",
            "url": "/blog",
            "publisher": {
              "@type": "Organization",
              "name": "New Era Herbals",
              "logo": {
                "@type": "ImageObject",
                "url": "/logo.png"
              }
            }
          })}
        </script>
      </Helmet>
    );
  }

  if (!post) return null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.meta_description || post.short_description || post.title,
    "datePublished": post.created_at,
    "dateModified": post.updated_at,
    "author": {
      "@type": "Person",
      "name": "New Era Herbals Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "New Era Herbals",
      "logo": {
        "@type": "ImageObject",
        "url": "/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `/blog/${post.slug}`
    }
  };

  return (
    <Helmet>
      <title>{post.meta_title || `${post.title} | New Era Herbals Blog`}</title>
      <meta 
        name="description" 
        content={post.meta_description || post.short_description || post.title} 
      />
      <link rel="canonical" href={`/blog/${post.slug}`} />
      
      {/* Open Graph */}
      <meta property="og:title" content={post.meta_title || post.title} />
      <meta property="og:description" content={post.meta_description || post.short_description || post.title} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={`/blog/${post.slug}`} />
      <meta property="article:published_time" content={post.created_at} />
      <meta property="article:modified_time" content={post.updated_at} />
      <meta property="article:author" content="New Era Herbals Team" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.meta_title || post.title} />
      <meta name="twitter:description" content={post.meta_description || post.short_description || post.title} />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default BlogSEO;