-- Create community posts table

CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'question', 'recommendation', 'job', 'announcement')),
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post comments
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post likes
CREATE TABLE IF NOT EXISTS public.community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view posts
CREATE POLICY "users_view_posts" ON public.community_posts
  FOR SELECT USING (true);

-- Users can create posts
CREATE POLICY "users_create_posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "users_update_own_posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "users_delete_own_posts" ON public.community_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can manage all posts
CREATE POLICY "admins_manage_posts" ON public.community_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Comments policies
CREATE POLICY "users_view_comments" ON public.community_comments
  FOR SELECT USING (true);

CREATE POLICY "users_create_comments" ON public.community_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_comments" ON public.community_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "users_view_likes" ON public.community_likes
  FOR SELECT USING (true);

CREATE POLICY "users_manage_own_likes" ON public.community_likes
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_posts_user ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.community_posts(category);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.community_comments(post_id);
