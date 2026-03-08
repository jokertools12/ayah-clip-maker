
-- ============================================================
-- 1. FIX ALL RLS POLICIES: Drop RESTRICTIVE, recreate as PERMISSIVE
-- ============================================================

-- saved_videos
DROP POLICY IF EXISTS "Users can view own videos" ON public.saved_videos;
DROP POLICY IF EXISTS "Admins can view all videos" ON public.saved_videos;
DROP POLICY IF EXISTS "Users can insert own videos" ON public.saved_videos;
DROP POLICY IF EXISTS "Users can update own videos" ON public.saved_videos;
DROP POLICY IF EXISTS "Users can delete own videos" ON public.saved_videos;

CREATE POLICY "Users can view own videos" ON public.saved_videos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all videos" ON public.saved_videos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
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

-- payment_requests
DROP POLICY IF EXISTS "Users can view own payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Admins can view all payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Users can create payment requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Admins can update payment requests" ON public.payment_requests;

CREATE POLICY "Users can view own payment requests" ON public.payment_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all payment requests" ON public.payment_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create payment requests" ON public.payment_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update payment requests" ON public.payment_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- user_roles
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
CREATE POLICY "Admins can read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- favorite_surahs
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorite_surahs;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorite_surahs;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorite_surahs;

CREATE POLICY "Users can view own favorites" ON public.favorite_surahs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.favorite_surahs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorite_surahs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 2. GAMIFICATION: Achievements & User Achievements
-- ============================================================

CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'trophy',
  category text NOT NULL DEFAULT 'general',
  threshold integer NOT NULL DEFAULT 1,
  points integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

INSERT INTO public.achievements (key, title, description, icon, category, threshold, points) VALUES
  ('first_video', 'الخطوة الأولى', 'أنشئ أول فيديو لك', 'video', 'videos', 1, 10),
  ('five_videos', 'منتج نشط', 'أنشئ 5 فيديوهات', 'video', 'videos', 5, 25),
  ('twenty_videos', 'صانع محتوى', 'أنشئ 20 فيديو', 'video', 'videos', 20, 50),
  ('fifty_videos', 'خبير الفيديو', 'أنشئ 50 فيديو', 'trophy', 'videos', 50, 100),
  ('hundred_videos', 'أسطورة المحتوى', 'أنشئ 100 فيديو', 'crown', 'videos', 100, 200),
  ('first_favorite', 'محب القرآن', 'أضف أول سورة مفضلة', 'heart', 'engagement', 1, 10),
  ('five_favorites', 'عاشق السور', 'أضف 5 سور مفضلة', 'heart', 'engagement', 5, 25),
  ('five_reciters', 'متذوق التلاوة', 'استخدم 5 قراء مختلفين', 'mic', 'exploration', 5, 30),
  ('ten_surahs', 'مستكشف السور', 'أنشئ فيديوهات من 10 سور مختلفة', 'book-open', 'exploration', 10, 40),
  ('premium_member', 'عضو مميز', 'اشترك في الخطة المميزة', 'crown', 'membership', 1, 50)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 3. DISCOVER PAGE: Public videos + likes
-- ============================================================

ALTER TABLE public.saved_videos ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.video_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  video_id uuid NOT NULL REFERENCES public.saved_videos(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, video_id)
);

ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view likes" ON public.video_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own likes" ON public.video_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.video_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public videos" ON public.saved_videos FOR SELECT TO authenticated USING (is_public = true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.video_likes;
