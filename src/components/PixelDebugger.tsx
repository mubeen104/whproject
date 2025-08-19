import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Bug, CheckCircle, XCircle } from 'lucide-react';
import { useEnabledPixels } from '@/hooks/useAdvertisingPixels';

interface PixelStatus {
  platform: string;
  loaded: boolean;
  error?: string;
  events: Array<{
    name: string;
    timestamp: Date;
    data: any;
  }>;
}

export const PixelDebugger = () => {
  const { data: pixels = [] } = useEnabledPixels();
  const [pixelStatuses, setPixelStatuses] = useState<PixelStatus[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkPixelStatus = () => {
      const statuses: PixelStatus[] = pixels.map(pixel => {
        let loaded = false;
        let error = '';

        switch (pixel.platform) {
          case 'google_ads':
            loaded = !!(window as any).gtag;
            break;
          case 'meta_pixel':
            loaded = !!(window as any).fbq;
            break;
          case 'tiktok_pixel':
            loaded = !!(window as any).ttq;
            break;
          case 'linkedin_insight':
            loaded = !!(window as any).lintrk;
            break;
          case 'twitter_pixel':
            loaded = !!(window as any).twq;
            break;
          case 'pinterest_tag':
            loaded = !!(window as any).pintrk;
            break;
          case 'snapchat_pixel':
            loaded = !!(window as any).snaptr;
            break;
          case 'microsoft_advertising':
            loaded = !!(window as any).uetq;
            break;
          case 'reddit_pixel':
            loaded = !!(window as any).rdt;
            break;
          case 'quora_pixel':
            loaded = !!(window as any).qp;
            break;
          default:
            error = 'Unknown platform';
        }

        return {
          platform: pixel.platform,
          loaded,
          error,
          events: []
        };
      });

      setPixelStatuses(statuses);
    };

    checkPixelStatus();
    const interval = setInterval(checkPixelStatus, 5000);

    return () => clearInterval(interval);
  }, [pixels]);

  const testEvent = (platform: string) => {
    const testData = {
      value: 99.99,
      currency: 'PKR',
      content_ids: ['test-product'],
      content_name: 'Test Product'
    };

    // Track a test event
    if (typeof window !== 'undefined') {
      console.log(`Testing ${platform} pixel with data:`, testData);
      
      switch (platform) {
        case 'google_ads':
          if ((window as any).gtag) {
            (window as any).gtag('event', 'test_event', testData);
          }
          break;
        case 'meta_pixel':
          if ((window as any).fbq) {
            (window as any).fbq('track', 'ViewContent', testData);
          }
          break;
        case 'tiktok_pixel':
          if ((window as any).ttq) {
            (window as any).ttq.track('ViewContent', testData);
          }
          break;
        // Add other platforms as needed
      }
    }
  };

  if (pixels.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="bg-background/95 backdrop-blur">
            <Bug className="h-4 w-4 mr-2" />
            Pixel Debug
            {isOpen ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2">
          <Card className="w-80 bg-background/95 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Pixel Status</CardTitle>
              <CardDescription className="text-xs">
                Debug advertising pixels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {pixelStatuses.map((status) => (
                <div key={status.platform} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {status.loaded ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium capitalize">
                      {status.platform.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={status.loaded ? "default" : "destructive"} className="text-xs">
                      {status.loaded ? 'Loaded' : 'Error'}
                    </Badge>
                    {status.loaded && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => testEvent(status.platform)}
                        className="h-6 px-2 text-xs"
                      >
                        Test
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Check browser console for detailed tracking logs
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};