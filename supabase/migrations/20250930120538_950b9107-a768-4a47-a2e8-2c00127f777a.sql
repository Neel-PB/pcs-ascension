-- Create core reference tables
CREATE TABLE public.markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id text NOT NULL,
  facility_name text NOT NULL,
  market text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(facility_id, market)
);

CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id text NOT NULL,
  department_name text NOT NULL,
  facility_id text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(department_id, facility_id)
);

-- Create staffing_standards table (End_user_grid data - 37 columns)
CREATE TABLE public.staffing_standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market text NOT NULL,
  facility_id text NOT NULL,
  facility_name text NOT NULL,
  department_id text NOT NULL,
  department_name text NOT NULL,
  alos numeric,
  cmindex numeric,
  admissions numeric,
  patient_days numeric,
  adjusted_patient_days numeric,
  total_worked_productive_hppd numeric,
  total_worked_productive_hours numeric,
  total_worked_productive_fte numeric,
  direct_patient_care_hppd numeric,
  direct_patient_care_hours numeric,
  direct_patient_care_fte numeric,
  indirect_patient_care_hppd numeric,
  indirect_patient_care_hours numeric,
  indirect_patient_care_fte numeric,
  overhead_hppd numeric,
  overhead_hours numeric,
  overhead_fte numeric,
  contracted_registry_hppd numeric,
  contracted_registry_hours numeric,
  contracted_registry_fte numeric,
  total_worked_hppd numeric,
  total_worked_hours numeric,
  total_worked_fte numeric,
  non_productive_hours numeric,
  non_productive_fte numeric,
  total_hppd numeric,
  total_hours numeric,
  total_fte numeric,
  manager_fte numeric,
  educator_fte numeric,
  charge_nurse_fte numeric,
  rn_fte numeric,
  lvn_fte numeric,
  cna_fte numeric,
  clerk_fte numeric,
  other_fte numeric,
  additional_data_1 text,
  additional_data_2 text,
  additional_data_3 text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create labor_performance table (LaborUos data - 10 columns)
CREATE TABLE public.labor_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market text NOT NULL,
  facility_id text NOT NULL,
  facility_name text NOT NULL,
  department_id text NOT NULL,
  department_name text NOT NULL,
  volume numeric,
  manhours numeric,
  labor_hours_per_uos numeric,
  month timestamp with time zone,
  actual_fte numeric,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create positions table (Positions data - 24 columns)
CREATE TABLE public.positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market text NOT NULL,
  facility_id text NOT NULL,
  facility_name text NOT NULL,
  department_id text NOT NULL,
  department_name text NOT NULL,
  position_control_id text,
  employee_name text,
  employee_id text,
  employment_status text,
  regular_temporary text,
  full_part_time text,
  union_non_union text,
  job_code text,
  job_title text,
  flsa_code text,
  pay_type text,
  home_cost_center_id text,
  home_cost_center text,
  people_manager_name text,
  people_manager_id text,
  original_hire_date date,
  adjusted_hire_date date,
  termination_date date,
  status text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes for performance on common join fields
CREATE INDEX idx_staffing_standards_keys ON public.staffing_standards(market, facility_id, department_id);
CREATE INDEX idx_labor_performance_keys ON public.labor_performance(market, facility_id, department_id);
CREATE INDEX idx_labor_performance_month ON public.labor_performance(month);
CREATE INDEX idx_positions_keys ON public.positions(market, facility_id, department_id);
CREATE INDEX idx_positions_employee ON public.positions(employee_id);
CREATE INDEX idx_facilities_lookup ON public.facilities(facility_id, market);
CREATE INDEX idx_departments_lookup ON public.departments(department_id, facility_id);

-- Enable Row Level Security
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staffing_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labor_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (viewable by authenticated users)
CREATE POLICY "Markets are viewable by authenticated users" ON public.markets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Facilities are viewable by authenticated users" ON public.facilities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Departments are viewable by authenticated users" ON public.departments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staffing standards are viewable by authenticated users" ON public.staffing_standards
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Labor performance is viewable by authenticated users" ON public.labor_performance
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Positions are viewable by authenticated users" ON public.positions
  FOR SELECT TO authenticated USING (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_staffing_standards_updated_at
  BEFORE UPDATE ON public.staffing_standards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_labor_performance_updated_at
  BEFORE UPDATE ON public.labor_performance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON public.positions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();