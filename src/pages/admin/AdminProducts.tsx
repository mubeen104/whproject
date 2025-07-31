import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Package, DollarSign, Eye, EyeOff, Search, Upload, Image, CheckSquare, Square, AlertTriangle, ExternalLink, X, ImageIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';
import { useProductVariants, useCreateProductVariant } from '@/hooks/useProductVariants';
import { ProductVariantForm } from '@/components/admin/ProductVariantForm';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  inventory_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  sku: string;
  features: string;
  ingredients: string;
  usage_instructions: string;
  created_at: string;
}

interface ProductImage {
  id?: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  file?: File; // For file uploads
  isUploading?: boolean; // Track upload status
}

export default function AdminProducts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    features: '',
    ingredients: '',
    usage_instructions: '',
    inventory_quantity: '',
    sku: '',
    is_active: true,
    is_featured: false
  });

  const [productVariants, setProductVariants] = useState<Array<{
    id?: string;
    name: string;
    price: string;
    image_url: string;
    file?: File;
    isUploading?: boolean;
  }>>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch categories
  const { data: categories } = useCategories();

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Create/Update product mutation
  const productMutation = useMutation({
    mutationFn: async (productData: any) => {
      let product;
      
      if (editingProduct) {
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select()
          .single();
        if (error) throw error;
        product = data;
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
        product = data;
      }

      // Handle category relationships
      if (editingProduct) {
        // For updates, first delete existing relationships
        const { error: deleteError } = await supabase
          .from('product_categories')
          .delete()
          .eq('product_id', editingProduct.id);
        if (deleteError) throw deleteError;
      }

      // Insert new category relationships
      if (selectedCategories.length > 0) {
        const categoryRelations = selectedCategories.map(categoryId => ({
          product_id: product.id,
          category_id: categoryId
        }));

        const { error: insertError } = await supabase
          .from('product_categories')
          .insert(categoryRelations);
        if (insertError) throw insertError;
      }

      // Handle product images
      if (editingProduct) {
        // For updates, first delete existing images
        const { error: deleteImagesError } = await supabase
          .from('product_images')
          .delete()
          .eq('product_id', editingProduct.id);
        if (deleteImagesError) throw deleteImagesError;

        // For updates, also delete existing variants
        const { error: deleteVariantsError } = await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', editingProduct.id);
        if (deleteVariantsError) throw deleteVariantsError;
      }

      // Insert new images
      if (productImages.length > 0) {
        const imageData = productImages.map((img, index) => ({
          product_id: product.id,
          image_url: img.image_url,
          alt_text: img.alt_text || '',
          sort_order: img.sort_order || index
        }));

        const { error: insertImagesError } = await supabase
          .from('product_images')
          .insert(imageData);
        if (insertImagesError) throw insertImagesError;
      }

      // Handle product variants
      if (productVariants.length > 0) {
        const variantData = productVariants.map((variant, index) => ({
          product_id: product.id,
          name: variant.name,
          price: parseFloat(variant.price),
          inventory_quantity: 0,
          variant_options: {},
          is_active: true,
          sort_order: index
        }));

        const { data: insertedVariants, error: insertVariantsError } = await supabase
          .from('product_variants')
          .insert(variantData)
          .select();
        
        if (insertVariantsError) throw insertVariantsError;

        // Handle variant images
        const variantImagePromises = productVariants.map(async (variant, index) => {
          if (variant.image_url && insertedVariants[index]) {
            const { error: variantImageError } = await supabase
              .from('product_variant_images')
              .insert({
                variant_id: insertedVariants[index].id,
                image_url: variant.image_url,
                alt_text: variant.name,
                sort_order: 0
              });
            
            if (variantImageError) throw variantImageError;
          }
        });

        await Promise.all(variantImagePromises);
      }

      return product;
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

  // Bulk actions mutations
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ productIds, updates }: { productIds: string[], updates: any }) => {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .in('id', productIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setSelectedProducts([]);
      setShowBulkActions(false);
      toast({
        title: "Success",
        description: "Products updated successfully.",
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

  const bulkDeleteMutation = useMutation({
    mutationFn: async (productIds: string[]) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', productIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setSelectedProducts([]);
      setShowBulkActions(false);
      toast({
        title: "Success",
        description: "Products deleted successfully.",
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
      features: '',
      ingredients: '',
      usage_instructions: '',
      inventory_quantity: '',
      sku: '',
      is_active: true,
      is_featured: false
    });
    setSelectedCategories([]);
    setProductImages([]);
    setProductVariants([]);
  };

  // Image management functions
  const addImage = () => {
    setProductImages([...productImages, {
      image_url: '',
      alt_text: '',
      sort_order: productImages.length,
      isUploading: false
    }]);
  };

  const removeImage = (index: number) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  const updateImage = (index: number, field: string, value: string) => {
    const updatedImages = [...productImages];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    setProductImages(updatedImages);
  };

  // File upload function
  const uploadFile = async (file: File, index: number) => {
    try {
      // Mark as uploading
      const updatedImages = [...productImages];
      updatedImages[index] = { ...updatedImages[index], isUploading: true };
      setProductImages(updatedImages);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Update image with URL
      const finalUpdatedImages = [...productImages];
      finalUpdatedImages[index] = {
        ...finalUpdatedImages[index],
        image_url: urlData.publicUrl,
        isUploading: false,
        file: undefined
      };
      setProductImages(finalUpdatedImages);

      toast({
        title: "Success",
        description: "Image uploaded successfully.",
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Remove uploading state
      const updatedImages = [...productImages];
      updatedImages[index] = { ...updatedImages[index], isUploading: false };
      setProductImages(updatedImages);

      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      uploadFile(file, index);
    }
  };

  // Variant management functions
  const addVariant = () => {
    setProductVariants([...productVariants, {
      name: '',
      price: '',
      image_url: '',
      isUploading: false
    }]);
  };

  const removeVariant = (index: number) => {
    setProductVariants(productVariants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const updatedVariants = [...productVariants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setProductVariants(updatedVariants);
  };

  // Variant file upload function
  const uploadVariantFile = async (file: File, index: number) => {
    try {
      // Mark as uploading
      const updatedVariants = [...productVariants];
      updatedVariants[index] = { ...updatedVariants[index], isUploading: true };
      setProductVariants(updatedVariants);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `variant-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Update variant with URL
      const finalUpdatedVariants = [...productVariants];
      finalUpdatedVariants[index] = {
        ...finalUpdatedVariants[index],
        image_url: urlData.publicUrl,
        isUploading: false,
        file: undefined
      };
      setProductVariants(finalUpdatedVariants);

      toast({
        title: "Success",
        description: "Variant image uploaded successfully.",
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Remove uploading state
      const updatedVariants = [...productVariants];
      updatedVariants[index] = { ...updatedVariants[index], isUploading: false };
      setProductVariants(updatedVariants);

      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload variant image.",
        variant: "destructive",
      });
    }
  };

  const handleVariantFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      uploadVariantFile(file, index);
    }
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || '',
      features: product.features || '',
      ingredients: product.ingredients || '',
      usage_instructions: product.usage_instructions || '',
      inventory_quantity: product.inventory_quantity.toString(),
      sku: product.sku || '',
      is_active: product.is_active,
      is_featured: product.is_featured
    });
    
    // Load existing categories for this product
    try {
      const { data: productCategories, error } = await supabase
        .from('product_categories')
        .select('category_id')
        .eq('product_id', product.id);
      
      if (error) throw error;
      
      setSelectedCategories(productCategories?.map(pc => pc.category_id) || []);
    } catch (error) {
      console.error('Error loading product categories:', error);
      setSelectedCategories([]);
    }

    // Load existing images for this product
    try {
      const { data: productImages, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        .order('sort_order');
      
      if (error) throw error;
      
      setProductImages(productImages?.map(img => ({
        id: img.id,
        image_url: img.image_url,
        alt_text: img.alt_text || '',
        sort_order: img.sort_order || 0
      })) || []);
    } catch (error) {
      console.error('Error loading product images:', error);
      setProductImages([]);
    }

    // Load existing variants for this product
    try {
      const { data: productVariants, error } = await supabase
        .from('product_variants')
        .select(`
          *,
          product_variant_images (
            image_url,
            alt_text
          )
        `)
        .eq('product_id', product.id)
        .order('sort_order');
      
      if (error) throw error;
      
      setProductVariants(productVariants?.map(variant => ({
        id: variant.id,
        name: variant.name,
        price: variant.price.toString(),
        image_url: variant.product_variant_images?.[0]?.image_url || '',
        isUploading: false
      })) || []);
    } catch (error) {
      console.error('Error loading product variants:', error);
      setProductVariants([]);
    }
    
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      features: formData.features,
      ingredients: formData.ingredients,
      usage_instructions: formData.usage_instructions,
      inventory_quantity: parseInt(formData.inventory_quantity),
      sku: formData.sku,
      is_active: formData.is_active,
      is_featured: formData.is_featured
    };

    productMutation.mutate(productData);
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts?.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts?.map(p => p.id) || []);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Effect to show/hide bulk actions
  useEffect(() => {
    setShowBulkActions(selectedProducts.length > 0);
  }, [selectedProducts]);

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
          <Button variant="outline" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Store
            </a>
          </Button>
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
                    <Label htmlFor="price">Price (Currency) *</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="features">Features</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    rows={3}
                    placeholder="List key features..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ingredients">Ingredients</Label>
                  <Textarea
                    id="ingredients"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    rows={3}
                    placeholder="List ingredients..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usage_instructions">Usage Instructions</Label>
                  <Textarea
                    id="usage_instructions"
                    value={formData.usage_instructions}
                    onChange={(e) => setFormData({ ...formData, usage_instructions: e.target.value })}
                    rows={3}
                    placeholder="How to use this product..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                    {categories?.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories(prev => [...prev, category.id]);
                            } else {
                              setSelectedCategories(prev => prev.filter(id => id !== category.id));
                            }
                          }}
                        />
                        <Label htmlFor={`category-${category.id}`} className="text-sm font-normal">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedCategories.map(categoryId => {
                        const category = categories?.find(c => c.id === categoryId);
                        return category ? (
                          <Badge key={categoryId} variant="secondary" className="text-xs">
                            {category.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                {/* Product Images Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Product Images</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addImage}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </div>
                  
                  {productImages.map((image, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Image {index + 1}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeImage(index)}
                          disabled={image.isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {/* File Upload Section */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Upload from Device</Label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, index)}
                              disabled={image.isUploading}
                              className="hidden"
                              id={`file-upload-${index}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById(`file-upload-${index}`)?.click()}
                              disabled={image.isUploading}
                              className="w-full"
                            >
                              {image.isUploading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Choose Image File
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* URL Input Section */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Or Enter Image URL</Label>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            value={image.image_url}
                            onChange={(e) => updateImage(index, 'image_url', e.target.value)}
                            disabled={image.isUploading}
                          />
                        </div>

                        {/* Alt Text */}
                        <div className="space-y-2">
                          <Label className="text-sm">Alt Text (optional)</Label>
                          <Input
                            placeholder="Describe the image for accessibility"
                            value={image.alt_text}
                            onChange={(e) => updateImage(index, 'alt_text', e.target.value)}
                            disabled={image.isUploading}
                          />
                        </div>
                      </div>
                      
                      {/* Image Preview */}
                      {image.image_url && !image.isUploading && (
                        <div className="mt-3">
                          <Label className="text-sm font-medium mb-2 block">Preview</Label>
                          <img
                            src={image.image_url}
                            alt={image.alt_text || `Product image ${index + 1}`}
                            className="w-32 h-32 object-cover rounded border shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {productImages.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No images added yet</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addImage}
                        className="mt-2"
                      >
                        Add First Image
                      </Button>
                    </div>
                  )}
                </div>

                {/* Product Variants Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Product Variants</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVariant}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Variant
                    </Button>
                  </div>
                  
                  {productVariants.map((variant, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Variant {index + 1}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeVariant(index)}
                          disabled={variant.isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Variant Name */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Variant Name</Label>
                          <Input
                            placeholder="e.g., 30ml, Large, Red"
                            value={variant.name}
                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                            disabled={variant.isUploading}
                          />
                        </div>

                        {/* Variant Price */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={variant.price}
                            onChange={(e) => updateVariant(index, 'price', e.target.value)}
                            disabled={variant.isUploading}
                          />
                        </div>
                      </div>

                      {/* Variant Image */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Variant Image</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleVariantFileChange(e, index)}
                            disabled={variant.isUploading}
                            className="hidden"
                            id={`variant-file-upload-${index}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`variant-file-upload-${index}`)?.click()}
                            disabled={variant.isUploading}
                            className="w-full"
                          >
                            {variant.isUploading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Choose Variant Image
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {/* URL Input for variant */}
                        <Input
                          placeholder="Or enter image URL"
                          value={variant.image_url}
                          onChange={(e) => updateVariant(index, 'image_url', e.target.value)}
                          disabled={variant.isUploading}
                        />
                      </div>
                      
                      {/* Variant Image Preview */}
                      {variant.image_url && !variant.isUploading && (
                        <div className="mt-3">
                          <Label className="text-sm font-medium mb-2 block">Preview</Label>
                          <img
                            src={variant.image_url}
                            alt={variant.name || `Variant ${index + 1}`}
                            className="w-32 h-32 object-cover rounded border shadow-sm"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {productVariants.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
                      <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-sm">No variants added yet</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addVariant}
                        className="mt-2"
                        size="sm"
                      >
                        Add First Variant
                      </Button>
                    </div>
                  )}
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

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <Card className="border-border/50 bg-accent/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProducts([])}
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkUpdateMutation.mutate({
                    productIds: selectedProducts,
                    updates: { is_active: true }
                  })}
                  disabled={bulkUpdateMutation.isPending}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Enable
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkUpdateMutation.mutate({
                    productIds: selectedProducts,
                    updates: { is_active: false }
                  })}
                  disabled={bulkUpdateMutation.isPending}
                >
                  <EyeOff className="h-4 w-4 mr-1" />
                  Disable
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkUpdateMutation.mutate({
                    productIds: selectedProducts,
                    updates: { is_featured: true }
                  })}
                  disabled={bulkUpdateMutation.isPending}
                >
                  ⭐ Feature
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${selectedProducts.length} product${selectedProducts.length !== 1 ? 's' : ''}?`)) {
                      bulkDeleteMutation.mutate(selectedProducts);
                    }
                  }}
                  disabled={bulkDeleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                    <TableHead className="w-12">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center justify-center w-full h-full"
                      >
                        {selectedProducts.length === filteredProducts?.length && filteredProducts?.length > 0 ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </TableHead>
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
                        <button
                          onClick={() => handleSelectProduct(product.id)}
                          className="flex items-center justify-center w-full h-full"
                        >
                          {selectedProducts.includes(product.id) ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-start space-x-3">
                          {/* Product Image */}
                          {(product as any).product_images && (product as any).product_images.length > 0 && (
                            <img
                              src={(product as any).product_images[0].image_url}
                              alt={(product as any).product_images[0].alt_text || product.name}
                              className="w-12 h-12 object-cover rounded border"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          
                          {/* Product Details */}
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="font-semibold text-foreground">{product.name}</p>
                              {product.inventory_quantity <= 5 && product.inventory_quantity > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Low Stock
                                </Badge>
                              )}
                              {product.inventory_quantity === 0 && (
                                <Badge variant="outline" className="text-xs border-red-200 text-red-600">
                                  Out of Stock
                                </Badge>
                              )}
                            </div>
                            {product.sku && (
                              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                            )}
                            {product.description && (
                              <p className="text-sm text-muted-foreground max-w-md truncate">{product.description}</p>
                            )}
                            {/* Show image count if multiple images */}
                            {(product as any).product_images && (product as any).product_images.length > 1 && (
                              <p className="text-xs text-muted-foreground">
                                +{(product as any).product_images.length - 1} more images
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center font-semibold">
                          <span className="text-xs text-muted-foreground mr-1">Price</span>
                          <span className="text-lg">Rs {product.price.toFixed(2)}</span>
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
                            variant="ghost"
                            size="sm"
                            asChild
                            className="hover:bg-primary/10 hover:text-primary"
                          >
                            <a href={`/product/${product.id}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
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
                             onClick={() => {
                               setSelectedProductForVariants(product.id);
                               setIsVariantDialogOpen(true);
                             }}
                             className="hover:bg-secondary hover:text-secondary-foreground transition-colors"
                           >
                             Variants
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

      {/* Variant Management Dialog */}
      <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Product Variants</DialogTitle>
          </DialogHeader>
          {selectedProductForVariants && (
            <ProductVariantForm
              productId={selectedProductForVariants}
              onSave={() => {
                setIsVariantDialogOpen(false);
                setSelectedProductForVariants(null);
              }}
              onCancel={() => {
                setIsVariantDialogOpen(false);
                setSelectedProductForVariants(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}