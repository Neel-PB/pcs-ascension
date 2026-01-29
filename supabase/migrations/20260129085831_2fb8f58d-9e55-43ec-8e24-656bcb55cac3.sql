-- Add columns for shared position data in Active FTE feature
ALTER TABLE positions 
ADD COLUMN IF NOT EXISTS actual_fte_shared_with TEXT,
ADD COLUMN IF NOT EXISTS actual_fte_shared_fte NUMERIC,
ADD COLUMN IF NOT EXISTS actual_fte_shared_expiry DATE;

COMMENT ON COLUMN positions.actual_fte_shared_with IS 'Department/facility the position is shared with';
COMMENT ON COLUMN positions.actual_fte_shared_fte IS 'FTE portion allocated to the shared arrangement';
COMMENT ON COLUMN positions.actual_fte_shared_expiry IS 'When the sharing arrangement ends';