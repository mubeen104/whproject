import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Users, 
  Eye, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  TrendingUp,
  CalendarIcon,
  MousePointer,
  Clock,
  ExternalLink
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  useAnalyticsSummary,
  useTrafficByDevice,
  useTopPages,
  useReferrerSources,
  useWebsiteAnalytics
} from '@/hooks/useWebsiteAnalytics';

const AdminAnalytics = () => {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedDays, setSelectedDays] = useState(30);

  const { data: analyticsSummary = [], isLoading: summaryLoading } = useAnalyticsSummary(selectedDays);
  const { data: deviceData = [], isLoading: deviceLoading } = useTrafficByDevice(selectedDays);
  const { data: topPages = [], isLoading: pagesLoading } = useTopPages(selectedDays);
  const { data: referrerSources = [], isLoading: referrerLoading } = useReferrerSources(selectedDays);
  const { data: analyticsData = [], isLoading: dataLoading } = useWebsiteAnalytics(dateRange);

  // Calculate summary stats
  const totalVisits = analyticsSummary.reduce((sum, day) => sum + (day.total_visits || 0), 0);
  const totalUniqueVisitors = analyticsSummary.reduce((sum, day) => sum + (day.unique_visitors || 0), 0);
  const avgVisitDuration = analyticsSummary.reduce((sum, day) => sum + (day.avg_duration || 0), 0) / analyticsSummary.length;

  const quickFilters = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
  ];

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getDeviceColor = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return 'bg-blue-500';
      case 'tablet': return 'bg-green-500';
      case 'desktop': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  if (summaryLoading || deviceLoading || pagesLoading || referrerLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Website Analytics</h1>
          <p className="text-muted-foreground">Monitor your website traffic and user behavior</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <Button
              key={filter.days}
              variant={selectedDays === filter.days ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDays(filter.days)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Visits</p>
                <p className="text-2xl font-bold text-foreground">{totalVisits.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Visitors</p>
                <p className="text-2xl font-bold text-foreground">{totalUniqueVisitors.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Visit Duration</p>
                <p className="text-2xl font-bold text-foreground">{formatDuration(avgVisitDuration)}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalVisits > 0 ? Math.round(((totalVisits - totalUniqueVisitors) / totalVisits) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Device Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceData.map((device, index) => (
                <div key={device.device} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(device.device)}
                    <span className="font-medium capitalize">{device.device}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", getDeviceColor(device.device))}></div>
                      <span className="text-sm text-muted-foreground">{device.percentage}%</span>
                    </div>
                    <Badge variant="secondary">{device.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="w-5 h-5" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPages.slice(0, 5).map((page, index) => (
                <div key={page.url} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{page.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{page.url}</p>
                  </div>
                  <Badge variant="outline">{page.visits} visits</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referrer Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrerSources.slice(0, 5).map((source, index) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{source.percentage}%</span>
                    <Badge variant="secondary">{source.visits}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.slice(0, 5).map((activity, index) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{activity.page_title || activity.page_url}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {getDeviceIcon(activity.device_type || 'desktop')}
                      <span>{activity.device_type}</span>
                      <span>•</span>
                      <span>{activity.country || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(activity.created_at), 'MMM dd, HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;