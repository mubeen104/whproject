import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Shield, User, Search } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
  user_roles: {
    role: string;
  }[] | null;
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          email,
          first_name,
          last_name,
          phone,
          created_at,
          user_roles!user_roles_user_id_fkey(role)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Promote user to admin mutation
  const promoteUserMutation = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.rpc('promote_to_admin', { _email: email });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Success",
        description: "User promoted to admin successfully.",
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'moderator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'user': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-3 w-3" />;
      case 'moderator': return <Shield className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  const getUserRoles = (user: UserProfile) => {
    if (!user.user_roles || user.user_roles.length === 0) {
      return [{ role: 'user' }];
    }
    return user.user_roles;
  };

  const getHighestRole = (user: UserProfile) => {
    const roles = getUserRoles(user);
    const roleOrder = ['admin', 'moderator', 'user'];
    
    for (const role of roleOrder) {
      if (roles.some(r => r.role === role)) {
        return role;
      }
    }
    return 'user';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground mt-2">
              Manage user accounts and roles
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user: any) => {
                    const highestRole = getHighestRole(user);
                    const roles = getUserRoles(user);
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {user.user_id.slice(0, 8)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{user.email}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{user.phone || 'Not provided'}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {roles.map((roleObj, index) => (
                              <Badge key={index} className={getRoleColor(roleObj.role)}>
                                {getRoleIcon(roleObj.role)}
                                <span className="ml-1 capitalize">{roleObj.role}</span>
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedUser(user)}
                                >
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>User Details</DialogTitle>
                                </DialogHeader>
                                {selectedUser && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h3 className="font-semibold">Name</h3>
                                        <p>{selectedUser.first_name} {selectedUser.last_name}</p>
                                      </div>
                                      <div>
                                        <h3 className="font-semibold">Email</h3>
                                        <p>{selectedUser.email}</p>
                                      </div>
                                      <div>
                                        <h3 className="font-semibold">Phone</h3>
                                        <p>{selectedUser.phone || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <h3 className="font-semibold">User ID</h3>
                                        <p className="text-sm font-mono">{selectedUser.user_id}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h3 className="font-semibold mb-2">Roles</h3>
                                      <div className="flex flex-wrap gap-2">
                                        {getUserRoles(selectedUser).map((roleObj, index) => (
                                          <Badge key={index} className={getRoleColor(roleObj.role)}>
                                            {getRoleIcon(roleObj.role)}
                                            <span className="ml-1 capitalize">{roleObj.role}</span>
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>

                                    <div>
                                      <h3 className="font-semibold">Joined</h3>
                                      <p>{new Date(selectedUser.created_at).toLocaleString()}</p>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            {highestRole !== 'admin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => promoteUserMutation.mutate(user.email)}
                                disabled={promoteUserMutation.isPending}
                              >
                                <Shield className="h-4 w-4 mr-1" />
                                Promote
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            
            {users?.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}