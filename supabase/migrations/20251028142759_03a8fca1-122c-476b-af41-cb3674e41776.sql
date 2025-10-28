-- Create forecast positions to open table
CREATE TABLE public.forecast_positions_to_open (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market text NOT NULL,
  facility_id text,
  facility_name text NOT NULL,
  department_id text,
  department_name text NOT NULL,
  skill_type text NOT NULL,
  reason_to_open text NOT NULL,
  fte numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_open_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Create forecast positions to close table
CREATE TABLE public.forecast_positions_to_close (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market text NOT NULL,
  facility_id text,
  facility_name text NOT NULL,
  department_id text,
  department_name text NOT NULL,
  skill_type text NOT NULL,
  reason_to_close text NOT NULL,
  fte numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_close_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Enable RLS on both tables
ALTER TABLE public.forecast_positions_to_open ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_positions_to_close ENABLE ROW LEVEL SECURITY;

-- RLS policies for positions to open
CREATE POLICY "Authenticated users can view positions to open"
  ON public.forecast_positions_to_open
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage positions to open"
  ON public.forecast_positions_to_open
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for positions to close
CREATE POLICY "Authenticated users can view positions to close"
  ON public.forecast_positions_to_close
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage positions to close"
  ON public.forecast_positions_to_close
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Auto-update triggers
CREATE TRIGGER set_forecast_open_updated_at
  BEFORE UPDATE ON public.forecast_positions_to_open
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_forecast_close_updated_at
  BEFORE UPDATE ON public.forecast_positions_to_close
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed with mock data for positions to open
INSERT INTO public.forecast_positions_to_open (market, facility_id, facility_name, department_id, department_name, skill_type, reason_to_open, fte, status) VALUES
  ('Texas', '30049', 'Dell Seton', '10201', 'Emergency Department', 'Registered Nurse', 'Increased patient volume', 2.0, 'pending'),
  ('Texas', '30049', 'Dell Seton', '10205', 'ICU', 'Registered Nurse', 'Expansion project', 1.5, 'approved'),
  ('Florida', '40155', 'St. Vincent''s Riverside', '20301', 'Medical Surgical', 'Clinical Leader', 'Replacement hire', 1.0, 'pending'),
  ('Alabama', '50123', 'St. Vincent''s Birmingham', '30102', 'Orthopedics', 'PCT', 'New service line', 3.0, 'approved');

-- Seed with mock data for positions to close
INSERT INTO public.forecast_positions_to_close (market, facility_id, facility_name, department_id, department_name, skill_type, reason_to_close, fte, status) VALUES
  ('Texas', '30049', 'Dell Seton', '10210', 'Radiology', 'Radiology Tech', 'Low utilization', 1.0, 'pending'),
  ('Florida', '40155', 'St. Vincent''s Riverside', '20305', 'Laboratory', 'Lab Tech', 'Automation implementation', 2.0, 'approved'),
  ('Alabama', '50123', 'St. Vincent''s Birmingham', '30105', 'Pharmacy', 'Pharmacist', 'Service consolidation', 1.5, 'pending');