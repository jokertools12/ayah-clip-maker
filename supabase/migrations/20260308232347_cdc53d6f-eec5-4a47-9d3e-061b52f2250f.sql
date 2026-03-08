
-- favorite_reciters table
CREATE TABLE public.favorite_reciters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reciter_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, reciter_id)
);

ALTER TABLE public.favorite_reciters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorite reciters" ON public.favorite_reciters FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorite reciters" ON public.favorite_reciters FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorite reciters" ON public.favorite_reciters FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- video_comments table
CREATE TABLE public.video_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.saved_videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.video_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON public.video_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.video_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);
