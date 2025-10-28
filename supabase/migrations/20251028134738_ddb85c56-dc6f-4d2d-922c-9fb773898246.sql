-- Create data_refresh_log table to track data refresh timestamps
CREATE TABLE IF NOT EXISTS public.data_refresh_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_source text NOT NULL UNIQUE,
  last_refresh_at timestamptz NOT NULL,
  refresh_status text DEFAULT 'success',
  record_count integer,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.data_refresh_log ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read refresh timestamps
CREATE POLICY "Allow authenticated users to read refresh logs"
  ON public.data_refresh_log
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert/update refresh logs
CREATE POLICY "Allow admins to manage refresh logs"
  ON public.data_refresh_log
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for auto-updating updated_at
CREATE TRIGGER set_data_refresh_log_updated_at
  BEFORE UPDATE ON public.data_refresh_log
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial refresh records for existing data sources
INSERT INTO public.data_refresh_log (data_source, last_refresh_at, refresh_status, notes)
VALUES 
  ('positions', now(), 'success', 'Employee, Contractor, and Requisition data'),
  ('staffing_standards', now(), 'success', 'Budget and target FTE allocations'),
  ('labor_performance', now(), 'success', 'Actual labor hours and performance metrics'),
  ('organizational_structure', now(), 'success', 'Facilities, Markets, Departments, and Regions'),
  ('employee_activity', now(), 'success', 'Posts and comments feed')
ON CONFLICT (data_source) DO NOTHING;