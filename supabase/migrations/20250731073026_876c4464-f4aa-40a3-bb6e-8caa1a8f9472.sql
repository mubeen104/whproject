-- Drop existing problematic policies for orders table
DROP POLICY IF EXISTS "Allow order creation for guests and authenticated users" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view guest orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

-- Create new comprehensive policies for orders table

-- Allow admins to manage all orders (authenticated and guest)
CREATE POLICY "Admins can manage all orders" 
ON public.orders 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow guest order creation (when user is not authenticated)
CREATE POLICY "Allow guest order creation" 
ON public.orders 
FOR INSERT 
WITH CHECK (user_id IS NULL);

-- Allow authenticated users to create their own orders
CREATE POLICY "Allow authenticated user order creation" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Allow authenticated users to view their own orders
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Allow admins to view all orders including guest orders
CREATE POLICY "Admins can view all orders including guest orders" 
ON public.orders 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));