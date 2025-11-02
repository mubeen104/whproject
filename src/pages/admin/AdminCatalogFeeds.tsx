import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  useCatalogFeeds,
  useFeedHistory,
  PLATFORM_OPTIONS,
  FORMAT_OPTIONS,
  CatalogPlatform,
  FeedFormat,
} from '@/hooks/useCatalogFeeds';
import { useCategories } from '@/hooks/useCategories';
import { Plus, Copy, ExternalLink, Trash2, Edit, TestTube2, Clock, CheckCircle2, XCircle, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { generateSlug, isValidFeedSlug, getRecommendedCacheDuration } from '@/utils/catalogUtils';

export default function AdminCatalogFeeds() {
  const { feeds, isLoading, createFeed, updateFeed, deleteFeed, getFeedUrl, testFeed } = useCatalogFeeds();
  const { data: categories = [] } = useCategories();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingFeed, setEditingFeed] = useState<string | null>(null);
  const [selectedFeedForHistory, setSelectedFeedForHistory] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    platform: 'generic' as CatalogPlatform,
    format: 'xml' as FeedFormat,
    feed_url_slug: '',
    is_active: true,
    category_filter: [] as string[],
    include_variants: true,
    cache_duration: 3600,
  });

  const handleCreateFeed = async () => {
    if (!formData.name || !formData.feed_url_slug) {
      toast.error('Name and URL slug are required');
      return;
    }

    if (!isValidFeedSlug(formData.feed_url_slug)) {
      toast.error('URL slug must be lowercase, alphanumeric with hyphens, 3-50 characters');
      return;
    }

    await createFeed.mutateAsync(formData);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleUpdateFeed = async (id: string) => {
    await updateFeed.mutateAsync({ id, ...formData });
    setEditingFeed(null);
    resetForm();
  };

  const handleDeleteFeed = async (id: string) => {
    if (confirm('Are you sure you want to delete this feed? This action cannot be undone.')) {
      await deleteFeed.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      platform: 'generic',
      format: 'xml',
      feed_url_slug: '',
      is_active: true,
      category_filter: [],
      include_variants: true,
      cache_duration: 3600,
    });
  };

  const copyFeedUrl = (slug: string, format: FeedFormat) => {
    const url = getFeedUrl(slug, format);
    navigator.clipboard.writeText(url);
    toast.success('Feed URL copied to clipboard');
  };

  const handlePlatformChange = (platform: CatalogPlatform) => {
    setFormData({
      ...formData,
      platform,
      cache_duration: getRecommendedCacheDuration(platform),
    });
  };

  const generateSlugFromName = () => {
    if (formData.name) {
      setFormData({
        ...formData,
        feed_url_slug: generateSlug(formData.name),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Catalog Feed Management</h1>
          <p className="text-muted-foreground mt-2">
            Create automated product feeds for advertising platforms
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Feed
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Catalog Feed</DialogTitle>
              <DialogDescription>
                Configure a new automated product feed for an advertising platform
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Feed Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Google Shopping Feed - All Products"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform *</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => handlePlatformChange(value as CatalogPlatform)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORM_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Format *</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value) => setFormData({ ...formData, format: value as FeedFormat })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col items-start">
                            <span>{option.label}</span>
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={formData.feed_url_slug}
                    onChange={(e) =>
                      setFormData({ ...formData, feed_url_slug: e.target.value.toLowerCase() })
                    }
                    placeholder="e.g., google-all-products"
                  />
                  <Button type="button" variant="outline" onClick={generateSlugFromName}>
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Lowercase letters, numbers, and hyphens only. This will be part of your feed URL.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Filter by Categories (optional)</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={formData.category_filter.includes(category.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              category_filter: [...formData.category_filter, category.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              category_filter: formData.category_filter.filter((id) => id !== category.id),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={category.id} className="text-sm cursor-pointer">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.category_filter.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formData.category_filter.length} categories selected
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cache">Cache Duration (seconds)</Label>
                <Input
                  id="cache"
                  type="number"
                  value={formData.cache_duration}
                  onChange={(e) =>
                    setFormData({ ...formData, cache_duration: parseInt(e.target.value) || 3600 })
                  }
                  min="60"
                  max="86400"
                />
                <p className="text-xs text-muted-foreground">
                  How long platforms should cache the feed. Recommended:{' '}
                  {getRecommendedCacheDuration(formData.platform)} seconds
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Product Variants</Label>
                  <p className="text-xs text-muted-foreground">
                    Create separate entries for each product variant
                  </p>
                </div>
                <Switch
                  checked={formData.include_variants}
                  onCheckedChange={(checked) => setFormData({ ...formData, include_variants: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-xs text-muted-foreground">Feed will be publicly accessible</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFeed} disabled={createFeed.isPending}>
                Create Feed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Feeds List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Feeds</CardTitle>
          <CardDescription>
            {feeds.length} feed{feeds.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading feeds...</p>
          ) : feeds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No feeds configured yet</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>Create Your First Feed</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Generated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeds.map((feed) => {
                  const platform = PLATFORM_OPTIONS.find((p) => p.value === feed.platform);
                  const feedUrl = getFeedUrl(feed.feed_url_slug);

                  return (
                    <TableRow key={feed.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{feed.name}</span>
                          <code className="text-xs text-muted-foreground">{feed.feed_url_slug}</code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{platform?.icon}</span>
                          <span className="text-sm">{platform?.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{feed.format.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={feed.is_active ? 'default' : 'secondary'}>
                          {feed.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {feed.last_generated_at ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3" />
                            {new Date(feed.last_generated_at).toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyFeedUrl(feed.feed_url_slug, feed.format)}
                            title="Copy Feed URL"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(feedUrl, '_blank')}
                            title="Open Feed"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => testFeed(feed.feed_url_slug)}
                            title="Test Feed"
                          >
                            <TestTube2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteFeed(feed.id)}
                            title="Delete Feed"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Integration Guide</CardTitle>
          <CardDescription>How to use your feed URLs with advertising platforms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {PLATFORM_OPTIONS.map((platform) => (
            <div key={platform.value} className="flex items-start gap-3 p-3 rounded-lg border">
              <span className="text-2xl">{platform.icon}</span>
              <div className="flex-1">
                <h4 className="font-medium">{platform.label}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {platform.value === 'meta' &&
                    'Upload to Commerce Manager → Catalog → Add Items → Data Source → Schedule Upload'}
                  {platform.value === 'google' && 'Upload to Google Merchant Center → Products → Feeds → Add Feed'}
                  {platform.value === 'tiktok' && 'Upload to TikTok Ads Manager → Assets → Catalogs → Create Catalog'}
                  {platform.value === 'pinterest' && 'Upload to Pinterest Business Hub → Catalogs → Create Feed'}
                  {platform.value === 'snapchat' && 'Upload to Snapchat Ads Manager → Assets → Catalog → Upload Products'}
                  {platform.value === 'microsoft' && 'Upload to Microsoft Advertising → Tools → Catalog → Import Products'}
                  {platform.value === 'twitter' && 'Upload to Twitter Ads Manager → Tools → Catalog → Upload'}
                  {platform.value === 'linkedin' && 'Upload to LinkedIn Campaign Manager → Account Assets → Catalogs'}
                  {platform.value === 'generic' && 'Standard format for custom integrations and manual imports'}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
