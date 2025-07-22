import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, TrendingDown, Eye, Clock, ArrowUpRight, Activity, Plus, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState<string>('all');

  const getDateRange = (filter: string) => {
    const now = new Date();
    const ranges: { [key: string]: Date | null } = {
      'hour': new Date(now.getTime() - 60 * 60 * 1000), // Last hour
      'day': new Date(now.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
      'week': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      'month': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      'year': new Date(now.getFullYear(), 0, 1), // This year
      'all': null // All time
    };
    return ranges[filter] || null;
  };

  const getTimeFilterLabel = (filter: string) => {
    const labels: { [key: string]: string } = {
      'hour': 'Last Hour',
      'day': 'Last 24 Hours', 
      'week': 'Last 7 Days',
      'month': 'Last 30 Days',
      'year': 'This Year',
      'all': 'All Time'
    };
    return labels[filter] || 'All Time';
  };
  
  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats', timeFilter],
    queryFn: async () => {
      const startDate = getDateRange(timeFilter);
      const dateFilter = startDate ? `created_at.gte.${startDate.toISOString()}` : null;

      let productsQuery = supabase.from('products').select('*', { count: 'exact', head: true });
      let ordersQuery = supabase.from('orders').select('*', { count: 'exact', head: true });
      let usersQuery = supabase.from('profiles').select('*', { count: 'exact', head: true });
      let revenueQuery = supabase.from('orders').select('total_amount').eq('payment_status', 'completed');
      let recentOrdersQuery = supabase.from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          created_at,
          profiles!orders_user_id_fkey(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Apply date filters when not "all time"
      if (dateFilter) {
        productsQuery = productsQuery.gte('created_at', startDate!.toISOString());
        ordersQuery = ordersQuery.gte('created_at', startDate!.toISOString());
        usersQuery = usersQuery.gte('created_at', startDate!.toISOString());
        revenueQuery = revenueQuery.gte('created_at', startDate!.toISOString());
        recentOrdersQuery = recentOrdersQuery.gte('created_at', startDate!.toISOString());
      }

      const [
        { count: productsCount },
        { count: ordersCount },
        { count: usersCount },
        { data: revenueData },
        { data: recentOrders }
      ] = await Promise.all([
        productsQuery,
        ordersQuery,
        usersQuery,
        revenueQuery,
        recentOrdersQuery
      ]);

      const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      return {
        products: productsCount || 0,
        orders: ordersCount || 0,
        users: usersCount || 0,
        revenue: totalRevenue,
        recentOrders: recentOrders || []
      };
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded-lg w-1/3 mb-3"></div>
          <div className="h-5 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.products || 0,
      icon: Package,
      trend: '+12%',
      trendUp: true,
      description: 'Products in inventory',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Orders',
      value: stats?.orders || 0,
      icon: ShoppingCart,
      trend: '+8%',
      trendUp: true,
      description: 'All time orders',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Users',
      value: stats?.users || 0,
      icon: Users,
      trend: '+5%',
      trendUp: true,
      description: 'Registered users',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.revenue || 0).toFixed(2)}`,
      icon: DollarSign,
      trend: '+15%',
      trendUp: true,
      description: 'Total revenue',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Last Hour</SelectItem>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex space-x-3">
            <Button variant="outline" className="hover:bg-muted" asChild>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4 mr-2" />
                View Store
              </a>
            </Button>
            <Button onClick={() => navigate('/admin/products')} className="bg-primary hover:bg-primary-hover">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-border/50 hover:shadow-medium transition-all duration-200 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className={`flex items-center ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trendUp ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    <span className="font-medium">{stat.trend}</span>
                  </div>
                  <span className="text-muted-foreground">for {getTimeFilterLabel(timeFilter).toLowerCase()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders - Takes 2 columns */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Recent Orders ({getTimeFilterLabel(timeFilter)})
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')}>
                View All
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentOrders?.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No recent orders to display.</p>
                </div>
              ) : (
                stats?.recentOrders?.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.profiles?.first_name} {order.profiles?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold text-lg text-foreground">
                        ${Number(order.total_amount).toFixed(2)}
                      </p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Manage Products', icon: Package, path: '/admin/products' },
                { label: 'View Orders', icon: ShoppingCart, path: '/admin/orders' },
                { label: 'Manage Categories', icon: Package, path: '/admin/categories' },
                { label: 'Manage Users', icon: Users, path: '/admin/users' },
              ].map((action, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  className="w-full justify-start hover:bg-muted border-border/50" 
                  onClick={() => navigate(action.path)}
                >
                  <action.icon className="h-4 w-4 mr-3" />
                  {action.label}
                  <ArrowUpRight className="h-4 w-4 ml-auto" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
