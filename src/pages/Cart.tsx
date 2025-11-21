import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGuestCart } from "@/hooks/useGuestCart";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import CheckoutOptionsModal from "@/components/CheckoutOptionsModal";
import CartSuggestions from "@/components/CartSuggestions";
const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartTotal,
    cartCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    isLoading
  } = useGuestCart();
  const {
    currency
  } = useStoreSettings();
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await updateQuantity({
        itemId,
        quantity: newQuantity
      });
      if (newQuantity === 0) {
        toast({
          title: "Item removed",
          description: "Item has been removed from your cart."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };
  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await removeFromCart(itemId);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };
  const handleClearCart = async () => {
    try {
      await clearCart();
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleCheckout = () => {
    if (user) {
      // User is logged in, go directly to checkout
      navigate("/checkout");
    } else {
      // User is not logged in, show checkout options modal
      setShowCheckoutModal(true);
    }
  };
  const getMainImage = (item: any) => {
    // Check if item has variant with images
    if (item.product_variants?.product_variant_images && item.product_variants.product_variant_images.length > 0) {
      return item.product_variants.product_variant_images.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.image_url;
    }

    // Fall back to product images
    const images = item.products?.product_images || item.product?.product_images;
    if (images && images.length > 0) {
      return images.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.image_url;
    }
    return "/logo.png";
  };
  if (isLoading) {
    return <>
        <Header />
        <Breadcrumbs />
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-16 sm:h-20 bg-muted rounded mb-6 sm:mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-40 sm:h-32 bg-muted rounded"></div>)}
                </div>
                <div className="hidden lg:block h-96 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>;
  }
  return <>
      <Header />
      <Breadcrumbs />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button variant="ghost" size="icon" asChild className="h-9 w-9 sm:h-10 sm:w-10">
                <a href="/shop">
                  <ArrowLeft className="h-5 w-5" />
                </a>
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Shopping Cart</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
            </div>
            {cartCount > 0 && <Button variant="outline" onClick={handleClearCart} className="w-full sm:w-auto text-sm sm:text-base h-9 sm:h-10">
                Clear Cart
              </Button>}
          </div>

          {cartCount === 0 ? (/* Empty Cart */
        <div className="text-center py-12 sm:py-16">
              <ShoppingBag className="h-20 w-20 sm:h-24 sm:w-24 text-muted-foreground mx-auto mb-4 sm:mb-6" />
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2 sm:mb-4">Your cart is empty</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Button asChild className="h-11 px-8 text-base">
                <a href="/shop">Continue Shopping</a>
              </Button>
            </div>) : <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                {cartItems?.map(item => <Card key={item.id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img src={getMainImage(item)} alt={item.products?.name || 'Product'} className="h-24 w-24 sm:h-20 sm:w-20 object-cover rounded-lg border border-border" />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-foreground line-clamp-2 sm:truncate">
                              {item.products?.name || item.product?.name || 'Unknown Product'}
                            </h3>
                            {item.product_variants?.name && <p className="text-sm text-muted-foreground mt-1">
                                Variant: {item.product_variants.name}
                              </p>}
                            <p className="text-lg sm:text-xl font-bold text-primary mt-1 sm:mt-2">
                              {currency} {(item.product_variants?.price || item.products?.price || item.product?.price || 0).toFixed(2)}
                            </p>
                          </div>

                          <div className="flex flex-row sm:flex-col items-center justify-between sm:items-end gap-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-3">
                              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.id, item.quantity - 1)} disabled={updatingItems.has(item.id)} className="h-9 w-9 sm:h-8 sm:w-8">
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input type="number" value={item.quantity} onChange={e => {
                          const value = parseInt(e.target.value) || 0;
                          handleQuantityChange(item.id, value);
                        }} className="w-16 text-center h-9 sm:h-8" min="0" disabled={updatingItems.has(item.id)} />
                              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.id, item.quantity + 1)} disabled={updatingItems.has(item.id)} className="h-9 w-9 sm:h-8 sm:w-8">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Item Total */}
                            <div className="flex items-center gap-4">
                              <p className="text-base sm:text-lg font-semibold text-foreground whitespace-nowrap">
                                {currency} {((item.product_variants?.price || item.products?.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                              </p>

                              {/* Remove Button */}
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} disabled={updatingItems.has(item.id)} className="text-destructive hover:text-destructive h-9 w-9 sm:h-8 sm:w-8">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4 sm:top-8">
                  <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
                    <CardTitle className="text-xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="text-sm sm:text-base text-muted-foreground">Subtotal ({cartCount} items)</span>
                      <span className="text-sm sm:text-base font-semibold">{currency} {cartTotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="text-sm sm:text-base text-muted-foreground">Shipping</span>
                      <span className="text-sm sm:text-base font-semibold">Calculated at checkout</span>
                    </div>
                    
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="text-sm sm:text-base text-muted-foreground">Tax</span>
                      <span className="text-sm sm:text-base font-semibold">Calculated at checkout</span>
                    </div>
                    
                    <Separator className="my-2 sm:my-4" />
                    
                    <div className="flex justify-between text-base sm:text-lg font-bold">
                      <span>Total</span>
                      <span>{currency} {cartTotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="space-y-3 pt-2">
                      <Button className="w-full h-11 text-base" onClick={handleCheckout}>
                        Proceed to Checkout
                      </Button>
                      
                      <Button variant="outline" className="w-full h-11 text-base" asChild>
                        <a href="/shop">Continue Shopping</a>
                      </Button>
                    </div>
                    
                    <div className="pt-2">
                      
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Cart Suggestions - Moved to end */}
            <div className="mt-8 sm:mt-12">
              <CartSuggestions cartItems={cartItems} limit={4} />
            </div>
          </>}
        </div>
      </div>
      <Footer />
      
      <CheckoutOptionsModal isOpen={showCheckoutModal} onClose={() => setShowCheckoutModal(false)} />
    </>;
};
export default Cart;