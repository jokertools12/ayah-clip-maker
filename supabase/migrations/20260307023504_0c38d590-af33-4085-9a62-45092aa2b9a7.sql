CREATE POLICY "Admins can view all videos"
ON public.saved_videos FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));