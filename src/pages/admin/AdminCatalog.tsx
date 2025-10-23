import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCatalogExport, CatalogFormat } from '@/hooks/useCatalogExport';
import { Download, FileJson, FileSpreadsheet, FileCode2, RefreshCw, CheckCircle2, Database } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const PLATFORM_INFO = {
  meta: { name: 'Meta (Facebook/Instagram)', icon: '📱', format: 'CSV or XML' },
  google: { name: 'Google Merchant Center', icon: '🔍', format: 'XML or CSV' },
  tiktok: { name: 'TikTok Ads', icon: '🎵', format: 'JSON or CSV' },
  pinterest: { name: 'Pinterest Catalogs', icon: '📌', format: 'CSV or XML' },
  snapchat: { name: 'Snapchat Ads', icon: '👻', format: 'CSV' },
  microsoft: { name: 'Microsoft Advertising', icon: '🔷', format: 'CSV or XML' },
  twitter: { name: 'Twitter Ads', icon: '🐦', format: 'JSON or CSV' },
  linkedin: { name: 'LinkedIn Ads', icon: '💼', format: 'JSON or CSV' },
  generic: { name: 'Generic Format', icon: '📦', format: 'JSON, CSV, or XML' }
};

export default function AdminCatalog() {
  const [selectedFormat, setSelectedFormat] = useState<CatalogFormat>('generic');
  const { 
    catalogData, 
    isLoading, 
    exportAsJSON, 
    exportAsCSV, 
    exportAsXML,
    totalProducts,
    totalCategories 
  } = useCatalogExport();

  const handleExport = (type: 'json' | 'csv' | 'xml') => {
    try {
      if (type === 'json') {
        exportAsJSON(selectedFormat);
      } else if (type === 'csv') {
        exportAsCSV(selectedFormat);
      } else {
        exportAsXML(selectedFormat);
      }
      toast.success(`Catalog exported successfully as ${type.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export catalog');
      console.error('Export error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Catalog Management</h1>
        <p className="text-muted-foreground mt-2">
          Export your product catalog in various formats for advertising platforms
        </p>
      </div>

      {/* Catalog Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active products in catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Product categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catalog Status</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? 'Loading...' : 'Ready'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Fetching data...' : 'Ready to export'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Catalog</CardTitle>
          <CardDescription>
            Select a platform format and export type to download your product catalog
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Platform Format</label>
            <Select
              value={selectedFormat}
              onValueChange={(value) => setSelectedFormat(value as CatalogFormat)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PLATFORM_INFO).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span>{info.icon}</span>
                      <span>{info.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Recommended format: {PLATFORM_INFO[selectedFormat].format}
            </p>
          </div>

          <Separator />

          <div className="grid gap-3 md:grid-cols-3">
            <Button
              onClick={() => handleExport('json')}
              disabled={isLoading || catalogData.length === 0}
              className="w-full"
            >
              <FileJson className="h-4 w-4 mr-2" />
              Export as JSON
            </Button>

            <Button
              onClick={() => handleExport('csv')}
              disabled={isLoading || catalogData.length === 0}
              className="w-full"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>

            <Button
              onClick={() => handleExport('xml')}
              disabled={isLoading || catalogData.length === 0}
              className="w-full"
            >
              <FileCode2 className="h-4 w-4 mr-2" />
              Export as XML
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Platform Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Integration Guide</CardTitle>
          <CardDescription>
            How to use exported catalogs with different advertising platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(PLATFORM_INFO).map(([key, info]) => (
            <div key={key} className="flex items-start gap-3 p-3 rounded-lg border">
              <span className="text-2xl">{info.icon}</span>
              <div className="flex-1">
                <h4 className="font-medium">{info.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {key === 'meta' && 'Upload to Commerce Manager → Catalog → Add Items → Data Source'}
                  {key === 'google' && 'Upload to Google Merchant Center → Products → Feeds → Add Feed'}
                  {key === 'tiktok' && 'Upload to TikTok Ads Manager → Assets → Catalogs → Create Catalog'}
                  {key === 'pinterest' && 'Upload to Pinterest Business Hub → Catalogs → Create Feed'}
                  {key === 'snapchat' && 'Upload to Snapchat Ads Manager → Assets → Catalog → Upload Products'}
                  {key === 'microsoft' && 'Upload to Microsoft Advertising → Tools → Catalog → Import Products'}
                  {key === 'twitter' && 'Upload to Twitter Ads Manager → Tools → Catalog → Upload'}
                  {key === 'linkedin' && 'Upload to LinkedIn Campaign Manager → Account Assets → Catalogs'}
                  {key === 'generic' && 'Standard format for custom integrations and manual imports'}
                </p>
                <Badge variant="outline" className="mt-2">
                  {info.format}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Catalog Preview */}
      {catalogData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Catalog Preview</CardTitle>
            <CardDescription>
              First 5 products in your catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {catalogData.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{product.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {product.category} • {product.price} {product.currency}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.availability} • SKU: {product.sku || 'N/A'}
                    </p>
                  </div>
                  <Badge variant={product.availability === 'in stock' ? 'default' : 'secondary'}>
                    {product.availability}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
