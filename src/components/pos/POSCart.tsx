import { Minus, Plus, Trash2, Edit, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { POSCartItem } from '@/hooks/usePOS';
import { formatCurrency } from '@/lib/currency';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface POSCartProps {
  items: POSCartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdateCustomPrice: (id: string, price: number) => void;
  onUpdateDiscount: (id: string, discount: number) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onRemove: (id: string) => void;
}

export function POSCart({
  items,
  onUpdateQuantity,
  onUpdateCustomPrice,
  onUpdateDiscount,
  onUpdateNotes,
  onRemove,
}: POSCartProps) {
  const [editingItem, setEditingItem] = useState<POSCartItem | null>(null);
  const [customPrice, setCustomPrice] = useState('');
  const [itemDiscount, setItemDiscount] = useState('');
  const [itemNotes, setItemNotes] = useState('');

  const openEditDialog = (item: POSCartItem) => {
    setEditingItem(item);
    setCustomPrice(item.custom_price?.toString() || item.price.toString());
    setItemDiscount(item.discount?.toString() || '0');
    setItemNotes(item.notes || '');
  };

  const saveItemChanges = () => {
    if (!editingItem) return;

    const price = parseFloat(customPrice);
    const discount = parseFloat(itemDiscount);

    if (price !== editingItem.price) {
      onUpdateCustomPrice(editingItem.id, price);
    }
    if (discount > 0) {
      onUpdateDiscount(editingItem.id, discount);
    }
    if (itemNotes) {
      onUpdateNotes(editingItem.id, itemNotes);
    }

    setEditingItem(null);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Plus className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Cart is empty</h3>
        <p className="text-sm text-muted-foreground">
          Search and add products to start a sale
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 overflow-y-auto flex-1">
        {items.map(item => {
          const effectivePrice = item.custom_price ?? item.price;
          const itemTotal = (effectivePrice - (item.discount ?? 0)) * item.quantity;

          return (
            <Card key={item.id} className="p-3">
              <div className="flex gap-3">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                      {item.custom_price && (
                        <p className="text-xs text-primary">Custom price applied</p>
                      )}
                      {item.discount && item.discount > 0 && (
                        <p className="text-xs text-green-600">
                          Discount: {formatCurrency(item.discount)}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <StickyNote className="h-3 w-3" />
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(itemTotal)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(effectivePrice)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 h-8 text-center border-0 p-0"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onRemove(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Custom Price</Label>
              <Input
                type="number"
                step="0.01"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
              />
            </div>
            <div>
              <Label>Item Discount</Label>
              <Input
                type="number"
                step="0.01"
                value={itemDiscount}
                onChange={(e) => setItemDiscount(e.target.value)}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                placeholder="Add notes for this item..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button onClick={saveItemChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
