-- Clear all existing feed data
DELETE FROM public.comments;
DELETE FROM public.post_likes;
DELETE FROM public.posts;

-- Allow admins to delete any post
CREATE POLICY "Admins can delete any post"
ON public.posts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));