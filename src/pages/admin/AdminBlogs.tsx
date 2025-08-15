import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { useBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost, BlogPost } from '@/hooks/useBlogPosts';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import RichTextEditor from '@/components/blog/RichTextEditor';

const AdminBlogs = () => {
  const { data: blogPosts, isLoading } = useBlogPosts(false);
  const createBlogPost = useCreateBlogPost();
  const updateBlogPost = useUpdateBlogPost();
  const deleteBlogPost = useDeleteBlogPost();
  const { toast } = useToast();
  const { user } = useAuth();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    short_description: '',
    meta_title: '',
    meta_description: '',
    slug: '',
    is_published: false,
    is_featured: false,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      short_description: '',
      meta_title: '',
      meta_description: '',
      slug: '',
      is_published: false,
      is_featured: false,
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleCreate = async () => {
    try {
      await createBlogPost.mutateAsync({
        ...formData,
        author_id: user?.id || ''
      });
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create blog post",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingPost) return;
    
    try {
      await updateBlogPost.mutateAsync({
        id: editingPost.id,
        ...formData,
      });
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
      setEditingPost(null);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update blog post",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBlogPost.mutateAsync(id);
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      short_description: post.short_description || '',
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
      slug: post.slug,
      is_published: post.is_published,
      is_featured: post.is_featured,
    });
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground">
            Create and manage blog posts for SEO optimization
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Blog Post</DialogTitle>
              <DialogDescription>
                Add a new blog post with SEO optimization
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter blog post title"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-friendly-slug"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                  placeholder="Brief description for blog post listing"
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="content">Content *</Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="Write your blog post content here..."
                  className="min-h-[300px]"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="meta_title">Meta Title (SEO)</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="SEO optimized title (max 60 chars)"
                  maxLength={60}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="meta_description">Meta Description (SEO)</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="SEO optimized description (max 160 chars)"
                  maxLength={160}
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                  />
                  <Label htmlFor="is_published">Publish immediately</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                  <Label htmlFor="is_featured">Featured post</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createBlogPost.isPending}>
                {createBlogPost.isPending ? 'Creating...' : 'Create Post'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {blogPosts && blogPosts.length > 0 ? (
          blogPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      <Badge variant={post.is_published ? "default" : "secondary"}>
                        {post.is_published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(post.created_at), 'MMM dd, yyyy')}
                        </span>
                        <span>Slug: /{post.slug}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {post.is_published && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(post)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Blog Post</DialogTitle>
                          <DialogDescription>
                            Update your blog post content and SEO settings
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="edit_title">Title *</Label>
                            <Input
                              id="edit_title"
                              value={formData.title}
                              onChange={(e) => handleTitleChange(e.target.value)}
                              placeholder="Enter blog post title"
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="edit_slug">URL Slug</Label>
                            <Input
                              id="edit_slug"
                              value={formData.slug}
                              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                              placeholder="url-friendly-slug"
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="edit_short_description">Short Description</Label>
                            <Textarea
                              id="edit_short_description"
                              value={formData.short_description}
                              onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                              placeholder="Brief description for blog post listing"
                              className="min-h-[80px]"
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="edit_content">Content *</Label>
                            <RichTextEditor
                              value={formData.content}
                              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                              placeholder="Write your blog post content here..."
                              className="min-h-[300px]"
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="edit_meta_title">Meta Title (SEO)</Label>
                            <Input
                              id="edit_meta_title"
                              value={formData.meta_title}
                              onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                              placeholder="SEO optimized title (max 60 chars)"
                              maxLength={60}
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="edit_meta_description">Meta Description (SEO)</Label>
                            <Textarea
                              id="edit_meta_description"
                              value={formData.meta_description}
                              onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                              placeholder="SEO optimized description (max 160 chars)"
                              maxLength={160}
                              className="min-h-[80px]"
                            />
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="edit_is_published"
                                checked={formData.is_published}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                              />
                              <Label htmlFor="edit_is_published">Published</Label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="edit_is_featured"
                                checked={formData.is_featured}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                              />
                              <Label htmlFor="edit_is_featured">Featured post</Label>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setEditingPost(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdate} disabled={updateBlogPost.isPending}>
                            {updateBlogPost.isPending ? 'Updating...' : 'Update Post'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{post.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(post.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              {(post.short_description || post.meta_description) && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{post.short_description || post.meta_description}</p>
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No blog posts yet. Create your first post to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminBlogs;