import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingCart, Package, Eye, Truck, CheckCircle, XCircle, Clock, Edit, Calendar, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStoreSettings } from '@/hooks/useStoreSettings';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  user_id: string;
  shipping_address: any;
  billing_address: any;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  order_items?: {
    id: string;
    quantity: number;
    price: number;
    total: number;
    products: {
      name: string;
      sku: string;
    };
  }[];
}

export default function AdminOrders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [editingStatus, setEditingStatus] = useState<string>('');

  const { currency } = useStoreSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, timeFilter],
    queryFn: async () => {
      // Calculate date range based on time filter
      let startDate: string | null = null;
      const now = new Date();
      
      switch (timeFilter) {
        case 'hourly':
          startDate = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
          break;
        case 'daily':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'monthly':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'yearly':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
          break;
        default:
          startDate = null;
      }

      // First get orders
      let query = supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          payment_status,
          created_at,
          user_id,
          shipping_address,
          billing_address
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      const { data: ordersData, error: ordersError } = await query;
      if (ordersError) throw ordersError;

      // Then get profiles for each order (only for authenticated users)
      if (ordersData && ordersData.length > 0) {
        const userIds = [...new Set(ordersData.map(order => order.user_id).filter(Boolean))];
        let profilesData = [];
        
        if (userIds.length > 0) {
          const { data, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, first_name, last_name, email')
            .in('user_id', userIds);

          if (profilesError) throw profilesError;
          profilesData = data || [];
        }

        // Combine orders with profiles
        const ordersWithProfiles = ordersData.map(order => ({
          ...order,
          profiles: order.user_id ? profilesData?.find(profile => profile.user_id === order.user_id) || null : null
        }));

        return ordersWithProfiles;
      }

      return ordersData || [];
    }
  });

  // Fetch order details when viewing
  const { data: orderDetails } = useQuery({
    queryKey: ['order-details', selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder) return null;
      
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          price,
          total,
          products (
            name,
            sku
          )
        `)
        .eq('order_id', selectedOrder.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedOrder
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const updateData: any = { status };
      
      // Add timestamps for status changes
      if (status === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.delivered_at = new Date().toISOString();
      }

      console.log('Updating order with data:', updateData);

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditingStatus(order.status);
    setShowOrderDetails(true);
  };

  const handleUpdateStatus = () => {
    if (selectedOrder && editingStatus !== selectedOrder.status) {
      updateStatusMutation.mutate({
        orderId: selectedOrder.id,
        status: editingStatus
      });
      setSelectedOrder({ ...selectedOrder, status: editingStatus });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage customer orders and shipping status
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="hourly">Last Hour</SelectItem>
              <SelectItem value="daily">Last 24 Hours</SelectItem>
              <SelectItem value="weekly">Last Week</SelectItem>
              <SelectItem value="monthly">Last Month</SelectItem>
              <SelectItem value="yearly">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-border/50 hover:shadow-medium transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{orders?.length || 0}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 hover:shadow-medium transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold">{orders?.filter(o => o.status === 'pending').length || 0}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-medium transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{orders?.filter(o => o.status === 'processing').length || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-medium transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{orders?.filter(o => o.status === 'completed').length || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <ShoppingCart className="h-6 w-6 mr-3 text-primary" />
            Order Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Order Details</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order: any) => (
                    <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">
                            Order ID: {order.id.slice(0, 8)}...
                          </p>
                        </div>
                      </TableCell>
                       <TableCell className="py-4">
                         <div className="space-y-1">
                           <p className="font-medium">
                             {order.profiles?.first_name ? 
                               `${order.profiles.first_name} ${order.profiles.last_name || ''}` : 
                               (order.shipping_address?.firstName ? 
                                 `${order.shipping_address.firstName} ${order.shipping_address.lastName || ''}` : 
                                 'Guest User'
                               )
                             }
                           </p>
                           <p className="text-sm text-muted-foreground">
                             {order.profiles?.email || order.shipping_address?.email || 'No email'}
                           </p>
                           {!order.profiles && order.shipping_address && (
                             <Badge variant="secondary" className="text-xs">Guest</Badge>
                           )}
                         </div>
                       </TableCell>
                      <TableCell className="py-4">
                        <div className="font-semibold text-lg">
                          Rs {Number(order.total_amount).toFixed(2)}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {order.payment_status || 'pending'}
                        </p>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                       <TableCell className="py-4">
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                            className="hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {orders?.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No orders found</h3>
              <p className="text-muted-foreground">Orders will appear here once customers start purchasing.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details - {selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Number</label>
                    <p className="font-medium">{selectedOrder.order_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                    <p className="font-medium text-lg">Rs {Number(selectedOrder.total_amount).toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                    <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                    <Badge variant="outline" className="capitalize">
                      {selectedOrder.payment_status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="font-medium">
                      {selectedOrder.profiles?.first_name} {selectedOrder.profiles?.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="font-medium">{selectedOrder.profiles?.email}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Order Status Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                      <Select value={editingStatus} onValueChange={setEditingStatus}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleUpdateStatus}
                      disabled={editingStatus === selectedOrder.status}
                      className="mt-6"
                    >
                      Update Status
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">
                        {selectedOrder.shipping_address.firstName} {selectedOrder.shipping_address.lastName}
                      </p>
                      <p>{selectedOrder.shipping_address.addressLine1}</p>
                      {selectedOrder.shipping_address.addressLine2 && (
                        <p>{selectedOrder.shipping_address.addressLine2}</p>
                      )}
                      <p>
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postalCode}
                      </p>
                      <p>{selectedOrder.shipping_address.country}</p>
                      {selectedOrder.shipping_address.phone && (
                        <p>Phone: {selectedOrder.shipping_address.phone}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {orderDetails && orderDetails.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderDetails.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.products?.name}</TableCell>
                              <TableCell>{item.products?.sku}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                                <TableCell>Rs {Number(item.price).toFixed(2)}</TableCell>
                                <TableCell>Rs {Number(item.total).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No order items found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}