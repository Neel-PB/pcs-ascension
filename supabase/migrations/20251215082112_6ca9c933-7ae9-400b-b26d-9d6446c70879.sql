-- Add comment_type and metadata columns to position_comments table
ALTER TABLE public.position_comments 
ADD COLUMN comment_type TEXT NOT NULL DEFAULT 'comment',
ADD COLUMN metadata JSONB DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.position_comments.comment_type IS 'Type of comment: comment (regular), activity_fte (FTE change log), activity_shift (Shift change log)';
COMMENT ON COLUMN public.position_comments.metadata IS 'Stores change details for activity logs: {field, old_value, new_value}';