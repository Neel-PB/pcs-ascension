-- Add shift_override column to store Day/Night selection for special shifts
ALTER TABLE public.positions ADD COLUMN shift_override text;