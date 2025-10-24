import { useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { POSCustomer } from '@/hooks/usePOS';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CustomerSelectProps {
  customer: POSCustomer | null;
  onSelectCustomer: (customer: POSCustomer | null) => void;
}

export function CustomerSelect({ customer, onSelectCustomer }: CustomerSelectProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [search, setSearch] = useState('');
  const [newCustomer, setNewCustomer] = useState<POSCustomer>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('first_name');
      
      if (error) throw error;
      return data;
    },
  });

  const filteredCustomers = customers.filter(c =>
    `${c.first_name} ${c.last_name} ${c.email} ${c.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleAddCustomer = () => {
    if (newCustomer.first_name && newCustomer.last_name) {
      onSelectCustomer(newCustomer);
      setShowDialog(false);
      setNewCustomer({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
      });
    }
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Customer</h3>
          {customer && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSelectCustomer(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {customer ? (
          <div>
            <p className="font-medium">
              {customer.first_name} {customer.last_name}
            </p>
            {customer.email && (
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            )}
            {customer.phone && (
              <p className="text-sm text-muted-foreground">{customer.phone}</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {search && filteredCustomers.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1 border rounded-md p-2">
                {filteredCustomers.map(c => (
                  <div
                    key={c.id}
                    className="p-2 hover:bg-accent rounded-md cursor-pointer"
                    onClick={() => {
                      onSelectCustomer({
                        id: c.user_id,
                        first_name: c.first_name || '',
                        last_name: c.last_name || '',
                        email: c.email || '',
                        phone: c.phone || '',
                      });
                      setSearch('');
                    }}
                  >
                    <p className="font-medium text-sm">
                      {c.first_name} {c.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowDialog(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Customer
            </Button>
          </div>
        )}
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>First Name *</Label>
              <Input
                value={newCustomer.first_name}
                onChange={(e) => setNewCustomer(prev => ({
                  ...prev,
                  first_name: e.target.value,
                }))}
              />
            </div>
            <div>
              <Label>Last Name *</Label>
              <Input
                value={newCustomer.last_name}
                onChange={(e) => setNewCustomer(prev => ({
                  ...prev,
                  last_name: e.target.value,
                }))}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer(prev => ({
                  ...prev,
                  email: e.target.value,
                }))}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                type="tel"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer(prev => ({
                  ...prev,
                  phone: e.target.value,
                }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomer}>Add Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
