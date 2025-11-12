import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CreditCard, Truck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useGuestCart } from "@/hooks/useGuestCart";
import { useCheckout } from "@/hooks/useCheckout";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import CouponInput from "@/components/CouponInput";
import AddressSelector from "@/components/AddressSelector";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePixelTracking } from "@/hooks/usePixelTracking";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Address {
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

interface GuestInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cartItems, cartTotal, cartCount, clearCart, isGuest } = useGuestCart();
  const { createOrder, isCreatingOrder } = useCheckout();
  const { taxRate, shippingRate, freeShippingThreshold, currency } = useStoreSettings();
  const { toast } = useToast();
  const { user } = useAuth();
  const { trackPurchase, trackInitiateCheckout } = usePixelTracking();
  
  // Check for direct product checkout
  const isDirectCheckout = searchParams.get('directProduct') === 'true';
  const directProductId = searchParams.get('productId');
  const directQuantity = parseInt(searchParams.get('quantity') || '1');
  const directPrice = parseFloat(searchParams.get('price') || '0');
  const directVariantId = searchParams.get('variantId');
  
  const isGuestCheckout = searchParams.get('guest') === 'true' || isGuest || isDirectCheckout;

  // Fetch direct product details if in direct checkout mode
  const { data: directProduct } = useQuery({
    queryKey: ['direct-product', directProductId],
    queryFn: async () => {
      if (!isDirectCheckout || !directProductId) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (
            id,
            image_url,
            alt_text,
            sort_order
          )
        `)
        .eq('id', directProductId)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isDirectCheckout && !!directProductId,
  });

  // Fetch direct variant details if variant is specified
  const { data: directVariant } = useQuery({
    queryKey: ['direct-variant', directVariantId],
    queryFn: async () => {
      if (!isDirectCheckout || !directVariantId) return null;
      
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('id', directVariantId)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isDirectCheckout && !!directVariantId,
  });

  // Create virtual cart items for direct checkout
  const effectiveCartItems = isDirectCheckout && directProduct ? [{
    id: 'direct-item',
    product_id: directProductId!,
    variant_id: directVariantId || null,
    quantity: directQuantity,
    products: directProduct,
    product: directProduct,
    product_variants: directVariant || undefined,
  }] : cartItems;

  // Use variant price if available in direct checkout
  const effectiveDirectPrice = directVariant?.price || directPrice;
  const effectiveCartTotal = isDirectCheckout ? effectiveDirectPrice * directQuantity : cartTotal;
  const effectiveCartCount = isDirectCheckout ? directQuantity : cartCount;

  // Track InitiateCheckout when user lands on checkout page
  useEffect(() => {
    if (effectiveCartItems.length > 0) {
      const discount = appliedCoupon ? 
        (appliedCoupon.type === 'percentage' ? 
          (effectiveCartTotal * appliedCoupon.value) / 100 : 
          Math.min(appliedCoupon.value, effectiveCartTotal)) 
        : 0;
      const subtotal = effectiveCartTotal - discount;
      const shipping = subtotal >= freeShippingThreshold ? 0 : shippingRate;
      const tax = subtotal * (taxRate / 100);
      const total = subtotal + shipping + tax;

      trackInitiateCheckout({
        value: total,
        currency: currency === 'Rs' ? 'PKR' : 'USD',
        items: effectiveCartItems.map(item => ({
          product_id: item.product_variants?.sku || item.products?.sku || item.product?.sku || item.product_id,
          product_name: item.products?.name || item.product?.name || 'Unknown Product',
          quantity: item.quantity,
          price: isDirectCheckout ? effectiveDirectPrice : (item.product_variants?.price || item.products?.price || item.product?.price || 0),
          currency: currency === 'Rs' ? 'PKR' : 'USD'
        }))
      });
    }
  }, []); // Only run once on mount

  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [shippingAddress, setShippingAddress] = useState<Address>({
    firstName: "",
    lastName: "",
    company: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Pakistan",
    phone: "",
  });

  const [billingAddress, setBillingAddress] = useState<Address>({
    firstName: "",
    lastName: "",
    company: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Pakistan",
    phone: "",
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [notes, setNotes] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [useCustomShipping, setUseCustomShipping] = useState(false);
  const [useCustomBilling, setUseCustomBilling] = useState(false);

  // Calculate discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = (effectiveCartTotal * appliedCoupon.value) / 100;
    } else {
      discountAmount = Math.min(appliedCoupon.value, effectiveCartTotal);
    }
  }

  const discountedSubtotal = effectiveCartTotal - discountAmount;
  const shippingCost = discountedSubtotal >= freeShippingThreshold ? 0 : shippingRate;
  const tax = discountedSubtotal * (taxRate / 100);
  const totalAmount = discountedSubtotal + shippingCost + tax;

  const handleShippingAddressChange = (field: keyof Address, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    if (sameAsShipping) {
      setBillingAddress(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleBillingAddressChange = (field: keyof Address, value: string) => {
    setBillingAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleSameAsShippingChange = (checked: boolean) => {
    setSameAsShipping(checked);
    if (checked) {
      setBillingAddress({ ...shippingAddress });
    }
  };

  const validateAddress = (address: Address): boolean => {
    return !!(
      address.firstName &&
      address.lastName &&
      address.addressLine1 &&
      address.city &&
      address.state &&
      address.phone
    );
  };

  const validateGuestInfo = (): boolean => {
    return !!(
      guestInfo.email &&
      guestInfo.firstName &&
      guestInfo.lastName &&
      guestInfo.phone
    );
  };

  const handleSubmitOrder = async () => {
    // Validate guest info for guest checkout
    if (isGuestCheckout && !validateGuestInfo()) {
      toast({
        title: "Invalid guest information",
        description: "Please fill in all required guest information fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate addresses
    if (!validateAddress(shippingAddress)) {
      toast({
        title: "Invalid shipping address",
        description: "Please fill in all required shipping address fields.",
        variant: "destructive",
      });
      return;
    }

    if (!sameAsShipping && !validateAddress(billingAddress)) {
      toast({
        title: "Invalid billing address",
        description: "Please fill in all required billing address fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate cart
    if (!effectiveCartItems || effectiveCartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Debug logging for pricing verification
      console.log('Order Cart Items Debug:', effectiveCartItems.map(item => ({
        product_name: item.products?.name || item.product?.name,
        variant_id: item.variant_id,
        variant_name: item.product_variants?.name,
        variant_price: item.product_variants?.price,
        base_price: item.products?.price || item.product?.price,
        price_being_used: isDirectCheckout ? effectiveDirectPrice : (item.product_variants?.price || item.products?.price || item.product?.price || 0)
      })));

      const orderData = {
        subtotal: effectiveCartTotal,
        shippingAmount: shippingCost,
        taxAmount: tax,
        totalAmount,
        discountAmount,
        paymentMethod,
        shippingAddress: {
          ...shippingAddress,
          email: isGuestCheckout ? guestInfo.email : '',
        },
        billingAddress: sameAsShipping ? {
          ...shippingAddress,
          email: isGuestCheckout ? guestInfo.email : '',
        } : billingAddress,
        notes,
        couponId: appliedCoupon?.id,
        couponCode: appliedCoupon?.code,
        cartItems: effectiveCartItems.map(item => ({
          productId: item.product_id,
          variantId: item.variant_id,
          quantity: item.quantity,
          price: isDirectCheckout ? effectiveDirectPrice : (item.product_variants?.price || item.products?.price || item.product?.price || 0),
          total: isDirectCheckout ? effectiveDirectPrice * item.quantity : ((item.product_variants?.price || item.products?.price || item.product?.price || 0) * item.quantity),
        })),
      };

      const order = await createOrder.mutateAsync(orderData);
      
      // Track conversion event for advertising pixels with SKU for catalog matching
      trackPurchase({
        order_id: order.order_number,
        value: totalAmount,
        currency: currency === 'Rs' ? 'PKR' : 'USD',
        items: effectiveCartItems.map(item => ({
          product_id: item.product_variants?.sku || item.products?.sku || item.product?.sku || item.product_id, // Priority: variant SKU → parent SKU → UUID
          product_name: item.products?.name || item.product?.name || 'Unknown Product',
          quantity: item.quantity,
          price: isDirectCheckout ? effectiveDirectPrice : (item.product_variants?.price || item.products?.price || item.product?.price || 0),
          currency: currency === 'Rs' ? 'PKR' : 'USD'
        }))
      });
      
      // Clear cart after successful order (only if not direct checkout)
      if (!isDirectCheckout) {
        await clearCart();
      }
      
      toast({
        title: "Order placed successfully!",
        description: `Your order #${order.order_number} has been placed.`,
      });

      // Navigate to order confirmation
      navigate(`/order-confirmation/${order.id}`);
    } catch (error: any) {
      toast({
        title: "Order failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getMainImage = (item: any) => {
    const images = item.products?.product_images || item.product?.product_images;
    if (images && images.length > 0) {
      return images.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.image_url;
    }
    return "/logo.png";
  };

  if (!effectiveCartItems || effectiveCartItems.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">
                Please add items to your cart before proceeding to checkout.
              </p>
              <Button asChild>
                <a href="/shop">Continue Shopping</a>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(isDirectCheckout ? `/product/${directProductId}` : "/cart")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
                <p className="text-muted-foreground">
                  Review your order and complete your purchase
                </p>
              </div>
            </div>
            {isGuestCheckout && (
              <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-1">
                <User className="h-4 w-4" />
                <span>Guest Checkout</span>
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Forms */}
            <div className="space-y-6">
              {/* Guest Information - Only shown for guest checkout */}
              {isGuestCheckout && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Contact Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="guest-email">Email Address *</Label>
                      <Input
                        id="guest-email"
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your@email.com"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        You'll receive order confirmation and updates at this email.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="guest-firstName">First Name *</Label>
                        <Input
                          id="guest-firstName"
                          value={guestInfo.firstName}
                          onChange={(e) => setGuestInfo(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="guest-lastName">Last Name *</Label>
                        <Input
                          id="guest-lastName"
                          value={guestInfo.lastName}
                          onChange={(e) => setGuestInfo(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="guest-phone">Phone Number *</Label>
                      <Input
                        id="guest-phone"
                        type="tel"
                        value={guestInfo.phone}
                        onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Shipping Address */}
              {!isGuestCheckout ? (
                <AddressSelector
                  selectedAddress={shippingAddress}
                  onAddressChange={setShippingAddress}
                  title="Shipping Address"
                  useCustomAddress={useCustomShipping}
                  onUseCustomAddressChange={setUseCustomShipping}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Truck className="h-5 w-5" />
                      <span>Shipping Address</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shipping-firstName">First Name *</Label>
                        <Input
                          id="shipping-firstName"
                          value={shippingAddress.firstName}
                          onChange={(e) => handleShippingAddressChange("firstName", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shipping-lastName">Last Name *</Label>
                        <Input
                          id="shipping-lastName"
                          value={shippingAddress.lastName}
                          onChange={(e) => handleShippingAddressChange("lastName", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="shipping-company">Company (Optional)</Label>
                      <Input
                        id="shipping-company"
                        value={shippingAddress.company}
                        onChange={(e) => handleShippingAddressChange("company", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="shipping-address1">Address Line 1 *</Label>
                      <Input
                        id="shipping-address1"
                        value={shippingAddress.addressLine1}
                        onChange={(e) => handleShippingAddressChange("addressLine1", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="shipping-address2">Address Line 2 (Optional)</Label>
                      <Input
                        id="shipping-address2"
                        value={shippingAddress.addressLine2}
                        onChange={(e) => handleShippingAddressChange("addressLine2", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="shipping-city">City *</Label>
                        <Input
                          id="shipping-city"
                          value={shippingAddress.city}
                          onChange={(e) => handleShippingAddressChange("city", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shipping-state">State/Province *</Label>
                        <Input
                          id="shipping-state"
                          value={shippingAddress.state}
                          onChange={(e) => handleShippingAddressChange("state", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="shipping-postal">Postal Code (Optional)</Label>
                        <Input
                          id="shipping-postal"
                          value={shippingAddress.postalCode}
                          onChange={(e) => handleShippingAddressChange("postalCode", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="shipping-phone">Phone Number *</Label>
                      <Input
                        id="shipping-phone"
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => handleShippingAddressChange("phone", e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="same-as-shipping"
                      checked={sameAsShipping}
                      onChange={(e) => handleSameAsShippingChange(e.target.checked)}
                      className="rounded border-border"
                    />
                    <Label htmlFor="same-as-shipping">Same as shipping address</Label>
                  </div>

                  {!sameAsShipping && (
                    <>
                      {!isGuestCheckout ? (
                        <AddressSelector
                          selectedAddress={billingAddress}
                          onAddressChange={setBillingAddress}
                          title="Select Billing Address"
                          useCustomAddress={useCustomBilling}
                          onUseCustomAddressChange={setUseCustomBilling}
                        />
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="billing-firstName">First Name *</Label>
                              <Input
                                id="billing-firstName"
                                value={billingAddress.firstName}
                                onChange={(e) => handleBillingAddressChange("firstName", e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="billing-lastName">Last Name *</Label>
                              <Input
                                id="billing-lastName"
                                value={billingAddress.lastName}
                                onChange={(e) => handleBillingAddressChange("lastName", e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="billing-company">Company (Optional)</Label>
                            <Input
                              id="billing-company"
                              value={billingAddress.company}
                              onChange={(e) => handleBillingAddressChange("company", e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="billing-address1">Address Line 1 *</Label>
                            <Input
                              id="billing-address1"
                              value={billingAddress.addressLine1}
                              onChange={(e) => handleBillingAddressChange("addressLine1", e.target.value)}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="billing-address2">Address Line 2 (Optional)</Label>
                            <Input
                              id="billing-address2"
                              value={billingAddress.addressLine2}
                              onChange={(e) => handleBillingAddressChange("addressLine2", e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="billing-city">City *</Label>
                              <Input
                                id="billing-city"
                                value={billingAddress.city}
                                onChange={(e) => handleBillingAddressChange("city", e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="billing-state">State/Province *</Label>
                              <Input
                                id="billing-state"
                                value={billingAddress.state}
                                onChange={(e) => handleBillingAddressChange("state", e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="billing-postal">Postal Code (Optional)</Label>
                              <Input
                                id="billing-postal"
                                value={billingAddress.postalCode}
                                onChange={(e) => handleBillingAddressChange("postalCode", e.target.value)}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="billing-phone">Phone Number *</Label>
                            <Input
                              id="billing-phone"
                              type="tel"
                              value={billingAddress.phone}
                              onChange={(e) => handleBillingAddressChange("phone", e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Method</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod">Cash on Delivery (COD)</Label>
                    </div>
                  </RadioGroup>
                  {paymentMethod === "cod" && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Pay when your order is delivered to your doorstep.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Any special instructions for your order..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {effectiveCartItems?.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img
                          src={getMainImage(item)}
                          alt={item.products?.name || "Product"}
                          className="h-16 w-16 object-cover rounded-lg border border-border"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {item.products?.name || item.product?.name || "Unknown Product"}
                            {isDirectCheckout && directVariant && ` - ${directVariant.name}`}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          {currency} {(isDirectCheckout ? directPrice * item.quantity : (item.products?.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Coupon Input */}
                  <div>
                    <h4 className="font-medium mb-2">Discount Code</h4>
                    <CouponInput
                      onCouponApply={setAppliedCoupon}
                      onCouponRemove={() => setAppliedCoupon(null)}
                      appliedCoupon={appliedCoupon}
                      subtotal={effectiveCartTotal}
                    />
                  </div>

                  <Separator />

                  {/* Order Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({effectiveCartCount} {effectiveCartCount === 1 ? 'item' : 'items'})</span>
                      <span>{currency} {effectiveCartTotal.toFixed(2)}</span>
                    </div>
                    
                    {appliedCoupon && (
                      <div className="flex justify-between text-sm text-success">
                        <span>Discount ({appliedCoupon.code})</span>
                        <span>-{currency} {discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>
                        {shippingCost === 0 ? "Free" : `${currency} ${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                    
                    {shippingCost > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Free shipping on orders over {currency} {freeShippingThreshold.toFixed(0)}
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>{currency} {tax.toFixed(2)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{currency} {totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleSubmitOrder}
                    disabled={isCreatingOrder}
                  >
                    {isCreatingOrder ? "Placing Order..." : "Place Order"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;