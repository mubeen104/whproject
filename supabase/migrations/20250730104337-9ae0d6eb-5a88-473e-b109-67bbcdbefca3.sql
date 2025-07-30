-- Drop the current problematic policy
DROP POLICY IF EXISTS "Enable insert for guests and authenticated users" ON public.orders;

-- Create a new policy that properly handles both guest and authenticated users
CREATE POLICY "Allow order creation for guests and authenticated users" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  -- Allow if user_id is NULL (guest order) regardless of auth state
  (user_id IS NULL) OR 
  -- Allow if user is authenticated and user_id matches auth.uid()
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);