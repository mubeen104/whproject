import { useState } from 'react';
import {
  ShoppingCart,
  Trash2,
  Archive,
  FolderOpen,
  Receipt,
  Calculator,
  Percent,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ProductSearch } from '@/components/pos/ProductSearch';
import { POSCart } from '@/components/pos/POSCart';
import { CustomerSelect } from '@/components/pos/CustomerSelect';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { ReceiptModal } from '@/components/pos/ReceiptModal';
import { usePOS } from '@/hooks/usePOS';
import { formatCurrency } from '@/lib/currency';
import { toast } from 'sonner';

export default function AdminPOS() {
  const {
    cart,
    customer,
    payments,
    discount,
    discountType,
    notes,
    taxRate,
    addToCart,
    updateQuantity,
    updateCustomPrice,
    updateItemDiscount,
    updateItemNotes,
    removeFromCart,
    clearCart,
    setCustomer,
    addPayment,
    removePayment,
    setDiscount,
    setDiscountType,
    setNotes,
    setTaxRate,
    calculateSubtotal,
    calculateDiscount,
    calculateTax,
    calculateTotal,
    getTotalPaid,
    getBalance,
    completeSale,
    parkSale,
    loadParkedSale,
    getParkedSales,
  } = usePOS();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  const parkedSales = getParkedSales();
  const subtotal = calculateSubtotal();
  const discountAmount = calculateDiscount();
  const tax = calculateTax();
  const total = calculateTotal();
  const totalPaid = getTotalPaid();
  const balance = getBalance();

  const handleCompleteSale = async () => {
    if (balance > 0) {
      setShowPaymentModal(true);
      return;
    }

    const result = await completeSale.mutateAsync();
    setLastOrder({
      orderNumber: result.order_number,
      items: cart,
      customer,
      payments,
      subtotal,
      discount: discountAmount,
      tax,
      total,
    });
    setShowReceiptModal(true);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-4 p-4">
      {/* Left Panel - Products */}
      <div className="w-2/5 flex flex-col gap-4">
        <Card className="p-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Point of Sale
          </h2>
          <ProductSearch onAddToCart={addToCart} />
        </Card>

        <CustomerSelect customer={customer} onSelectCustomer={setCustomer} />

        {parkedSales.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Parked Sales ({parkedSales.length})
            </h3>
            <div className="space-y-2">
              {parkedSales.map((sale: any, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => loadParkedSale(index)}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  {new Date(sale.timestamp).toLocaleString()} - {sale.cart.length}{' '}
                  items
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Middle Panel - Cart */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Current Sale</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={parkSale}
                disabled={cart.length === 0}
              >
                <Archive className="h-4 w-4 mr-2" />
                Park
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          <POSCart
            items={cart}
            onUpdateQuantity={updateQuantity}
            onUpdateCustomPrice={updateCustomPrice}
            onUpdateDiscount={updateItemDiscount}
            onUpdateNotes={updateItemNotes}
            onRemove={removeFromCart}
          />
        </Card>
      </div>

      {/* Right Panel - Checkout */}
      <div className="w-1/3 flex flex-col gap-4">
        <Card className="p-4 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Checkout
          </h2>

          <Separator />

          {/* Discount */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Discount
            </Label>
            <RadioGroup
              value={discountType}
              onValueChange={(value: 'percentage' | 'fixed') =>
                setDiscountType(value)
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage">%</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed">Fixed</Label>
              </div>
            </RadioGroup>
            <Input
              type="number"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              placeholder={discountType === 'percentage' ? 'Discount %' : 'Discount amount'}
            />
          </div>

          {/* Tax */}
          <div className="space-y-2">
            <Label>Tax Rate (%)</Label>
            <Input
              type="number"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add order notes..."
              rows={2}
            />
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between">
                <span>Tax ({taxRate}%):</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Payments */}
          {payments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Payments</Label>
                {payments.map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="capitalize">
                      {payment.method}: {formatCurrency(payment.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removePayment(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-between font-bold">
                  <span>Balance:</span>
                  <span className={balance > 0 ? 'text-destructive' : 'text-green-600'}>
                    {formatCurrency(balance)}
                  </span>
                </div>
              </div>
            </>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPaymentModal(true)}
            disabled={cart.length === 0}
          >
            Add Payment
          </Button>
          <Button
            onClick={handleCompleteSale}
            disabled={cart.length === 0 || completeSale.isPending}
          >
            {balance > 0 ? 'Pay Now' : 'Complete Sale'}
          </Button>
        </div>
      </div>

      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        remainingAmount={balance}
        onAddPayment={(payment) => {
          addPayment(payment);
          toast.success('Payment added');
        }}
      />

      {lastOrder && (
        <ReceiptModal
          open={showReceiptModal}
          onClose={() => {
            setShowReceiptModal(false);
            setLastOrder(null);
          }}
          orderNumber={lastOrder.orderNumber}
          items={lastOrder.items}
          customer={lastOrder.customer}
          payments={lastOrder.payments}
          subtotal={lastOrder.subtotal}
          discount={lastOrder.discount}
          tax={lastOrder.tax}
          total={lastOrder.total}
        />
      )}
    </div>
  );
}
