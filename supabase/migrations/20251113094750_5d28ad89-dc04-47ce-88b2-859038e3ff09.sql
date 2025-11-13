-- Drop the existing foreign key constraint that points to auth.users
ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Add the correct foreign key constraint pointing to profiles
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON public.reviews(is_approved);