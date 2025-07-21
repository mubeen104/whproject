import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, FolderTree, Eye, EyeOff, Search } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export default function AdminCategories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    sort_order: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Create/Update category mutation
  const categoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      if (editingCategory) {
        const { data, error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert([{
            ...categoryData,
            slug: categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setIsDialogOpen(false);
      setEditingCategory(null);
      resetForm();
      toast({
        title: "Success",
        description: `Category ${editingCategory ? 'updated' : 'created'} successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({
        title: "Success",
        description: "Category deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true,
      sort_order: ''
    });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      is_active: category.is_active,
      sort_order: category.sort_order.toString()
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData = {
      name: formData.name,
      description: formData.description,
      is_active: formData.is_active,
      sort_order: parseInt(formData.sort_order) || 0
    };

    categoryMutation.mutate(categoryData);
  };

  // Filter categories based on search
  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Organize your products with categories and subcategories
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingCategory(null); resetForm(); }} className="hover-scale">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter category name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Describe this category..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                    placeholder="0 (lower numbers appear first)"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active" className="text-sm font-medium">Active Category</Label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setIsDialogOpen(false); setEditingCategory(null); }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={categoryMutation.isPending} className="hover-scale">
                    {categoryMutation.isPending ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 hover:shadow-medium transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold">{categories?.length || 0}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <FolderTree className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 hover:shadow-medium transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Categories</p>
                <p className="text-2xl font-bold">{categories?.filter(c => c.is_active).length || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <FolderTree className="h-6 w-6 mr-3 text-primary" />
            Category Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Category Name</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Sort Order</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories?.map((category: Category) => (
                    <TableRow key={category.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="py-4">
                        <p className="font-semibold text-foreground">{category.name}</p>
                      </TableCell>
                      <TableCell className="py-4">
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {category.description || 'No description provided'}
                        </p>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="font-medium">
                          {category.sort_order}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant={category.is_active ? "default" : "secondary"}>
                          {category.is_active ? (
                            <><Eye className="h-3 w-3 mr-1" />Active</>
                          ) : (
                            <><EyeOff className="h-3 w-3 mr-1" />Inactive</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            className="hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMutation.mutate(category.id)}
                            disabled={deleteMutation.isPending}
                            className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {filteredCategories?.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <FolderTree className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? 'No categories found' : 'No categories yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Create your first category to organize your products!'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => { setEditingCategory(null); resetForm(); setIsDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Category
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}