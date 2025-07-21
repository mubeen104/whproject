import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Package, DollarSign, Eye, EyeOff, Search } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  inventory_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  sku: string;
  created_at: string;
}

export default function AdminProducts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    inventory_quantity: '',
    sku: '',
    is_active: true,
    is_featured: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Create/Update product mutation
  const productMutation = useMutation({
    mutationFn: async (productData: any) => {
      if (editingProduct) {
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([{
            ...productData,
            slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      toast({
        title: "Success",
        description: `Product ${editingProduct ? 'updated' : 'created'} successfully.`,
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

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      toast({
        title: "Success",
        description: "Product deleted successfully.",
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
      price: '',
      description: '',
      inventory_quantity: '',
      sku: '',
      is_active: true,
      is_featured: false
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || '',
      inventory_quantity: product.inventory_quantity.toString(),
      sku: product.sku || '',
      is_active: product.is_active,
      is_featured: product.is_featured
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      inventory_quantity: parseInt(formData.inventory_quantity),
      sku: formData.sku,
      is_active: formData.is_active,
      is_featured: formData.is_featured
    };

    productMutation.mutate(productData);
  };

  // Filter products based on search
  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your product inventory and pricing
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingProduct(null); resetForm(); }} className="hover-scale">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (PKR) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Describe your product..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inventory">Inventory Quantity *</Label>
                    <Input
                      id="inventory"
                      type="number"
                      value={formData.inventory_quantity}
                      onChange={(e) => setFormData({ ...formData, inventory_quantity: e.target.value })}
                      required
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="Product SKU"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active" className="text-sm font-medium">Active Product</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label htmlFor="is_featured" className="text-sm font-medium">Featured Product</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setIsDialogOpen(false); setEditingProduct(null); }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={productMutation.isPending} className="hover-scale">
                    {productMutation.isPending ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/50 hover:shadow-medium transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products?.length || 0}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 hover:shadow-medium transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                <p className="text-2xl font-bold">{products?.filter(p => p.is_active).length || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-medium transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Featured Products</p>
                <p className="text-2xl font-bold">{products?.filter(p => p.is_featured).length || 0}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Package className="h-6 w-6 mr-3 text-primary" />
            Product Inventory
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
                    <TableHead className="font-semibold">Product Details</TableHead>
                    <TableHead className="font-semibold">Price</TableHead>
                    <TableHead className="font-semibold">Stock Level</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts?.map((product: Product) => (
                    <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{product.name}</p>
                          {product.sku && (
                            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                          )}
                          {product.description && (
                            <p className="text-sm text-muted-foreground max-w-md truncate">{product.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center font-semibold">
                          <span className="text-xs text-muted-foreground mr-1">PKR</span>
                          <span className="text-lg">{product.price.toFixed(2)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant={
                            product.inventory_quantity > 20 ? "default" : 
                            product.inventory_quantity > 5 ? "secondary" : 
                            product.inventory_quantity > 0 ? "destructive" : "outline"
                          }
                          className="font-medium"
                        >
                          {product.inventory_quantity} units
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? (
                              <><Eye className="h-3 w-3 mr-1" />Active</>
                            ) : (
                              <><EyeOff className="h-3 w-3 mr-1" />Inactive</>
                            )}
                          </Badge>
                          {product.is_featured && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              ⭐ Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMutation.mutate(product.id)}
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
          
          {filteredProducts?.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery ? 'No products found' : 'No products yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Create your first product to get started selling!'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => { setEditingProduct(null); resetForm(); setIsDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}