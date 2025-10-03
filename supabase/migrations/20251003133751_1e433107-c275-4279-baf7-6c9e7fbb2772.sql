-- Create position_comments table for comments on positions (employees, contractors, requisitions)
CREATE TABLE public.position_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.position_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Comments are viewable by authenticated users"
  ON public.position_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON public.position_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.position_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.position_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_position_comments_position_id ON public.position_comments(position_id);
CREATE INDEX idx_position_comments_created_at ON public.position_comments(created_at DESC);

-- Update timestamp trigger
CREATE TRIGGER update_position_comments_updated_at
  BEFORE UPDATE ON public.position_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();