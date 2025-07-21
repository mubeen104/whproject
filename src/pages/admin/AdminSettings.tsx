import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Store, Mail, Shield, Database, Palette, Save, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Natural Elements Herbals',
    storeEmail: 'admin@naturalelementsherbal.com',
    storePhone: '+1 (555) 123-4567',
    storeAddress: '123 Herbal Way, Wellness City, WC 12345',
    storeDescription: 'Premium natural health products and herbal supplements.',
    currency: 'USD',
    taxRate: '8.5',
    shippingRate: '9.99',
    freeShippingThreshold: '75.00'
  });

  const [emailSettings, setEmailSettings] = useState({
    orderConfirmation: true,
    shippingNotification: true,
    marketingEmails: false,
    lowStockAlerts: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    twoFactorAuth: false,
    passwordMinLength: '8',
    sessionTimeout: '30'
  });

  const { toast } = useToast();

  const handleSaveStoreSettings = () => {
    // In a real app, this would save to database
    toast({
      title: "Success",
      description: "Store settings saved successfully.",
    });
  };

  const handleSaveEmailSettings = () => {
    // In a real app, this would save to database
    toast({
      title: "Success",
      description: "Email settings saved successfully.",
    });
  };

  const handleSaveSecuritySettings = () => {
    // In a real app, this would save to database
    toast({
      title: "Success",
      description: "Security settings saved successfully.",
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your store configuration and system preferences
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Store Settings */}
        <Card className="border-border/50">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center text-xl">
              <Store className="h-6 w-6 mr-3 text-primary" />
              Store Configuration
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Basic information and settings for your online store
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="storeName" className="text-sm font-medium">Store Name *</Label>
                <Input
                  id="storeName"
                  value={storeSettings.storeName}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeEmail" className="text-sm font-medium">Store Email *</Label>
                <Input
                  id="storeEmail"
                  type="email"
                  value={storeSettings.storeEmail}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storePhone" className="text-sm font-medium">Store Phone</Label>
                <Input
                  id="storePhone"
                  value={storeSettings.storePhone}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                <Input
                  id="currency"
                  value={storeSettings.currency}
                  onChange={(e) => setStoreSettings({ ...storeSettings, currency: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeAddress" className="text-sm font-medium">Store Address</Label>
              <Input
                id="storeAddress"
                value={storeSettings.storeAddress}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeDescription" className="text-sm font-medium">Store Description</Label>
              <Textarea
                id="storeDescription"
                value={storeSettings.storeDescription}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeDescription: e.target.value })}
                rows={3}
                className="resize-none"
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="taxRate" className="text-sm font-medium">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.1"
                  value={storeSettings.taxRate}
                  onChange={(e) => setStoreSettings({ ...storeSettings, taxRate: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingRate" className="text-sm font-medium">Shipping Rate ($)</Label>
                <Input
                  id="shippingRate"
                  type="number"
                  step="0.01"
                  value={storeSettings.shippingRate}
                  onChange={(e) => setStoreSettings({ ...storeSettings, shippingRate: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="freeShippingThreshold" className="text-sm font-medium">Free Shipping Threshold ($)</Label>
                <Input
                  id="freeShippingThreshold"
                  type="number"
                  step="0.01"
                  value={storeSettings.freeShippingThreshold}
                  onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThreshold: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveStoreSettings} className="hover-scale">
                <Save className="h-4 w-4 mr-2" />
                Save Store Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="border-border/50">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center text-xl">
              <Mail className="h-6 w-6 mr-3 text-primary" />
              Email Notifications
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Configure automated email notifications for your store
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="orderConfirmation" className="text-sm font-medium">Order Confirmation Emails</Label>
                  <p className="text-sm text-muted-foreground">Automatically send confirmation when orders are placed</p>
                </div>
                <Switch
                  id="orderConfirmation"
                  checked={emailSettings.orderConfirmation}
                  onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, orderConfirmation: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="shippingNotification" className="text-sm font-medium">Shipping Notifications</Label>
                  <p className="text-sm text-muted-foreground">Notify customers when their orders are shipped</p>
                </div>
                <Switch
                  id="shippingNotification"
                  checked={emailSettings.shippingNotification}
                  onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, shippingNotification: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="marketingEmails" className="text-sm font-medium">Marketing Communications</Label>
                  <p className="text-sm text-muted-foreground">Send promotional offers and marketing content</p>
                </div>
                <Switch
                  id="marketingEmails"
                  checked={emailSettings.marketingEmails}
                  onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, marketingEmails: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="lowStockAlerts" className="text-sm font-medium">Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when product inventory is running low</p>
                </div>
                <Switch
                  id="lowStockAlerts"
                  checked={emailSettings.lowStockAlerts}
                  onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, lowStockAlerts: checked })}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveEmailSettings} className="hover-scale">
                <Save className="h-4 w-4 mr-2" />
                Save Email Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-border/50">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center text-xl">
              <Shield className="h-6 w-6 mr-3 text-primary" />
              Security & Authentication
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Configure security policies and authentication requirements
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="requireEmailVerification" className="text-sm font-medium">Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Users must verify their email before account activation</p>
                </div>
                <Switch
                  id="requireEmailVerification"
                  checked={securitySettings.requireEmailVerification}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, requireEmailVerification: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="twoFactorAuth" className="text-sm font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Enable 2FA for enhanced admin account security</p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="passwordMinLength" className="text-sm font-medium">Minimum Password Length</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  min="6"
                  max="20"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout" className="text-sm font-medium">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="15"
                  max="1440"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveSecuritySettings} className="hover-scale">
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Management */}
        <Card className="border-border/50">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center text-xl">
              <Database className="h-6 w-6 mr-3 text-primary" />
              System Management
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Advanced system operations and data management tools
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-12 hover-scale">
                <Database className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" className="h-12 hover-scale">
                <Database className="h-4 w-4 mr-2" />
                Import Data
              </Button>
              <Button variant="destructive" className="h-12 hover-scale">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    System management operations can affect your store's functionality. Always create a backup before making significant changes.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}