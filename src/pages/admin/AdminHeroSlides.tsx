import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit, Trash2, Image as ImageIcon, Link as LinkIcon, Eye, Settings } from "lucide-react";
import { useHeroSlides, useCreateHeroSlide, useUpdateHeroSlide, useDeleteHeroSlide } from "@/hooks/useHeroSlides";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import ImageUpload from "@/components/ImageUpload";

const slideSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  image_url: z.string().min(1, "Image is required"),
  link_url: z.string().optional(),
  link_text: z.string().optional(),
  is_active: z.boolean(),
  display_order: z.number().min(0),
  auto_scroll_speed: z.number().min(1000).max(30000),
});

type SlideFormData = z.infer<typeof slideSchema>;

const AdminHeroSlides = () => {
  const { data: slides, isLoading } = useHeroSlides();
  const createSlide = useCreateHeroSlide();
  const updateSlide = useUpdateHeroSlide();
  const deleteSlide = useDeleteHeroSlide();
  
  const [editingSlide, setEditingSlide] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<SlideFormData>({
    resolver: zodResolver(slideSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      image_url: "",
      link_url: "",
      link_text: "Shop Now",
      is_active: true,
      display_order: 0,
      auto_scroll_speed: 5000,
    },
  });

  const onSubmit = async (data: SlideFormData) => {
    try {
      if (editingSlide) {
        await updateSlide.mutateAsync({ id: editingSlide, ...data });
      } else {
        await createSlide.mutateAsync({
          title: data.title,
          subtitle: data.subtitle,
          image_url: data.image_url,
          link_url: data.link_url || undefined,
          link_text: data.link_text,
          is_active: data.is_active,
          display_order: data.display_order,
          auto_scroll_speed: data.auto_scroll_speed,
        });
      }
      setIsDialogOpen(false);
      setEditingSlide(null);
      form.reset();
    } catch (error) {
      console.error("Error saving slide:", error);
    }
  };

  const handleEdit = (slide: any) => {
    setEditingSlide(slide.id);
    form.reset({
      title: slide.title,
      subtitle: slide.subtitle || "",
      image_url: slide.image_url,
      link_url: slide.link_url || "",
      link_text: slide.link_text || "Shop Now",
      is_active: slide.is_active,
      display_order: slide.display_order,
      auto_scroll_speed: slide.auto_scroll_speed || 5000,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this slide?")) {
      await deleteSlide.mutateAsync(id);
    }
  };

  const handleNewSlide = () => {
    setEditingSlide(null);
    form.reset({
      title: "",
      subtitle: "",
      image_url: "",
      link_url: "",
      link_text: "Shop Now",
      is_active: true,
      display_order: slides ? slides.length : 0,
      auto_scroll_speed: 5000,
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-32 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hero Slides</h1>
          <p className="text-muted-foreground">Manage homepage slider images and content</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewSlide} className="bg-primary hover:bg-primary-hover">
              <Plus className="mr-2 h-4 w-4" />
              Add Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSlide ? "Edit Slide" : "Create New Slide"}</DialogTitle>
              <DialogDescription>
                {editingSlide ? "Update the slide details below." : "Add a new slide to the homepage carousel."}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter slide title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter slide subtitle or description" 
                          className="resize-none"
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slide Image</FormLabel>
                      <p className="text-sm text-muted-foreground mb-2">
                        Recommended dimensions: <strong>1408x768 pixels</strong> (16:9 aspect ratio) for optimal display across all devices
                      </p>
                      <FormControl>
                        <ImageUpload
                          currentImage={field.value}
                          onImageUploaded={field.onChange}
                          bucketName="hero-slides"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="link_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com or /shop" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="link_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Text</FormLabel>
                      <FormControl>
                        <Input placeholder="Shop Now" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="display_order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="auto_scroll_speed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auto Scroll Speed</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value?.toString() || "5000"}
                            onValueChange={(value) => field.onChange(Number(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select speed" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3000">Fast (3 seconds)</SelectItem>
                              <SelectItem value="5000">Normal (5 seconds)</SelectItem>
                              <SelectItem value="7000">Slow (7 seconds)</SelectItem>
                              <SelectItem value="10000">Very Slow (10 seconds)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Show this slide on the homepage
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createSlide.isPending || updateSlide.isPending}
                    className="bg-primary hover:bg-primary-hover"
                  >
                    {createSlide.isPending || updateSlide.isPending ? "Saving..." : "Save Slide"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {slides?.map((slide) => (
          <Card key={slide.id} className="group hover:shadow-medium transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant={slide.is_active ? "default" : "secondary"}>
                    {slide.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">Order: {slide.display_order}</Badge>
                  <Badge variant="outline" className="text-xs">
                    <Settings className="w-3 h-3 mr-1" />
                    {slide.auto_scroll_speed ? `${slide.auto_scroll_speed / 1000}s` : '5s'}
                  </Badge>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(slide)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(slide.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Preview */}
              <AspectRatio ratio={16/9} className="bg-muted rounded-lg overflow-hidden">
                <img
                  src={slide.image_url}
                  alt={slide.title}
                  className="w-full h-full object-contain bg-gradient-to-br from-muted/20 to-background"
                  onError={(e) => {
                    e.currentTarget.src = "/logo.png";
                  }}
                />
              </AspectRatio>

              {/* Content Preview */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground truncate">{slide.title}</h3>
                {slide.subtitle && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {slide.subtitle}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <ImageIcon className="h-3 w-3" />
                    <span>16:9 Image</span>
                  </div>
                  {slide.link_url && (
                    <div className="flex items-center space-x-1">
                      <LinkIcon className="h-3 w-3" />
                      <span>{slide.link_text || "Shop Now"}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {slides?.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No slides yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first hero slide to get started with the homepage carousel.
            </p>
            <Button onClick={handleNewSlide} className="bg-primary hover:bg-primary-hover">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Slide
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminHeroSlides;