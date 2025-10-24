import { useRef } from 'react';
import { Printer, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { POSCartItem, POSCustomer, POSPayment } from '@/hooks/usePOS';
import { formatCurrency } from '@/lib/currency';

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  orderNumber: string;
  items: POSCartItem[];
  customer: POSCustomer | null;
  payments: POSPayment[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export function ReceiptModal({
  open,
  onClose,
  orderNumber,
  items,
  customer,
  payments,
  subtotal,
  discount,
  tax,
  total,
}: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple text receipt
    let receipt = `
NEW ERA HERBALS
Order #${orderNumber}
Date: ${new Date().toLocaleString()}
${'-'.repeat(40)}

`;

    if (customer) {
      receipt += `Customer: ${customer.first_name} ${customer.last_name}\n`;
      if (customer.email) receipt += `Email: ${customer.email}\n`;
      if (customer.phone) receipt += `Phone: ${customer.phone}\n`;
      receipt += `${'-'.repeat(40)}\n\n`;
    }

    receipt += 'Items:\n';
    items.forEach(item => {
      const price = item.custom_price ?? item.price;
      const itemTotal = (price - (item.discount ?? 0)) * item.quantity;
      receipt += `${item.name}\n`;
      receipt += `  ${item.quantity} x ${formatCurrency(price)} = ${formatCurrency(itemTotal)}\n`;
      if (item.discount) receipt += `  Discount: ${formatCurrency(item.discount)}\n`;
    });

    receipt += `\n${'-'.repeat(40)}\n`;
    receipt += `Subtotal: ${formatCurrency(subtotal)}\n`;
    if (discount > 0) receipt += `Discount: -${formatCurrency(discount)}\n`;
    if (tax > 0) receipt += `Tax: ${formatCurrency(tax)}\n`;
    receipt += `Total: ${formatCurrency(total)}\n`;
    receipt += `${'-'.repeat(40)}\n\n`;

    receipt += 'Payments:\n';
    payments.forEach(payment => {
      receipt += `${payment.method.toUpperCase()}: ${formatCurrency(payment.amount)}\n`;
      if (payment.reference) receipt += `  Ref: ${payment.reference}\n`;
    });

    receipt += `\nThank you for your purchase!\n`;

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>

        <div ref={receiptRef} className="space-y-4 p-4 bg-background">
          <div className="text-center">
            <h2 className="text-xl font-bold">NEW ERA HERBALS</h2>
            <p className="text-sm text-muted-foreground">Order #{orderNumber}</p>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleString()}
            </p>
          </div>

          {customer && (
            <div className="border-t border-b py-2">
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
          )}

          <div className="space-y-2">
            <h3 className="font-semibold">Items</h3>
            {items.map((item, index) => {
              const price = item.custom_price ?? item.price;
              const itemTotal = (price - (item.discount ?? 0)) * item.quantity;
              return (
                <div key={index} className="text-sm">
                  <div className="flex justify-between">
                    <span>{item.name}</span>
                    <span>{formatCurrency(itemTotal)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.quantity} x {formatCurrency(price)}
                  </div>
                  {item.discount && item.discount > 0 && (
                    <div className="text-xs text-green-600">
                      Item discount: -{formatCurrency(item.discount)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t pt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-1">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="border-t pt-2 space-y-1 text-sm">
            <h3 className="font-semibold mb-2">Payments</h3>
            {payments.map((payment, index) => (
              <div key={index} className="flex justify-between">
                <span className="capitalize">{payment.method}:</span>
                <span>{formatCurrency(payment.amount)}</span>
              </div>
            ))}
          </div>

          <div className="text-center text-xs text-muted-foreground pt-2 border-t">
            Thank you for your purchase!
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button className="flex-1" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
