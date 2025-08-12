import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAddresses, type Address } from '@/hooks/useAddresses';
import AddressForm from '@/components/AddressForm';
import { Plus, Edit, Star } from 'lucide-react';

interface CheckoutAddress {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

interface AddressSelectorProps {
  selectedAddress: CheckoutAddress;
  onAddressChange: (address: CheckoutAddress) => void;
  title: string;
  useCustomAddress: boolean;
  onUseCustomAddressChange: (useCustom: boolean) => void;
}

const AddressSelector = ({
  selectedAddress,
  onAddressChange,
  title,
  useCustomAddress,
  onUseCustomAddressChange,
}: AddressSelectorProps) => {
  const { addresses, isLoading } = useAddresses();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  // Convert saved address to checkout address format
  const convertToCheckoutAddress = (address: Address): CheckoutAddress => ({
    firstName: address.first_name,
    lastName: address.last_name,
    company: address.company || '',
    addressLine1: address.address_line_1,
    addressLine2: address.address_line_2 || '',
    city: address.city,
    state: address.state,
    postalCode: address.postal_code,
    country: address.country,
    phone: address.phone || '',
  });

  // Auto-select default address on load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId && !useCustomAddress) {
      const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];
      setSelectedAddressId(defaultAddress.id);
      onAddressChange(convertToCheckoutAddress(defaultAddress));
    }
  }, [addresses, selectedAddressId, useCustomAddress, onAddressChange]);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    onUseCustomAddressChange(false);
    
    const address = addresses.find(addr => addr.id === addressId);
    if (address) {
      onAddressChange(convertToCheckoutAddress(address));
    }
  };

  const handleUseCustomAddress = () => {
    setSelectedAddressId('');
    onUseCustomAddressChange(true);
  };

  const formatAddress = (address: Address) => {
    const parts = [
      address.address_line_1,
      address.address_line_2,
      address.city,
      address.state,
      address.postal_code,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const handleInputChange = (field: keyof CheckoutAddress, value: string) => {
    onAddressChange({ ...selectedAddress, [field]: value });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isLoading && addresses.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Saved Addresses</h4>
              <RadioGroup 
                value={useCustomAddress ? 'custom' : selectedAddressId} 
                onValueChange={(value) => {
                  if (value === 'custom') {
                    handleUseCustomAddress();
                  } else {
                    handleAddressSelect(value);
                  }
                }}
              >
                {addresses.map((address) => (
                  <div key={address.id} className="flex items-start space-x-3">
                    <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                    <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                      <div className="border border-border rounded-lg p-3 hover:border-primary transition-colors">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={address.type === 'home' ? 'default' : 'secondary'}>
                            {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                          </Badge>
                          {address.is_default && (
                            <Badge variant="outline" className="flex items-center space-x-1">
                              <Star className="h-3 w-3" />
                              <span>Default</span>
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            {address.first_name} {address.last_name}
                            {address.company && (
                              <span className="text-muted-foreground ml-2">
                                ({address.company})
                              </span>
                            )}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatAddress(address)}
                          </p>
                          {address.phone && (
                            <p className="text-muted-foreground text-xs">
                              Phone: {address.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
                
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="custom" id="custom" className="mt-1" />
                  <Label htmlFor="custom" className="cursor-pointer">
                    <div className="border border-dashed border-border rounded-lg p-3 hover:border-primary transition-colors">
                      <p className="font-medium text-sm">Use a different address</p>
                      <p className="text-muted-foreground text-xs">Enter a new address manually</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {(useCustomAddress || addresses.length === 0) && (
            <div className="space-y-4">
              {addresses.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No saved addresses found. Please enter your address below.
                </p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <input
                    id="firstName"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedAddress.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <input
                    id="lastName"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedAddress.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="company">Company (Optional)</Label>
                <input
                  id="company"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedAddress.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                <input
                  id="addressLine1"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedAddress.addressLine1}
                  onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                <input
                  id="addressLine2"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedAddress.addressLine2}
                  onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <input
                    id="city"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedAddress.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province *</Label>
                  <input
                    id="state"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedAddress.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code (Optional)</Label>
                  <input
                    id="postalCode"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedAddress.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <input
                  id="phone"
                  type="tel"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedAddress.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddressForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          // The address list will be refreshed automatically
        }}
      />
    </>
  );
};

export default AddressSelector;