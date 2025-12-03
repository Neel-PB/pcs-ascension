-- Add expiry date and status columns for Active FTE overrides
ALTER TABLE public.positions
ADD COLUMN actual_fte_expiry DATE NULL,
ADD COLUMN actual_fte_status TEXT NULL;