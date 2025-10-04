-- Add DELETE RLS policy for admins on profiles table
CREATE POLICY "Admins can delete profiles" 
ON public.profiles
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add unique constraint to enforce single role per user
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);