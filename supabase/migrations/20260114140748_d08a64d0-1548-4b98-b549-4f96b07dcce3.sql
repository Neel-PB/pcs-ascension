-- Add new status columns
ALTER TABLE feedback 
ADD COLUMN pcs_status text NOT NULL DEFAULT 'pending',
ADD COLUMN pb_status text NOT NULL DEFAULT 'in_progress';

-- Migrate existing data: map old status to new columns
UPDATE feedback SET 
  pcs_status = CASE 
    WHEN status = 'new' THEN 'pending'
    WHEN status = 'closed' THEN 'disregard'
    ELSE 'pending'
  END,
  pb_status = CASE 
    WHEN status = 'in_progress' THEN 'in_progress'
    WHEN status = 'resolved' THEN 'resolved'
    WHEN status = 'closed' THEN 'closed'
    ELSE 'in_progress'
  END;

-- Drop old status column
ALTER TABLE feedback DROP COLUMN status;

-- Create trigger function for business rule: auto-set pb_status to 'closed' 
-- when pcs_status is 'disregard' or 'backlog'
CREATE OR REPLACE FUNCTION public.enforce_pb_status_rule()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.pcs_status IN ('disregard', 'backlog') THEN
    NEW.pb_status := 'closed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER feedback_pb_status_rule
BEFORE INSERT OR UPDATE ON feedback
FOR EACH ROW
EXECUTE FUNCTION public.enforce_pb_status_rule();