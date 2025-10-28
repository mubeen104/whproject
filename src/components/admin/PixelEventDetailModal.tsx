import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DetailedPixelEvent } from '@/hooks/usePixelEventDetails';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import { Package, User, TrendingUp, Code, ShoppingCart } from 'lucide-react';

interface PixelEventDetailModalProps {
  event: DetailedPixelEvent;
  onClose: () => void;
}

export const PixelEventDetailModal = ({ event, onClose }: PixelEventDetailModalProps) => {
  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Event Details
            <Badge>{event.event_type.replace(/_/g, ' ')}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Summary */}
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Timestamp</div>
                <div className="font-medium">
                  {format(new Date(event.created_at), 'PPpp')}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Platform</div>
                <div className="font-medium">{event.pixel_platform}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Tracking ID</div>
                <code className="text-sm bg-muted px-2 py-1 rounded">{event.tracking_id}</code>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Event Value</div>
                <div className="font-medium text-lg">
                  {event.event_value > 0 ? formatCurrency(event.event_value, event.currency) : '—'}
                </div>
              </div>
            </div>
          </Card>

          {/* Product Details */}
          {event.product_id && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4" />
                <h3 className="font-semibold">Product Information</h3>
              </div>
              <div className="flex gap-4">
                {event.product_image && (
                  <img
                    src={event.product_image}
                    alt={event.product_name || ''}
                    className="h-24 w-24 rounded object-cover"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Product Name</div>
                    <div className="font-medium">{event.product_name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">SKU</div>
                      <code className="text-sm">{event.product_sku || '—'}</code>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Price</div>
                      <div className="font-medium">
                        {event.product_price ? formatCurrency(event.product_price, 'PKR') : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* User Details */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4" />
              <h3 className="font-semibold">User Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="font-medium">{event.user_name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{event.user_email || 'Guest User'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">User ID</div>
                <code className="text-xs">{event.user_id || 'Anonymous'}</code>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Session ID</div>
                <code className="text-xs">{event.session_id || '—'}</code>
              </div>
            </div>
          </Card>

          {/* Order Details */}
          {event.order_id && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="h-4 w-4" />
                <h3 className="font-semibold">Order Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Order Number</div>
                  <div className="font-medium">{event.order_number}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge variant="outline">{event.order_status}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                  <div className="font-medium text-lg">
                    {event.order_total ? formatCurrency(event.order_total, event.currency) : '—'}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Metadata */}
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Code className="h-4 w-4" />
                <h3 className="font-semibold">Event Metadata</h3>
              </div>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
