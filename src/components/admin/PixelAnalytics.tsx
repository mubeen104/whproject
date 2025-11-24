import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export const PixelAnalytics = () => {
  const { data: pixels = [] } = useQuery({
    queryKey: ['advertising-pixels'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/pixels');
        if (!response.ok) throw new Error('Failed to fetch pixels');
        return response.json();
      } catch (error) {
        console.error('Error:', error);
        return [];
      }
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: recentEvents = [] } = useQuery({
    queryKey: ['pixel-events', 'recent'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/pixel-events?limit=50');
        if (!response.ok) throw new Error('Failed to fetch events');
        return response.json();
      } catch (error) {
        console.error('Error:', error);
        return [];
      }
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const eventStats = recentEvents.reduce(
    (acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const pixelStats = recentEvents.reduce(
    (acc, event) => {
      const pixelId = event.pixel_id;
      if (!acc[pixelId]) {
        acc[pixelId] = { count: 0, events: new Set() };
      }
      acc[pixelId].count++;
      acc[pixelId].events.add(event.event_type);
      return acc;
    },
    {} as Record<string, { count: number; events: Set<string> }>
  );

  return (
    <div className="space-y-6">
      {/* Pixels Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Active Pixels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pixels.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pixels configured</p>
            ) : (
              pixels.map((pixel: any) => (
                <div
                  key={pixel.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium capitalize">{pixel.platform.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground font-mono">{pixel.pixel_id}</p>
                  </div>
                  <Badge variant={pixel.is_enabled ? 'default' : 'secondary'}>
                    {pixel.is_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Event Statistics (Last 50)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(eventStats).length === 0 ? (
              <p className="text-sm text-muted-foreground">No events recorded</p>
            ) : (
              Object.entries(eventStats)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([eventType, count]) => (
                  <div key={eventType} className="flex items-center justify-between">
                    <span className="font-medium capitalize">{eventType}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events</p>
            ) : (
              recentEvents.slice(0, 20).map((event: any, idx: number) => (
                <div key={idx} className="flex items-start justify-between p-2 border-b last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {event.event_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {event.event_value && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Value: {event.currency} {event.event_value}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
