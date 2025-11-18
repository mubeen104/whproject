import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, Edit, Trash2, Package, DollarSign, Eye, EyeOff, Search, Upload, 
  Image, CheckSquare, Square, AlertTriangle, ExternalLink, X, ImageIcon,
  ShoppingCart, TrendingUp, Star
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';
import { useStoreSettings } from '@/hooks/useStoreSettings';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  inventory_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  is_kits_deals?: boolean;
  is_best_seller?: boolean;
  is_new_arrival?: boolean;
  sku: string;
  keywords: string[];
  features: string;
  ingredients: string;
  usage_instructions: string;
  created_at: string;
  product_images?: Array<{
    id: string;
    image_url: string;
    alt_text: string;
    sort_order: number;
  }>;
}

interface ProductImage {
  id?: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  file?: File;
  isUploading?: boolean;
}

interface ProductVariant {
  id?: string;
  name: string;
  price: string;
  inventory_quantity: string;
  image_url: string;
  file?: File;
  isUploading?: boolean;
}

export default function AdminProducts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    features: '',
    ingredients: '',
    usage_instructions: '',
    inventory_quantity: '',
    sku: '',
    keywords: '',
    is_active: true,
    is_featured: false,
    is_kits_deals: false,
    is_best_seller: false,
    is_new_arrival: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const { currency } = useStoreSettings();

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

      await handleCategoryRelations(product.id);
      await handleProductImages(product.id);
      await handleProductVariants(product.id);

      return product;
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['product-variants', product.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
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

  // Helper functions for handling relations
  const handleCategoryRelations = async (productId: string) => {
    if (editingProduct) {
      await supabase.from('product_categories').delete().eq('product_id', editingProduct.id);
    }

    if (selectedCategories.length > 0) {
      const categoryRelations = selectedCategories.map(categoryId => ({
        product_id: productId,
        category_id: categoryId
      }));
      const { error } = await supabase.from('product_categories').insert(categoryRelations);
      if (error) throw error;
    }
  };

  const handleProductImages = async (productId: string) => {
    if (editingProduct) {
      await supabase.from('product_images').delete().eq('product_id', editingProduct.id);
    }

    if (productImages.length > 0) {
      const imageData = productImages.map((img, index) => ({
        product_id: productId,
        image_url: img.image_url,
        alt_text: img.alt_text || '',
        sort_order: img.sort_order || index
      }));
      const { error } = await supabase.from('product_images').insert(imageData);
      if (error) throw error;
    }
  };

  const handleProductVariants = async (productId: string) => {
    // Delete existing variants first
    if (editingProduct) {
      await supabase.from('product_variants').delete().eq('product_id', editingProduct.id);
    }

    // Skip variants for Kit & Deals products
    if (formData.is_kits_deals) {
      return;
    }

    if (productVariants.length > 0) {
      // Clean up local duplicates
      const seen = new Set<string>();
      const cleanedVariants = productVariants.filter(v => {
        const name = (v.name || '').trim();
        if (!name || name.length < 2) return false; // Require meaningful names
        
        const price = parseFloat(v.price || '0') || 0;
        if (price <= 0) return false; // Require valid prices
        
        const key = `${name.toLowerCase()}|${price}`;
        
        // Skip local duplicates
        if (seen.has(key)) return false;
        
        seen.add(key);
        return true;
      });

      if (cleanedVariants.length === 0) return;

      const variantData = cleanedVariants.map((variant, index) => ({
        product_id: productId,
        name: variant.name.trim(),
        price: parseFloat(variant.price),
        inventory_quantity: parseInt(variant.inventory_quantity) || 0,
        variant_options: {},
        is_active: true,
        sort_order: index
      }));

      const { data: insertedVariants, error } = await supabase
        .from('product_variants')
        .insert(variantData)
        .select();
      
      if (error) throw error;

      // Handle variant images
      for (let i = 0; i < cleanedVariants.length; i++) {
        const variant = cleanedVariants[i];
        if (variant.image_url && insertedVariants[i]) {
          await supabase.from('product_variant_images').insert({
            variant_id: insertedVariants[i].id,
            image_url: variant.image_url,
            alt_text: variant.name,
            sort_order: 0
          });
        }
      }
    }
  };

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
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
      features: '',
      ingredients: '',
      usage_instructions: '',
      inventory_quantity: '',
      sku: '',
      keywords: '',
      is_active: true,
      is_featured: false,
      is_kits_deals: false,
      is_best_seller: false,
      is_new_arrival: false
    });
    setSelectedCategories([]);
    setProductImages([]);
    if (!formData.is_kits_deals) {
      setProductVariants([]);
    }
  };

  // Image management
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

  const uploadFile = async (file: File, index: number) => {
    try {
      const updatedImages = [...productImages];
      updatedImages[index] = { ...updatedImages[index], isUploading: true };
      setProductImages(updatedImages);

      const fileExt = file.name.split('.').pop();
      const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

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
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

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

  // Variant management
  const addVariant = () => {
    setProductVariants([...productVariants, {
      name: '',
      price: '',
      inventory_quantity: '0',
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

  // Check for duplicate variant names in real-time
  const getDuplicateVariantIndices = () => {
    const nameCount = new Map<string, number[]>();

    productVariants.forEach((variant, index) => {
      const normalizedName = (variant.name || '').toLowerCase().trim();
      if (normalizedName) {
        const indices = nameCount.get(normalizedName) || [];
        indices.push(index);
        nameCount.set(normalizedName, indices);
      }
    });

    // Return indices of all duplicates (names that appear more than once)
    const duplicateIndices = new Set<number>();
    nameCount.forEach((indices) => {
      if (indices.length > 1) {
        indices.forEach(idx => duplicateIndices.add(idx));
      }
    });

    return duplicateIndices;
  };

  const isDuplicateVariant = (index: number) => {
    return getDuplicateVariantIndices().has(index);
  };

  const uploadVariantFile = async (file: File, index: number) => {
    try {
      const updatedVariants = [...productVariants];
      updatedVariants[index] = { ...updatedVariants[index], isUploading: true };
      setProductVariants(updatedVariants);

      const fileExt = file.name.split('.').pop();
      const fileName = `variant-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

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
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

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
      price: product.price?.toString() || '',
      description: product.description || '',
      features: product.features || '',
      ingredients: product.ingredients || '',
      usage_instructions: product.usage_instructions || '',
      inventory_quantity: product.inventory_quantity?.toString() || '0',
      sku: product.sku || '',
      keywords: product.keywords?.join(', ') || '',
      is_active: product.is_active,
      is_featured: product.is_featured,
      is_kits_deals: Boolean(product.is_kits_deals),
      is_best_seller: Boolean(product.is_best_seller),
      is_new_arrival: Boolean(product.is_new_arrival)
    });
    
    // Load existing data
    try {
      const [categoriesRes, imagesRes, variantsRes] = await Promise.all([
        supabase.from('product_categories').select('category_id').eq('product_id', product.id),
        supabase.from('product_images').select('*').eq('product_id', product.id).order('sort_order'),
        supabase.from('product_variants').select(`
          *,
          product_variant_images (image_url, alt_text)
        `).eq('product_id', product.id).order('sort_order')
      ]);

      setSelectedCategories(categoriesRes.data?.map(pc => pc.category_id) || []);
      setProductImages(imagesRes.data?.map(img => ({
        id: img.id,
        image_url: img.image_url,
        alt_text: img.alt_text || '',
        sort_order: img.sort_order || 0
      })) || []);
      // Only load variants if not Kit & Deals
      if (!product.is_kits_deals) {
        setProductVariants(variantsRes.data?.map(variant => ({
          id: variant.id,
          name: variant.name,
          price: variant.price.toString(),
          inventory_quantity: variant.inventory_quantity.toString(),
          image_url: variant.product_variant_images?.[0]?.image_url || '',
          isUploading: false
        })) || []);
      } else {
        setProductVariants([]);
      }
    } catch (error) {
      console.error('Error loading product data:', error);
    }
    
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process keywords - split by comma, trim, filter empty, limit to 30
    const keywordsArray = formData.keywords
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 0)
      .slice(0, 30);
    
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      features: formData.features,
      ingredients: formData.ingredients,
      usage_instructions: formData.usage_instructions,
      inventory_quantity: parseInt(formData.inventory_quantity),
      sku: formData.sku,
      keywords: keywordsArray,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
      is_kits_deals: formData.is_kits_deals,
      is_best_seller: formData.is_best_seller,
      is_new_arrival: formData.is_new_arrival
    };

    productMutation.mutate(productData);
  };

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
              <Button onClick={() => { setEditingProduct(null); resetForm(); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Product Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Title *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder="Enter product name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Base Price *</Label>
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
                      <Label htmlFor="description">Product Description</Label>
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
                        <Label htmlFor="inventory">Base Inventory</Label>
                        <Input
                          id="inventory"
                          type="number"
                          value={formData.inventory_quantity}
                          onChange={(e) => setFormData({ ...formData, inventory_quantity: e.target.value })}
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

                  </CardContent>
                </Card>

                {/* Product Variants - Hidden for Kit & Deals */}
                {!formData.is_kits_deals && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        Product Variants
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addVariant}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Variant
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {productVariants.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground mb-4">No variants added yet</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Create variants for different sizes, colors, or flavors
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addVariant}
                          >
                            Add First Variant
                          </Button>
                        </div>
                    ) : (
                      <div className="space-y-4">
                        {productVariants.map((variant, index) => {
                          const isDuplicate = isDuplicateVariant(index);
                          return (
                          <Card key={index} className={`border-l-4 ${isDuplicate ? 'border-l-red-500 bg-red-50 dark:bg-red-950' : 'border-l-primary'}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium">Variant {index + 1}</h4>
                                  {isDuplicate && (
                                    <Badge variant="destructive" className="text-xs">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Duplicate Name
                                    </Badge>
                                  )}
                                </div>
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
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="space-y-2">
                                  <Label>Variant Name *</Label>
                                  <Input
                                    placeholder="e.g., 30ml, Large, Red"
                                    value={variant.name}
                                    onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                    disabled={variant.isUploading}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Price *</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={variant.price}
                                    onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                    disabled={variant.isUploading}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Stock Quantity</Label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={variant.inventory_quantity}
                                    onChange={(e) => updateVariant(index, 'inventory_quantity', e.target.value)}
                                    disabled={variant.isUploading}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Variant Image</Label>
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
                                    className="flex-1"
                                  >
                                    {variant.isUploading ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                        Uploading...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Choose Image
                                      </>
                                    )}
                                  </Button>
                                </div>
                                
                                {variant.image_url && !variant.isUploading && (
                                  <div className="mt-2">
                                    <img
                                      src={variant.image_url}
                                      alt={variant.name || `Variant ${index + 1}`}
                                      className="w-20 h-20 object-cover rounded border"
                                    />
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                        })}

                        {getDuplicateVariantIndices().size > 0 && (
                          <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                                <div>
                                  <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
                                    Duplicate Variant Names Detected
                                  </h4>
                                  <p className="text-sm text-red-700 dark:text-red-300">
                                    Multiple variants have the same name. Each variant must have a unique name.
                                    Please rename or remove duplicate variants before saving.
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Kit & Deals Notice */}
                {formData.is_kits_deals && (
                  <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                          <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-amber-800 dark:text-amber-200">Kit & Deal Product</h3>
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            Product variants are not available for Kit & Deal items. These products use a single base configuration.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Product Images */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Product Images
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addImage}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Image
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {productImages.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">No images added yet</p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addImage}
                        >
                          Add First Image
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {productImages.map((image, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
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
                              
                              <div className="space-y-3">
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
                                        Choose Image
                                      </>
                                    )}
                                  </Button>
                                </div>

                                <Input
                                  placeholder="Alt text (optional)"
                                  value={image.alt_text}
                                  onChange={(e) => updateImage(index, 'alt_text', e.target.value)}
                                  disabled={image.isUploading}
                                />

                                {image.image_url && !image.isUploading && (
                                  <img
                                    src={image.image_url}
                                    alt={image.alt_text || `Product image ${index + 1}`}
                                    className="w-full h-32 object-cover rounded border"
                                  />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="features">Features</Label>
                      <Textarea
                        id="features"
                        value={formData.features}
                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                        rows={3}
                        placeholder="Key features of the product..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ingredients">Ingredients</Label>
                      <Textarea
                        id="ingredients"
                        value={formData.ingredients}
                        onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                        rows={3}
                        placeholder="Product ingredients..."
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
                      <Label htmlFor="keywords">SEO Keywords</Label>
                      <Textarea
                        id="keywords"
                        value={formData.keywords}
                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                        rows={2}
                        placeholder="Enter SEO keywords separated by commas (max 30 keywords)..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter keywords separated by commas. These help improve search rankings but won't be shown to customers.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="Stock Keeping Unit"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inventory_quantity">Inventory Quantity</Label>
                        <Input
                          id="inventory_quantity"
                          type="number"
                          value={formData.inventory_quantity}
                          onChange={(e) => setFormData({ ...formData, inventory_quantity: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Product Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Product Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, is_active: !!checked })
                        }
                      />
                      <div className="space-y-1">
                        <Label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                          Active Product
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Make this product visible in your store
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="is_featured"
                        checked={formData.is_featured}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, is_featured: !!checked })
                        }
                      />
                      <div className="space-y-1">
                        <Label htmlFor="is_featured" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          Featured Product
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Show this product in the Featured Products section
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="is_best_seller"
                        checked={formData.is_best_seller}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, is_best_seller: !!checked })
                        }
                      />
                      <div className="space-y-1">
                        <Label htmlFor="is_best_seller" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Best Seller
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Show this product in the Best Selling section
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="is_new_arrival"
                        checked={formData.is_new_arrival}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, is_new_arrival: !!checked })
                        }
                      />
                      <div className="space-y-1">
                        <Label htmlFor="is_new_arrival" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                          <Star className="h-4 w-4 text-accent" />
                          New Arrival
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Show this product in the New Arrivals section
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="is_kits_deals"
                        checked={formData.is_kits_deals}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, is_kits_deals: !!checked })
                        }
                      />
                      <div className="space-y-1">
                        <Label htmlFor="is_kits_deals" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-green-500" />
                          Kits & Deals Product
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Add this product to the Kits & Deals section
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories?.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCategories([...selectedCategories, category.id]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                              }
                            }}
                          />
                          <Label 
                            htmlFor={`category-${category.id}`} 
                            className="text-sm cursor-pointer"
                          >
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setIsDialogOpen(false); setEditingProduct(null); }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={productMutation.isPending}>
                    {productMutation.isPending ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{products?.length || 0}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                <p className="text-2xl font-bold">{products?.filter(p => p.is_active).length || 0}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Featured Products</p>
                <p className="text-2xl font-bold">{products?.filter(p => p.is_featured).length || 0}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{products?.filter(p => p.inventory_quantity < 10).length || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10">
                          {product.product_images && product.product_images.length > 0 ? (
                            <img
                              className="h-10 w-10 rounded object-cover"
                              src={product.product_images[0].image_url}
                              alt={product.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{product.name}</div>
                          {product.sku && (
                            <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{currency} {product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={product.inventory_quantity > 10 ? "default" : product.inventory_quantity > 0 ? "secondary" : "destructive"}>
                        {product.inventory_quantity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {product.is_featured && (
                          <Badge variant="outline">Featured</Badge>
                        )}
                        {(product as any).is_kits_deals && (
                          <Badge variant="outline">Kit & Deal</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(product.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}