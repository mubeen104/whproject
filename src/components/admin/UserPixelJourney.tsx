import { useState } from 'react';
import { useUserPixelJourney, useSessionSummary } from '@/hooks/useUserPixelJourney';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Clock, TrendingUp, User } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';

export const UserPixelJourney = () => {
  const [sessionId, setSessionId] = useState('');
  const [activeSessionId, setActiveSessionId] = useState('');
  const { data: journey } = useUserPixelJourney(undefined, activeSessionId);
  const { data: summary } = useSessionSummary(activeSessionId);

  const handleSearch = () => {
    setActiveSessionId(sessionId);
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="session-search">Session ID or User ID</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="session-search"
                placeholder="Enter session ID..."
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Session Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Total Events</div>
            </div>
            <div className="text-2xl font-bold">{summary.totalEvents}</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">User</div>
            </div>
            <div className="text-lg font-medium truncate">{summary.userName}</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Products Viewed</div>
            </div>
            <div className="text-2xl font-bold">{summary.uniqueProducts}</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
            <div className="flex gap-2">
              {summary.hasPurchase && <Badge>Purchased</Badge>}
              {summary.hasCheckout && !summary.hasPurchase && <Badge variant="secondary">Abandoned</Badge>}
              {!summary.hasCheckout && <Badge variant="outline">Browsing</Badge>}
            </div>
          </Card>
        </div>
      )}

      {/* Journey Timeline */}
      {journey && journey.steps.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">User Journey Timeline</h3>
            <div className="text-sm text-muted-foreground">
              Total Duration: {formatDuration(journey.totalDuration)}
            </div>
          </div>

          {/* Funnel Summary */}
          {'page_views' in journey.conversionFunnel && (
            <div className="flex gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">{journey.conversionFunnel.page_views}</div>
                <div className="text-xs text-muted-foreground">Page Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{journey.conversionFunnel.product_views}</div>
                <div className="text-xs text-muted-foreground">Product Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{journey.conversionFunnel.add_to_carts}</div>
                <div className="text-xs text-muted-foreground">Add to Cart</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{journey.conversionFunnel.checkouts}</div>
                <div className="text-xs text-muted-foreground">Checkouts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{journey.conversionFunnel.purchases}</div>
                <div className="text-xs text-muted-foreground">Purchases</div>
              </div>
            </div>
          )}

          <Separator className="my-4" />

          {/* Timeline */}
          <div className="space-y-4">
            {journey.steps.map((step, index) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium">{step.stepNumber}</span>
                  </div>
                  {index < journey.steps.length - 1 && (
                    <div className="flex-1 w-px bg-border mt-2" />
                  )}
                </div>

                <div className="flex-1 pb-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge>{step.event_type.replace(/_/g, ' ')}</Badge>
                      <span className="text-sm font-medium">{step.product_name || 'Page View'}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(step.created_at), 'HH:mm:ss')}
                    </div>
                  </div>

                  {step.timeFromPrevious && (
                    <div className="text-xs text-muted-foreground mb-2">
                      +{formatDuration(step.timeFromPrevious)} from previous
                    </div>
                  )}

                  <div className="flex gap-4 text-sm">
                    {step.product_name && (
                      <div className="flex items-center gap-2">
                        {step.product_image && (
                          <img src={step.product_image} alt="" className="h-6 w-6 rounded object-cover" />
                        )}
                        <span className="text-muted-foreground">{step.product_name}</span>
                      </div>
                    )}
                    {step.event_value > 0 && (
                      <span className="font-medium">
                        {formatCurrency(step.event_value, step.currency)}
                      </span>
                    )}
                    <span className="text-muted-foreground">via {step.pixel_platform}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeSessionId && (!journey || journey.steps.length === 0) && (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Journey Data Found</h3>
          <p className="text-muted-foreground">
            No events found for this session or user ID.
          </p>
        </div>
      )}
    </div>
  );
};
