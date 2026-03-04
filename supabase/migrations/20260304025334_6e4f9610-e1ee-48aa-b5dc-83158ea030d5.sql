
-- Allow admins to read all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all subscriptions for insert
CREATE POLICY "Admins can delete subscriptions" ON public.subscriptions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
