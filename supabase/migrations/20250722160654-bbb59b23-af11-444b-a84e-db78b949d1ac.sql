-- Add INSERT policy for order_items to allow users to create order items when placing orders
CREATE POLICY "Users can create order items for their own orders" ON public.order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Add INSERT policy for admins to manage all order items
CREATE POLICY "Admins can manage all order items" ON public.order_items
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));