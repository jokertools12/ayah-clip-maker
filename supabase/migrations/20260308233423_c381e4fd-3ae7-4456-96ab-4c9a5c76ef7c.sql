
-- Create user_follows table for follow system
CREATE TABLE public.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can see follows
CREATE POLICY "Anyone can view follows" ON public.user_follows FOR SELECT USING (true);

-- Users can follow others
CREATE POLICY "Users can insert own follows" ON public.user_follows FOR INSERT TO authenticated
WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can delete own follows" ON public.user_follows FOR DELETE TO authenticated
USING (auth.uid() = follower_id);
