-- Drop the existing INSERT policy for orders
DROP POLICY IF EXISTS "Users and guests can create orders" ON public.orders;

-- Create a new INSERT policy that properly handles guest orders
CREATE POLICY "Users and guests can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  -- Allow if user_id is null (guest orders)
  user_id IS NULL 
  OR 
  -- Allow if user is authenticated and user_id matches auth.uid()
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);