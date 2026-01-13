-- Create np_overrides table for Non-Productive time overrides
CREATE TABLE public.np_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market text NOT NULL,
  facility_id text NOT NULL,
  facility_name text NOT NULL,
  department_id text NOT NULL,
  department_name text NOT NULL,
  np_override_volume numeric NOT NULL,
  expiry_date date NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.np_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view np overrides"
ON public.np_overrides FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert np overrides"
ON public.np_overrides FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update np overrides"
ON public.np_overrides FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete np overrides"
ON public.np_overrides FOR DELETE
USING (auth.role() = 'authenticated');

-- Auto-update timestamp trigger
CREATE TRIGGER update_np_overrides_updated_at
BEFORE UPDATE ON public.np_overrides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups
CREATE INDEX idx_np_overrides_facility_id ON public.np_overrides(facility_id);
CREATE INDEX idx_np_overrides_department_id ON public.np_overrides(department_id);