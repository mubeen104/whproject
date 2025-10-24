import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Eye, EyeOff, Settings, BarChart3, Loader2 } from 'lucide-react';
import { useAdvertisingPixels, PLATFORM_OPTIONS } from '@/hooks/useAdvertisingPixels';
import { usePixelPerformance } from '@/hooks/usePixelPerformance';
import { PixelForm } from '@/components/admin/PixelForm';
import { PixelPerformanceCard } from '@/components/admin/PixelPerformanceCard';
import { toast } from 'sonner';

const PLATFORM_ICONS = {
  google_ads: '🔍',
  meta_pixel: '📘', 
  tiktok_pixel: '🎵',
  linkedin_insight: '💼',
  twitter_pixel: '🐦',
  pinterest_tag: '📌',
  snapchat_pixel: '👻',
  microsoft_advertising: '🅱️',
  reddit_pixel: '🤖',
  quora_pixel: '❓'
};

const PLATFORM_COLORS = {
  google_ads: 'bg-blue-500',
  meta_pixel: 'bg-blue-600',
  tiktok_pixel: 'bg-black',
  linkedin_insight: 'bg-blue-700',
  twitter_pixel: 'bg-sky-500',
  pinterest_tag: 'bg-red-600',
  snapchat_pixel: 'bg-yellow-400',
  microsoft_advertising: 'bg-green-600',
  reddit_pixel: 'bg-orange-500',
  quora_pixel: 'bg-red-700'
};

export default function AdminPixels() {
  const { pixels, isLoading, updatePixel, deletePixel } = useAdvertisingPixels();
  const { data: performance, isLoading: isLoadingPerformance } = usePixelPerformance();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleToggleEnabled = async (id: string, currentState: boolean) => {
    try {
      await updatePixel.mutateAsync({
        id,
        is_enabled: !currentState
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deletePixel.mutateAsync(id);
    } catch (error) {
      // Error handled in hook
    } finally {
      setDeletingId(null);
    }
  };

  const getPlatformLabel = (platform: string) => {
    return PLATFORM_OPTIONS.find(p => p.value === platform)?.label || platform;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading pixels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advertising Pixels</h1>
          <p className="text-muted-foreground">
            Manage and track performance of your advertising pixels across platforms
          </p>
        </div>
        <PixelForm />
      </div>

      <Tabs defaultValue="management" className="space-y-6">
        <TabsList>
          <TabsTrigger value="management" className="gap-2">
            <Settings className="h-4 w-4" />
            Pixel Management
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {isLoadingPerformance ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !performance || performance.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Performance Data Yet</h3>
                <p className="text-muted-foreground">
                  Pixel tracking data will appear here once events are tracked
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {performance.map((perf) => {
                const platformIcon = PLATFORM_ICONS[perf.platform as keyof typeof PLATFORM_ICONS] || '📊';
                const platformColor = PLATFORM_COLORS[perf.platform as keyof typeof PLATFORM_COLORS] || 'bg-gray-600';
                
                return (
                  <PixelPerformanceCard
                    key={perf.pixel_id}
                    performance={perf}
                    platformIcon={platformIcon}
                    platformColor={platformColor}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="management" className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>Active Pixels</CardTitle>
          <CardDescription>
            Configure tracking pixels for major advertising platforms including Google Ads, Meta, TikTok, LinkedIn, Twitter, Pinterest, Snapchat, Microsoft, Reddit, and Quora
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pixels.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No advertising pixels configured</p>
              <PixelForm trigger={
                <Button>Add Your First Pixel</Button>
              } />
            </div>
          ) : (
            <div className="space-y-4">
              {pixels.map((pixel) => (
                <div 
                  key={pixel.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${PLATFORM_COLORS[pixel.platform]} flex items-center justify-center text-white text-lg`}>
                      {PLATFORM_ICONS[pixel.platform]}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{getPlatformLabel(pixel.platform)}</h3>
                        <Badge variant={pixel.is_enabled ? "default" : "secondary"}>
                          {pixel.is_enabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ID: {pixel.pixel_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      {pixel.is_enabled ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                      <Switch
                        checked={pixel.is_enabled}
                        onCheckedChange={() => handleToggleEnabled(pixel.id, pixel.is_enabled)}
                        disabled={updatePixel.isPending}
                      />
                    </div>
                    
                    <PixelForm pixel={pixel} />
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={deletingId === pixel.id}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Pixel</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the {getPlatformLabel(pixel.platform)} pixel? 
                            This action cannot be undone and will stop all tracking for this platform.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(pixel.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🔍</span>
                <h4 className="font-medium">Google Ads</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Find your conversion ID in Google Ads → Tools & Settings → Conversions
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Format: AW-1234567890
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📘</span>
                <h4 className="font-medium">Meta Pixel</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Find your pixel ID in Meta Business Manager → Events Manager
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Format: 15-16 digit number
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎵</span>
                <h4 className="font-medium">TikTok Pixel</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Find your pixel code in TikTok Ads Manager → Assets → Events
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Format: 20 character code
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💼</span>
                <h4 className="font-medium">LinkedIn Insight</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Find your partner ID in LinkedIn Campaign Manager → Account Assets → Insight Tag
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Format: 6-8 digit number
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🐦</span>
                <h4 className="font-medium">Twitter/X Pixel</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Find your pixel ID in Twitter Ads Manager → Tools → Conversion tracking
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Format: 5-10 character code
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📌</span>
                <h4 className="font-medium">Pinterest Tag</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Find your tag ID in Pinterest Business → Ads → Conversions
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Format: 13 digit number
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">👻</span>
                <h4 className="font-medium">Snapchat Pixel</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Find your pixel ID in Snapchat Ads Manager → Assets → Pixel
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Format: 36 character UUID
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🅱️</span>
                <h4 className="font-medium">Microsoft Advertising</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Find your UET tag ID in Microsoft Advertising → Conversion Tracking → UET tags
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Format: 8-9 digit number
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🤖</span>
                <h4 className="font-medium">Reddit Pixel</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Find your pixel ID in Reddit Ads Manager → Library → Pixels
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Format: t2_xxxxxxxx
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">❓</span>
                <h4 className="font-medium">Quora Pixel</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Find your pixel ID in Quora Ads Manager → Tools → Quora Pixel
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Format: 32 character hex string
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}