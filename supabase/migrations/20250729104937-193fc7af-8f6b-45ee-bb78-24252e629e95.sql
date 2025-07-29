-- Drop all existing policies on orders table to start fresh
DROP POLICY IF EXISTS "Users and guests can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view guest orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

-- Recreate all policies with correct logic

-- Allow guests and authenticated users to create orders
CREATE POLICY "Enable insert for guests and authenticated users"
ON public.orders
FOR INSERT
WITH CHECK (
  -- Allow guest orders (user_id is null)
  user_id IS NULL
  OR
  -- Allow authenticated users to create their own orders
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);

-- Allow users to view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

-- Allow admins to view guest orders
CREATE POLICY "Admins can view guest orders"
ON public.orders
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) AND user_id IS NULL);

-- Allow admins to manage all orders
CREATE POLICY "Admins can manage all orders"
ON public.orders
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));