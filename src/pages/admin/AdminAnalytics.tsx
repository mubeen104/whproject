import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Activity, CalendarIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

export default function AdminAnalytics() {
  // State for date filtering
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  
  const [timeFilter, setTimeFilter] = useState<string>('30d');

  // Handle quick filter changes
  const handleQuickFilter = (period: string) => {
    setTimeFilter(period);
    const now = new Date();
    let from: Date;
    
    switch (period) {
      case '7d':
        from = subDays(now, 7);
        break;
      case '30d':
        from = subDays(now, 30);
        break;
      case '90d':
        from = subDays(now, 90);
        break;
      case '1y':
        from = subDays(now, 365);
        break;
      default:
        from = subDays(now, 30);
    }
    
    setDateRange({ from, to: now });
  };

  // Fetch analytics data with time filtering
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics', dateRange],
    queryFn: async () => {
      const fromDate = startOfDay(dateRange.from).toISOString();
      const toDate = endOfDay(dateRange.to).toISOString();
      
      const [
        { data: revenueData },
        { data: ordersByStatus },
        { data: topProducts },
        { data: recentActivity },
        { data: totalOrders },
        { data: totalCustomers }
      ] = await Promise.all([
        // Revenue data with time filter
        supabase
          .from('orders')
          .select('total_amount, created_at')
          .eq('payment_status', 'completed')
          .gte('created_at', fromDate)
          .lte('created_at', toDate),
        
        // Orders by status with time filter
        supabase
          .from('orders')
          .select('status, created_at')
          .gte('created_at', fromDate)
          .lte('created_at', toDate),
        
        // Top selling products with time filter
        supabase
          .from('order_items')
          .select(`
            quantity,
            products(name, price),
            orders!inner(created_at)
          `)
          .gte('orders.created_at', fromDate)
          .lte('orders.created_at', toDate),
        
        // Recent activity with time filter
        supabase
          .from('orders')
          .select(`
            id,
            order_number,
            total_amount,
            status,
            created_at,
            profiles!orders_user_id_fkey(first_name, last_name)
          `)
          .gte('created_at', fromDate)
          .lte('created_at', toDate)
          .order('created_at', { ascending: false })
          .limit(10),

        // Total orders count
        supabase
          .from('orders')
          .select('id', { count: 'exact' })
          .gte('created_at', fromDate)
          .lte('created_at', toDate),

        // Unique customers count
        supabase
          .from('orders')
          .select('user_id')
          .gte('created_at', fromDate)
          .lte('created_at', toDate)
      ]);

      // Process revenue by time period
      const periodRevenue = revenueData?.reduce((acc: any, order: any) => {
        const date = new Date(order.created_at);
        let key: string;
        
        // Determine grouping based on date range
        const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 7) {
          key = format(date, 'MMM dd');
        } else if (daysDiff <= 90) {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = format(weekStart, 'MMM dd');
        } else {
          key = format(date, 'MMM yyyy');
        }
        
        acc[key] = (acc[key] || 0) + Number(order.total_amount);
        return acc;
      }, {}) || {};

      // Process orders by status
      const statusCounts = ordersByStatus?.reduce((acc: any, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {}) || {};

      // Process top products
      const productSales = topProducts?.reduce((acc: any, item: any) => {
        const productName = item.products?.name || 'Unknown Product';
        const productPrice = item.products?.price || 0;
        if (!acc[productName]) {
          acc[productName] = { quantity: 0, revenue: 0 };
        }
        acc[productName].quantity += item.quantity;
        acc[productName].revenue += item.quantity * Number(productPrice);
        return acc;
      }, {}) || {};

      const topSellingProducts = Object.entries(productSales)
        .sort(([,a]: [string, any], [,b]: [string, any]) => b.quantity - a.quantity)
        .slice(0, 5)
        .map(([name, data]: [string, any]) => ({ 
          name, 
          quantity: data.quantity,
          revenue: data.revenue 
        }));

      // Calculate total revenue
      const totalRevenue = Object.values(periodRevenue).reduce((acc: number, val: any) => acc + val, 0);

      // Calculate unique customers
      const uniqueCustomers = new Set(ordersByStatus?.map((order: any) => order.user_id) || []).size;

      return {
        periodRevenue,
        statusCounts,
        topSellingProducts,
        recentActivity: recentActivity || [],
        totalRevenue,
        totalOrders: totalOrders?.length || 0,
        totalCustomers: uniqueCustomers
      };
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded-lg w-1/3 mb-3"></div>
          <div className="h-5 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-20 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section with Time Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Insights and performance metrics for your business
          </p>
        </div>
        
        {/* Time Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Quick Filters */}
          <div className="flex gap-2">
            {['7d', '30d', '90d', '1y'].map((period) => (
              <Button
                key={period}
                variant={timeFilter === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickFilter(period)}
                className="text-xs"
              >
                {period === '7d' && 'Last 7 days'}
                {period === '30d' && 'Last 30 days'}
                {period === '90d' && 'Last 90 days'}
                {period === '1y' && 'Last year'}
              </Button>
            ))}
          </div>
          
          {/* Custom Date Range */}
          <div className="flex gap-2 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                      setTimeFilter('custom');
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 hover:shadow-medium transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${(analytics?.totalRevenue as number)?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-medium transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{analytics?.totalOrders || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-medium transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customers</p>
                <p className="text-2xl font-bold">{analytics?.totalCustomers || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Unique customers
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-medium transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
                <p className="text-2xl font-bold">
                  ${(analytics?.totalOrders as number) > 0 ? ((analytics.totalRevenue as number) / (analytics.totalOrders as number)).toFixed(2) : '0.00'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Per order
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Period Revenue */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <DollarSign className="h-6 w-6 mr-3 text-primary" />
              Revenue Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {Object.entries(analytics?.periodRevenue || {})
                .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                .map(([period, revenue]: [string, any]) => (
                <div key={period} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">{period}</span>
                  <span className="font-bold text-lg">${Number(revenue).toFixed(2)}</span>
                </div>
              ))}
              {Object.keys(analytics?.periodRevenue || {}).length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No revenue data for selected period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <ShoppingCart className="h-6 w-6 mr-3 text-primary" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics?.statusCounts || {}).map(([status, count]: [string, any]) => (
                <div key={status} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium capitalize">{status}</span>
                  <span className="font-bold text-lg">{count}</span>
                </div>
              ))}
              {Object.keys(analytics?.statusCounts || {}).length === 0 && (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders for selected period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Package className="h-6 w-6 mr-3 text-primary" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.topSellingProducts?.map((product: any, index: number) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium truncate">{product.name}</span>
                    </div>
                    <span className="font-bold text-lg">{product.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                    <span>Revenue:</span>
                    <span className="font-semibold">${product.revenue.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {(!analytics?.topSellingProducts || analytics.topSellingProducts.length === 0) && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No sales data for selected period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <BarChart3 className="h-6 w-6 mr-3 text-primary" />
            Recent Activity
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.recentActivity?.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.profiles?.first_name || 'Customer'} {order.profiles?.last_name || ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-lg">${Number(order.total_amount).toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground capitalize px-2 py-1 bg-muted rounded">
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
            {(!analytics?.recentActivity || analytics.recentActivity.length === 0) && (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No recent activity</h3>
                <p className="text-muted-foreground">No orders found for the selected time period.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}