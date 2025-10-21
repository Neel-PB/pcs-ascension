-- Drop the overly permissive public SELECT policy on profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a new policy that requires authentication to view profiles
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Note: The admin policy "Admins can view all profiles" remains in place as it's more specific