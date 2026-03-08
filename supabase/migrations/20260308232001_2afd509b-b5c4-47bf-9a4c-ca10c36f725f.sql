
-- ============================================================
-- FIX: Convert ALL RESTRICTIVE policies to PERMISSIVE
-- ============================================================

-- saved_videos
DROP POLICY IF EXISTS "Users can view own videos" ON public.saved_videos;
DROP POLICY IF EXISTS "Admins can view all videos" ON public.saved_videos;
DROP POLICY IF EXISTS "Users can insert own videos" ON public.saved_videos;
DROP POLICY IF EXISTS "Users can update own videos" ON public.saved_videos;
DROP POLICY IF EXISTS "Users can delete own videos" ON public.saved_videos;
DROP POLICY IF EXISTS "Anyone can view public videos" ON public.saved_videos;

CREATE POLICY "Users can view own videos" ON public.saved_videos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all videos" ON public.saved_videos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view public videos" ON public.saved_videos FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert own videos" ON public.saved_videos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own videos" ON public.saved_videos FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own videos" ON public.saved_videos FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- daily_video_usage
DROP POLICY IF EXISTS "Users can view own usage" ON public.daily_video_usage;
DROP POLICY IF EXISTS "Admins can view all usage" ON public.daily_video_usage;
DROP POLICY IF EXISTS "Users can insert own usage" ON public.daily_video_usage;
DROP POLICY IF EXISTS "Users can update own usage" ON public.daily_video_usage;

CREATE POLICY "Users can view own usage" ON public.daily_video_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all usage" ON public.daily_video_usage FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own usage" ON public.daily_video_usage FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON public.daily_video_usage FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can insert subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can delete subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert subscriptions" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);
CREATE POLICY "Admins can update subscriptions" ON public.subscriptions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete subscriptions" ON public.subscriptions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- user_achievements
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;

CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated can view all achievements" ON public.user_achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- achievements
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- video_likes
DROP POLICY IF EXISTS "Anyone can view likes" ON public.video_likes;
DROP POLICY IF EXISTS "Users can insert own likes" ON public.video_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.video_likes;

CREATE POLICY "Anyone can view likes" ON public.video_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON public.video_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.video_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- favorite_surahs
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorite_surahs;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorite_surahs;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorite_surahs;

CREATE POLICY "Users can view own favorites" ON public.favorite_surahs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.favorite_surahs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorite_surahs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- payment_requests
DROP POLICY IF EXISTS "Users can view own payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Admins can view all payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Users can create payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Admins can update payment requests" ON public.payment_requests;

CREATE POLICY "Users can view own payment requests" ON public.payment_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all payment requests" ON public.payment_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create payment requests" ON public.payment_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update payment requests" ON public.payment_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
