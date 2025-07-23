import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield, User, Search, Crown, UserPlus, Eye, MoreHorizontal, MapPin, Package, Settings } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
  date_of_birth?: string;
  user_roles?: { role: string }[];
}

interface Address {
  id: string;
  type: string;
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('customers');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users with roles
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;

      // Then get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;

      // Combine the data
      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        user_roles: userRoles?.filter(role => role.user_id === profile.user_id) || []
      })) || [];

      return usersWithRoles;
    }
  });

  // Fetch user addresses
  const { data: userAddresses } = useQuery({
    queryKey: ['user-addresses', selectedUser?.user_id],
    queryFn: async () => {
      if (!selectedUser) return [];
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', selectedUser.user_id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedUser
  });

  // Fetch user orders
  const { data: userOrders } = useQuery({
    queryKey: ['user-orders', selectedUser?.user_id],
    queryFn: async () => {
      if (!selectedUser) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, status, created_at')
        .eq('user_id', selectedUser.user_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedUser
  });

  // Promote user to admin
  const promoteToAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.rpc('promote_to_admin', { _email: email });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "User promoted to admin successfully!" });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Filter users based on search and tab
  const adminUsers = users.filter(user => {
    const hasAdminRole = user.user_roles?.some(role => role.role === 'admin');
    const matchesSearch = searchTerm === '' || 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    return hasAdminRole && matchesSearch;
  });

  const customerUsers = users.filter(user => {
    const hasAdminRole = user.user_roles?.some(role => role.role === 'admin');
    const matchesSearch = searchTerm === '' ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    return !hasAdminRole && matchesSearch;
  });

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handlePromoteToAdmin = (user: User) => {
    promoteToAdminMutation.mutate(user.email);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage user accounts and access permissions
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/50 hover:shadow-medium transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users?.length || 0}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 hover:shadow-medium transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admin Users</p>
                <p className="text-2xl font-bold">{adminUsers.length}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Crown className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:shadow-medium transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Signups</p>
                <p className="text-2xl font-bold">{users?.filter(u => new Date(u.created_at) > new Date(Date.now() - 7*24*60*60*1000)).length || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Management with Tabs */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Users className="h-6 w-6 mr-3 text-primary" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customers" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customers ({customerUsers.length})
              </TabsTrigger>
              <TabsTrigger value="admins" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Admins ({adminUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customers" className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <UserTable 
                  users={customerUsers} 
                  onViewUser={handleViewUser}
                  onPromoteToAdmin={handlePromoteToAdmin}
                  showPromoteButton={true}
                />
              )}
            </TabsContent>

            <TabsContent value="admins" className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <UserTable 
                  users={adminUsers} 
                  onViewUser={handleViewUser}
                  onPromoteToAdmin={handlePromoteToAdmin}
                  showPromoteButton={false}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Details - {selectedUser?.first_name} {selectedUser?.last_name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="font-medium">{selectedUser.first_name} {selectedUser.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                    <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <Badge variant={selectedUser.user_roles?.some(r => r.role === 'admin') ? 'default' : 'outline'}>
                      {selectedUser.user_roles?.some(r => r.role === 'admin') ? 'Admin' : 'Customer'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Addresses */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userAddresses && userAddresses.length > 0 ? (
                    <div className="space-y-4">
                      {userAddresses.map((address: Address) => (
                        <div key={address.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{address.type}</Badge>
                            {address.is_default && <Badge variant="default">Default</Badge>}
                          </div>
                          <p className="font-medium">{address.first_name} {address.last_name}</p>
                          <p>{address.address_line_1}</p>
                          {address.address_line_2 && <p>{address.address_line_2}</p>}
                          <p>{address.city}, {address.state} {address.postal_code}</p>
                          <p>{address.country}</p>
                          {address.phone && <p>Phone: {address.phone}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No addresses found</p>
                  )}
                </CardContent>
              </Card>

              {/* Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userOrders && userOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order Number</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userOrders.map((order: Order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{order.order_number}</TableCell>
                              <TableCell>${order.total_amount}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{order.status}</Badge>
                              </TableCell>
                              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No orders found</p>
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

interface UserTableProps {
  users: User[];
  onViewUser: (user: User) => void;
  onPromoteToAdmin: (user: User) => void;
  showPromoteButton: boolean;
}

function UserTable({ users, onViewUser, onPromoteToAdmin, showPromoteButton }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No users found</h3>
        <p className="text-muted-foreground">
          {showPromoteButton ? 'No customers found with current search criteria.' : 'No admin users found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">User Details</TableHead>
            <TableHead className="font-semibold">Contact</TableHead>
            <TableHead className="font-semibold">Join Date</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user: User) => (
            <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="py-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ID: {user.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="space-y-1">
                  <p className="font-medium">{user.email}</p>
                  {user.phone && (
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <p className="font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleTimeString()}
                </p>
              </TableCell>
              <TableCell className="py-4">
                <Badge 
                  variant={user.user_roles?.some(r => r.role === 'admin') ? 'default' : 'outline'} 
                  className="font-medium"
                >
                  {user.user_roles?.some(r => r.role === 'admin') ? (
                    <>
                      <Crown className="h-3 w-3 mr-1" />
                      Admin
                    </>
                  ) : (
                    <>
                      <Users className="h-3 w-3 mr-1" />
                      Customer
                    </>
                  )}
                </Badge>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewUser(user)}
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {showPromoteButton && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPromoteToAdmin(user)}
                      className="hover:bg-orange-500 hover:text-white transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}