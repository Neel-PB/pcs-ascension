-- Create volume_overrides table
CREATE TABLE public.volume_overrides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market text NOT NULL,
  facility_id text NOT NULL,
  facility_name text NOT NULL,
  department_id text NOT NULL,
  department_name text NOT NULL,
  override_volume numeric NOT NULL,
  expiry_date date NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.volume_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view volume overrides"
  ON public.volume_overrides
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert volume overrides"
  ON public.volume_overrides
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update volume overrides"
  ON public.volume_overrides
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete volume overrides"
  ON public.volume_overrides
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Add updated_at trigger
CREATE TRIGGER update_volume_overrides_updated_at
  BEFORE UPDATE ON public.volume_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups by facility
CREATE INDEX idx_volume_overrides_facility ON public.volume_overrides(facility_id);

-- Create index for expiry date queries
CREATE INDEX idx_volume_overrides_expiry ON public.volume_overrides(expiry_date);