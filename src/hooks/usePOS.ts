import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface POSCartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  sku?: string;
  custom_price?: number;
  discount?: number;
  notes?: string;
}

export interface POSCustomer {
  id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

export interface POSPayment {
  method: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other';
  amount: number;
  reference?: string;
}

export const usePOS = () => {
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [customer, setCustomer] = useState<POSCustomer | null>(null);
  const [payments, setPayments] = useState<POSPayment[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  
  const queryClient = useQueryClient();

  const addToCart = (item: Omit<POSCartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(i => 
        i.product_id === item.product_id && 
        i.variant_id === item.variant_id
      );
      
      if (existing) {
        return prev.map(i => 
          i.product_id === item.product_id && i.variant_id === item.variant_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success('Added to cart');
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const updateCustomPrice = (id: string, price: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, custom_price: price } : item
    ));
  };

  const updateItemDiscount = (id: string, discount: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, discount } : item
    ));
  };

  const updateItemNotes = (id: string, notes: string) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, notes } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    toast.success('Removed from cart');
  };

  const clearCart = () => {
    setCart([]);
    setCustomer(null);
    setPayments([]);
    setDiscount(0);
    setNotes('');
  };

  const addPayment = (payment: POSPayment) => {
    setPayments(prev => [...prev, payment]);
  };

  const removePayment = (index: number) => {
    setPayments(prev => prev.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      const price = item.custom_price ?? item.price;
      const itemDiscount = item.discount ?? 0;
      return sum + (price - itemDiscount) * item.quantity;
    }, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percentage') {
      return (subtotal * discount) / 100;
    }
    return discount;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount();
    return ((subtotal - discountAmount) * taxRate) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discountAmount + tax;
  };

  const getTotalPaid = () => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  };

  const getBalance = () => {
    return calculateTotal() - getTotalPaid();
  };

  const completeSale = useMutation({
    mutationFn: async () => {
      if (cart.length === 0) {
        throw new Error('Cart is empty');
      }

      const total = calculateTotal();
      const totalPaid = getTotalPaid();

      if (totalPaid < total) {
        throw new Error(`Insufficient payment. Balance: ${(total - totalPaid).toFixed(2)}`);
      }

      // Generate order number
      const orderNumber = 'POS-' + Date.now();

      // Create order
      const orderData = {
        order_number: orderNumber,
        user_id: customer?.id || null,
        subtotal: calculateSubtotal(),
        discount_amount: calculateDiscount(),
        tax_amount: calculateTax(),
        total_amount: total,
        status: 'completed',
        payment_status: 'paid',
        payment_method: payments.map(p => p.method).join(', '),
        notes: notes || null,
        shipping_address: customer ? {
          first_name: customer.first_name,
          last_name: customer.last_name,
          email: customer.email,
          phone: customer.phone,
        } : null,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.custom_price ?? item.price,
        total: (item.custom_price ?? item.price) * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update inventory
      for (const item of cart) {
        if (item.variant_id) {
          // Get current inventory
          const { data: variant } = await supabase
            .from('product_variants')
            .select('inventory_quantity')
            .eq('id', item.variant_id)
            .single();
          
          if (variant) {
            await supabase
              .from('product_variants')
              .update({ inventory_quantity: variant.inventory_quantity - item.quantity })
              .eq('id', item.variant_id);
          }
        } else {
          // Get current inventory
          const { data: product } = await supabase
            .from('products')
            .select('inventory_quantity')
            .eq('id', item.product_id)
            .single();
          
          if (product) {
            await supabase
              .from('products')
              .update({ inventory_quantity: (product.inventory_quantity || 0) - item.quantity })
              .eq('id', item.product_id);
          }
        }
      }

      return order;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Sale completed! Order #${order.order_number}`);
      clearCart();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const parkSale = () => {
    const saleData = {
      cart,
      customer,
      payments,
      discount,
      discountType,
      notes,
      taxRate,
      timestamp: Date.now(),
    };
    
    const parkedSales = JSON.parse(localStorage.getItem('parkedSales') || '[]');
    parkedSales.push(saleData);
    localStorage.setItem('parkedSales', JSON.stringify(parkedSales));
    
    clearCart();
    toast.success('Sale parked successfully');
  };

  const loadParkedSale = (index: number) => {
    const parkedSales = JSON.parse(localStorage.getItem('parkedSales') || '[]');
    const sale = parkedSales[index];
    
    if (sale) {
      setCart(sale.cart);
      setCustomer(sale.customer);
      setPayments(sale.payments);
      setDiscount(sale.discount);
      setDiscountType(sale.discountType);
      setNotes(sale.notes);
      setTaxRate(sale.taxRate);
      
      parkedSales.splice(index, 1);
      localStorage.setItem('parkedSales', JSON.stringify(parkedSales));
      
      toast.success('Parked sale loaded');
    }
  };

  const getParkedSales = () => {
    return JSON.parse(localStorage.getItem('parkedSales') || '[]');
  };

  return {
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
  };
};
