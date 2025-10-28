import { useState } from 'react';
import { usePixelEventDetails, DetailedPixelEvent } from '@/hooks/usePixelEventDetails';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Eye, Package } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import { PixelEventDetailModal } from './PixelEventDetailModal';
import { EventFilters } from '@/hooks/usePixelEventDetails';

interface PixelEventDetailsTableProps {
  filters: EventFilters;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  'page_view': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  'view_content': 'bg-green-500/10 text-green-700 border-green-500/20',
  'add_to_cart': 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  'initiate_checkout': 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  'purchase': 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  'search': 'bg-gray-500/10 text-gray-700 border-gray-500/20'
};

export const PixelEventDetailsTable = ({ filters }: PixelEventDetailsTableProps) => {
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<DetailedPixelEvent | null>(null);
  const { data, isLoading } = usePixelEventDetails(filters, page, 50);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.events.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/50">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or check back later for new events.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Session</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.events.map((event) => (
              <TableRow key={event.id} className="hover:bg-muted/50">
                <TableCell className="text-sm">
                  {format(new Date(event.created_at), 'MMM dd, HH:mm:ss')}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={EVENT_TYPE_COLORS[event.event_type] || 'bg-gray-500/10'}
                  >
                    {event.event_type.replace(/_/g, ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{event.pixel_platform}</Badge>
                </TableCell>
                <TableCell>
                  {event.product_name ? (
                    <div className="flex items-center gap-2">
                      {event.product_image && (
                        <img 
                          src={event.product_image} 
                          alt={event.product_name}
                          className="h-8 w-8 rounded object-cover"
                        />
                      )}
                      <span className="text-sm truncate max-w-[150px]">
                        {event.product_name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{event.user_name}</div>
                    {event.user_email && (
                      <div className="text-muted-foreground text-xs">{event.user_email}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {event.event_value > 0 ? (
                    <span className="font-medium">
                      {formatCurrency(event.event_value, event.currency)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {event.session_id?.substring(0, 8)}...
                  </code>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {((page - 1) * data.pageSize) + 1} to {Math.min(page * data.pageSize, data.total)} of {data.total} events
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedEvent && (
        <PixelEventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  );
};
