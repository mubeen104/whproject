import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminAnalytics() {
  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const [
        { data: revenueByMonth },
        { data: ordersByStatus },
        { data: topProducts },
        { data: recentActivity }
      ] = await Promise.all([
        // Revenue by month (last 6 months)
        supabase
          .from('orders')
          .select('total_amount, created_at')
          .eq('payment_status', 'completed')
          .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Orders by status
        supabase
          .from('orders')
          .select('status')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Top selling products (last 30 days)
        supabase
          .from('order_items')
          .select(`
            quantity,
            products(name),
            orders!inner(created_at)
          `)
          .gte('orders.created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Recent activity
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
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      // Process revenue by month
      const monthlyRevenue = revenueByMonth?.reduce((acc: any, order: any) => {
        const month = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + Number(order.total_amount);
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
        acc[productName] = (acc[productName] || 0) + item.quantity;
        return acc;
      }, {}) || {};

      const topSellingProducts = Object.entries(productSales)
        .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)
        .slice(0, 5)
        .map(([name, quantity]) => ({ name, quantity }));

      return {
        monthlyRevenue,
        statusCounts,
        topSellingProducts,
        recentActivity: recentActivity || []
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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Insights and performance metrics for your business
          </p>
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
                  ${(Object.values(analytics?.monthlyRevenue || {}) as number[]).reduce((acc: number, val: number) => acc + val, 0).toFixed(2)}
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
                <p className="text-2xl font-bold">
                  {(Object.values(analytics?.statusCounts || {}) as number[]).reduce((acc: number, val: number) => acc + val, 0)}
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
                <p className="text-sm font-medium text-muted-foreground">Top Products</p>
                <p className="text-2xl font-bold">{analytics?.topSellingProducts?.length || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-medium transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
                <p className="text-2xl font-bold">{analytics?.recentActivity?.length || 0}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Revenue */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <DollarSign className="h-6 w-6 mr-3 text-primary" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics?.monthlyRevenue || {}).map(([month, revenue]: [string, any]) => (
                <div key={month} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium">{month}</span>
                  <span className="font-bold text-lg">${Number(revenue).toFixed(2)}</span>
                </div>
              ))}
              {Object.keys(analytics?.monthlyRevenue || {}).length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No revenue data available</p>
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
              Order Status (30 Days)
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
                  <p className="text-muted-foreground">No order data available</p>
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
              Top Products (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.topSellingProducts?.map((product: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium truncate">{product.name}</span>
                  </div>
                  <span className="font-bold text-lg">{product.quantity} sold</span>
                </div>
              ))}
              {(!analytics?.topSellingProducts || analytics.topSellingProducts.length === 0) && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No sales data available</p>
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
                <p className="text-muted-foreground">Recent orders and activities will appear here.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}