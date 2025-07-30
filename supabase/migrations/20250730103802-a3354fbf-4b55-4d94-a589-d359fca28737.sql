-- Fix order_items RLS policies to allow guest order items
DROP POLICY IF EXISTS "Users can create order items for their own orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;

-- Allow users to create order items for their own orders OR for guest orders when not authenticated
CREATE POLICY "Users can create order items for their own orders" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      (orders.user_id = auth.uid()) OR 
      (orders.user_id IS NULL AND auth.uid() IS NULL)
    )
  )
);

-- Allow users to view their own order items OR guest order items (for admins)
CREATE POLICY "Users can view their own order items" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      (orders.user_id = auth.uid()) OR 
      (orders.user_id IS NULL AND has_role(auth.uid(), 'admin'::app_role))
    )
  )
);