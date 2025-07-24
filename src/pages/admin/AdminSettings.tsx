import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Store, Mail, Shield, Database, Palette, Save, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';

export default function AdminSettings() {
  const { toast } = useToast();
  const { data: storeSettings, isLoading: storeLoading } = useSettings('store');
  const { data: emailSettings, isLoading: emailLoading } = useSettings('email');
  const { data: securitySettings, isLoading: securityLoading } = useSettings('security');
  const updateSettings = useUpdateSettings();

  const [localStoreSettings, setLocalStoreSettings] = useState({
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    storeDescription: '',
    currency: '',
    taxRate: '',
    shippingRate: '',
    freeShippingThreshold: ''
  });

  const [localEmailSettings, setLocalEmailSettings] = useState({
    orderConfirmation: false,
    shippingNotification: false,
    marketingEmails: false,
    lowStockAlerts: false
  });

  const [localSecuritySettings, setLocalSecuritySettings] = useState({
    requireEmailVerification: false,
    twoFactorAuth: false,
    passwordMinLength: '8',
    sessionTimeout: '30'
  });

  // Update local state when settings are loaded
  useEffect(() => {
    if (storeSettings) {
      setLocalStoreSettings({
        storeName: storeSettings.store_name || '',
        storeEmail: storeSettings.store_email || '',
        storePhone: storeSettings.store_phone || '',
        storeAddress: storeSettings.store_address || '',
        storeDescription: storeSettings.store_description || '',
        currency: storeSettings.currency || '',
        taxRate: String(storeSettings.tax_rate || ''),
        shippingRate: String(storeSettings.shipping_rate || ''),
        freeShippingThreshold: String(storeSettings.free_shipping_threshold || '')
      });
    }
  }, [storeSettings]);

  useEffect(() => {
    if (emailSettings) {
      setLocalEmailSettings({
        orderConfirmation: emailSettings.order_confirmation_emails || false,
        shippingNotification: emailSettings.shipping_notification_emails || false,
        marketingEmails: emailSettings.marketing_emails || false,
        lowStockAlerts: emailSettings.low_stock_alerts || false
      });
    }
  }, [emailSettings]);

  useEffect(() => {
    if (securitySettings) {
      setLocalSecuritySettings({
        requireEmailVerification: securitySettings.require_email_verification || false,
        twoFactorAuth: securitySettings.two_factor_auth || false,
        passwordMinLength: String(securitySettings.password_min_length || '8'),
        sessionTimeout: String(securitySettings.session_timeout || '30')
      });
    }
  }, [securitySettings]);

  const handleSaveStoreSettings = () => {
    updateSettings.mutate([
      { key: 'store_name', value: localStoreSettings.storeName, category: 'store' },
      { key: 'store_email', value: localStoreSettings.storeEmail, category: 'store' },
      { key: 'store_phone', value: localStoreSettings.storePhone, category: 'store' },
      { key: 'store_address', value: localStoreSettings.storeAddress, category: 'store' },
      { key: 'store_description', value: localStoreSettings.storeDescription, category: 'store' },
      { key: 'currency', value: localStoreSettings.currency, category: 'store' },
      { key: 'tax_rate', value: parseFloat(localStoreSettings.taxRate) || 0, category: 'store' },
      { key: 'shipping_rate', value: parseFloat(localStoreSettings.shippingRate) || 0, category: 'store' },
      { key: 'free_shipping_threshold', value: parseFloat(localStoreSettings.freeShippingThreshold) || 0, category: 'store' }
    ]);
  };

  const handleSaveEmailSettings = () => {
    updateSettings.mutate([
      { key: 'order_confirmation_emails', value: localEmailSettings.orderConfirmation, category: 'email' },
      { key: 'shipping_notification_emails', value: localEmailSettings.shippingNotification, category: 'email' },
      { key: 'marketing_emails', value: localEmailSettings.marketingEmails, category: 'email' },
      { key: 'low_stock_alerts', value: localEmailSettings.lowStockAlerts, category: 'email' }
    ]);
  };

  const handleSaveSecuritySettings = () => {
    updateSettings.mutate([
      { key: 'require_email_verification', value: localSecuritySettings.requireEmailVerification, category: 'security' },
      { key: 'two_factor_auth', value: localSecuritySettings.twoFactorAuth, category: 'security' },
      { key: 'password_min_length', value: parseInt(localSecuritySettings.passwordMinLength) || 8, category: 'security' },
      { key: 'session_timeout', value: parseInt(localSecuritySettings.sessionTimeout) || 30, category: 'security' }
    ]);
  };

  if (storeLoading || emailLoading || securityLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-2 text-lg">Loading settings...</p>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

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
                  value={localStoreSettings.storeName}
                  onChange={(e) => setLocalStoreSettings({ ...localStoreSettings, storeName: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeEmail" className="text-sm font-medium">Store Email *</Label>
                <Input
                  id="storeEmail"
                  type="email"
                  value={localStoreSettings.storeEmail}
                  onChange={(e) => setLocalStoreSettings({ ...localStoreSettings, storeEmail: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storePhone" className="text-sm font-medium">Store Phone</Label>
                <Input
                  id="storePhone"
                  value={localStoreSettings.storePhone}
                  onChange={(e) => setLocalStoreSettings({ ...localStoreSettings, storePhone: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                <Input
                  id="currency"
                  value={localStoreSettings.currency}
                  onChange={(e) => setLocalStoreSettings({ ...localStoreSettings, currency: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeAddress" className="text-sm font-medium">Store Address</Label>
              <Input
                id="storeAddress"
                value={localStoreSettings.storeAddress}
                onChange={(e) => setLocalStoreSettings({ ...localStoreSettings, storeAddress: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeDescription" className="text-sm font-medium">Store Description</Label>
              <Textarea
                id="storeDescription"
                value={localStoreSettings.storeDescription}
                onChange={(e) => setLocalStoreSettings({ ...localStoreSettings, storeDescription: e.target.value })}
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
                  value={localStoreSettings.taxRate}
                  onChange={(e) => setLocalStoreSettings({ ...localStoreSettings, taxRate: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingRate" className="text-sm font-medium">Shipping Rate ($)</Label>
                <Input
                  id="shippingRate"
                  type="number"
                  step="0.01"
                  value={localStoreSettings.shippingRate}
                  onChange={(e) => setLocalStoreSettings({ ...localStoreSettings, shippingRate: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="freeShippingThreshold" className="text-sm font-medium">Free Shipping Threshold ($)</Label>
                <Input
                  id="freeShippingThreshold"
                  type="number"
                  step="0.01"
                  value={localStoreSettings.freeShippingThreshold}
                  onChange={(e) => setLocalStoreSettings({ ...localStoreSettings, freeShippingThreshold: e.target.value })}
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
                  checked={localEmailSettings.orderConfirmation}
                  onCheckedChange={(checked) => setLocalEmailSettings({ ...localEmailSettings, orderConfirmation: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="shippingNotification" className="text-sm font-medium">Shipping Notifications</Label>
                  <p className="text-sm text-muted-foreground">Notify customers when their orders are shipped</p>
                </div>
                <Switch
                  id="shippingNotification"
                  checked={localEmailSettings.shippingNotification}
                  onCheckedChange={(checked) => setLocalEmailSettings({ ...localEmailSettings, shippingNotification: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="marketingEmails" className="text-sm font-medium">Marketing Communications</Label>
                  <p className="text-sm text-muted-foreground">Send promotional offers and marketing content</p>
                </div>
                <Switch
                  id="marketingEmails"
                  checked={localEmailSettings.marketingEmails}
                  onCheckedChange={(checked) => setLocalEmailSettings({ ...localEmailSettings, marketingEmails: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="lowStockAlerts" className="text-sm font-medium">Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when product inventory is running low</p>
                </div>
                <Switch
                  id="lowStockAlerts"
                  checked={localEmailSettings.lowStockAlerts}
                  onCheckedChange={(checked) => setLocalEmailSettings({ ...localEmailSettings, lowStockAlerts: checked })}
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
                  checked={localSecuritySettings.requireEmailVerification}
                  onCheckedChange={(checked) => setLocalSecuritySettings({ ...localSecuritySettings, requireEmailVerification: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="twoFactorAuth" className="text-sm font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Enable 2FA for enhanced admin account security</p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={localSecuritySettings.twoFactorAuth}
                  onCheckedChange={(checked) => setLocalSecuritySettings({ ...localSecuritySettings, twoFactorAuth: checked })}
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
                  value={localSecuritySettings.passwordMinLength}
                  onChange={(e) => setLocalSecuritySettings({ ...localSecuritySettings, passwordMinLength: e.target.value })}
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
                  value={localSecuritySettings.sessionTimeout}
                  onChange={(e) => setLocalSecuritySettings({ ...localSecuritySettings, sessionTimeout: e.target.value })}
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