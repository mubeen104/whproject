import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExternalLink, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AdminPixels() {
  const gtmId = import.meta.env.VITE_GTM_ID;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Tracking</h1>
        <p className="text-muted-foreground">
          Manage advertising pixels and analytics through Google Tag Manager
        </p>
      </div>

      {!gtmId && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertTitle>GTM Not Configured</AlertTitle>
          <AlertDescription>
            Set the <code>VITE_GTM_ID</code> environment variable to enable Google Tag Manager.
            See the setup guide below for instructions.
          </AlertDescription>
        </Alert>
      )}

      {gtmId && (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>GTM Active</AlertTitle>
          <AlertDescription>
            Google Tag Manager is configured with ID: <code className="font-mono">{gtmId}</code>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Google Tag Manager Setup</CardTitle>
          <CardDescription>
            This application uses Google Tag Manager for all analytics and advertising pixel tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Why Google Tag Manager?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Manage all advertising pixels from one dashboard - no code changes needed</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Add/remove Meta, Google Ads, TikTok, and other pixels without deploying</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Built-in preview mode for debugging</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Better performance and reliability</span>
                </li>
              </ul>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Quick Setup Guide</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Create GTM Account</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Go to Google Tag Manager and create a new account and container for your website
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://tagmanager.google.com/" target="_blank" rel="noopener noreferrer">
                        Open GTM <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Configure Environment Variable</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Copy your GTM ID (format: GTM-XXXXXXX) and add it to your environment variables
                    </p>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                      <code>VITE_GTM_ID=GTM-XXXXXXX</code>
                    </pre>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Add Advertising Pixels in GTM</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      In GTM dashboard, add tags for your advertising platforms (Meta, Google Ads, TikTok, etc.)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      The application automatically sends standard e-commerce events that GTM will forward to your pixels.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Test with GTM Preview Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      Use GTM's Preview mode to verify all events are firing correctly before publishing
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Events Tracked</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">page_view</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Fired on every page navigation</p>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">view_item</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Product page views</p>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">add_to_cart</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Adding items to cart</p>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">begin_checkout</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Starting checkout process</p>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">purchase</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Completed orders</p>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">search</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Product searches</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Documentation</h3>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" asChild className="justify-start">
                  <a href="/ANALYTICS_SETUP.md" target="_blank">
                    Complete Setup Guide <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild className="justify-start">
                  <a href="https://support.google.com/tagmanager" target="_blank" rel="noopener noreferrer">
                    GTM Documentation <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
