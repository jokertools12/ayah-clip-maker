-- Create table for favorite ibtahalat performers
CREATE TABLE IF NOT EXISTS public.favorite_performers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  performer_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, performer_id)
);

ALTER TABLE public.favorite_performers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorite performers" ON public.favorite_performers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorite performers" ON public.favorite_performers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorite performers" ON public.favorite_performers
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger function for follow notifications
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.following_id,
    'متابع جديد',
    'لديك متابع جديد!',
    'info'
  );
  RETURN NEW;
END;
$$;

-- Create trigger function for like notifications
CREATE OR REPLACE FUNCTION public.notify_on_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  video_owner_id uuid;
  surah_name_val text;
BEGIN
  SELECT user_id, surah_name INTO video_owner_id, surah_name_val
  FROM public.saved_videos WHERE id = NEW.video_id;
  
  IF video_owner_id IS NOT NULL AND video_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      video_owner_id,
      'إعجاب جديد',
      'أعجب شخص بفيديو ' || COALESCE(surah_name_val, ''),
      'info'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger function for comment notifications
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  video_owner_id uuid;
  surah_name_val text;
BEGIN
  SELECT user_id, surah_name INTO video_owner_id, surah_name_val
  FROM public.saved_videos WHERE id = NEW.video_id;
  
  IF video_owner_id IS NOT NULL AND video_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      video_owner_id,
      'تعليق جديد',
      'علّق شخص على فيديو ' || COALESCE(surah_name_val, ''),
      'info'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_follow_notification
  AFTER INSERT ON public.user_follows
  FOR EACH ROW EXECUTE FUNCTION notify_on_follow();

CREATE TRIGGER on_like_notification
  AFTER INSERT ON public.video_likes
  FOR EACH ROW EXECUTE FUNCTION notify_on_like();

CREATE TRIGGER on_comment_notification
  AFTER INSERT ON public.video_comments
  FOR EACH ROW EXECUTE FUNCTION notify_on_comment();