import { useState } from 'react';
import { CreditCard, Banknote, Smartphone, Building2, MoreHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { POSPayment } from '@/hooks/usePOS';
import { formatCurrency } from '@/lib/currency';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  remainingAmount: number;
  onAddPayment: (payment: POSPayment) => void;
}

export function PaymentModal({
  open,
  onClose,
  remainingAmount,
  onAddPayment,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<POSPayment['method']>('cash');
  const [amount, setAmount] = useState(remainingAmount.toString());
  const [reference, setReference] = useState('');

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'upi', label: 'UPI', icon: Smartphone },
    { id: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
    { id: 'other', label: 'Other', icon: MoreHorizontal },
  ] as const;

  const handleAddPayment = () => {
    const paymentAmount = parseFloat(amount);
    if (paymentAmount > 0) {
      onAddPayment({
        method: selectedMethod,
        amount: paymentAmount,
        reference: reference || undefined,
      });
      setAmount(remainingAmount.toString());
      setReference('');
      onClose();
    }
  };

  const setQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Remaining: {formatCurrency(remainingAmount)}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Payment Method</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {paymentMethods.map(method => {
                const Icon = method.icon;
                return (
                  <Button
                    key={method.id}
                    variant={selectedMethod === method.id ? 'default' : 'outline'}
                    className="flex flex-col h-20"
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{method.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-bold"
            />
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[100, 500, 1000, remainingAmount].map(value => (
                <Button
                  key={value}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickAmount(value)}
                >
                  {value === remainingAmount ? 'Exact' : formatCurrency(value)}
                </Button>
              ))}
            </div>
          </div>

          {selectedMethod !== 'cash' && (
            <div>
              <Label>Reference Number (Optional)</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Transaction reference..."
              />
            </div>
          )}

          {parseFloat(amount) > remainingAmount && (
            <div className="p-3 bg-accent rounded-md">
              <p className="text-sm font-medium">
                Change: {formatCurrency(parseFloat(amount) - remainingAmount)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddPayment}>
            Add Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
