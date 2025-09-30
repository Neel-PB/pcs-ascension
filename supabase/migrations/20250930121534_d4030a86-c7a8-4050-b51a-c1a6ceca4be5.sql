-- Drop existing tables with incorrect column names
DROP TABLE IF EXISTS public.staffing_standards CASCADE;
DROP TABLE IF EXISTS public.labor_performance CASCADE;
DROP TABLE IF EXISTS public.positions CASCADE;

-- Create staffing_standards table with exact Excel column names
CREATE TABLE public.staffing_standards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market TEXT NOT NULL,
  "facilityId" TEXT NOT NULL,
  "facilityName" TEXT NOT NULL,
  "departmentId" TEXT NOT NULL,
  "departmentName" TEXT NOT NULL,
  "Patients" NUMERIC,
  "CL-Day" NUMERIC,
  "RN-Day" NUMERIC,
  "PCT-Day" NUMERIC,
  "Clerk-Day" NUMERIC,
  "CL-Night" NUMERIC,
  "RN-Night" NUMERIC,
  "PCT-Night" NUMERIC,
  "Clerk-Night" NUMERIC,
  "Frequency" TEXT,
  "% Census" NUMERIC,
  "CL Day total hours" NUMERIC,
  "RN Day total hours" NUMERIC,
  "PCT Day total hours" NUMERIC,
  "Clerk Day total hours" NUMERIC,
  "CL Night total hours" NUMERIC,
  "RN Night total hours" NUMERIC,
  "PCT Night total hours" NUMERIC,
  "Clerk Night total hours" NUMERIC,
  "Variable Hrs Per UoS" NUMERIC,
  "Fixed Hrs Per UoS" NUMERIC,
  "CL : PT" TEXT,
  "RN : PT" TEXT,
  "Director" NUMERIC,
  "Manager" NUMERIC,
  "ANM" NUMERIC,
  "Practice Specialist" NUMERIC,
  "Ops Coordinator" NUMERIC,
  "1:1 / Other" NUMERIC,
  "Total Overhead Hours" NUMERIC,
  "Column1" TEXT,
  "Column2" TEXT,
  "Column3" TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create labor_performance table with exact Excel column names
CREATE TABLE public.labor_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  market TEXT NOT NULL,
  "facilityId" TEXT NOT NULL,
  "facilityName" TEXT NOT NULL,
  "departmentId" TEXT NOT NULL,
  "departmentName" TEXT NOT NULL,
  volume NUMERIC,
  manhours NUMERIC,
  "laborHoursPerUoS" NUMERIC,
  month TIMESTAMP WITH TIME ZONE,
  actual_fte NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create positions table with exact Excel column names
CREATE TABLE public.positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "positionLifecycle" TEXT,
  "employmentFlag" TEXT,
  "positionStatus" TEXT,
  "positionStatusDate" DATE,
  market TEXT NOT NULL,
  "positionNum" TEXT,
  "facilityId" TEXT NOT NULL,
  "facilityName" TEXT NOT NULL,
  "departmentId" TEXT NOT NULL,
  "departmentName" TEXT NOT NULL,
  "employeeType" TEXT,
  "employmentType" TEXT,
  shift TEXT,
  jobcode TEXT,
  "jobFamily" TEXT,
  "jobTitle" TEXT,
  "FTE" NUMERIC,
  "standardHours" NUMERIC,
  "payrollStatus" TEXT,
  "employeeName" TEXT,
  "employeeId" TEXT,
  "managerPositionNum" TEXT,
  "managerEmployeeId" TEXT,
  "managerName" TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.staffing_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labor_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- Create policies for staffing_standards
CREATE POLICY "Staffing standards are viewable by authenticated users" 
ON public.staffing_standards 
FOR SELECT 
USING (true);

-- Create policies for labor_performance
CREATE POLICY "Labor performance is viewable by authenticated users" 
ON public.labor_performance 
FOR SELECT 
USING (true);

-- Create policies for positions
CREATE POLICY "Positions are viewable by authenticated users" 
ON public.positions 
FOR SELECT 
USING (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_staffing_standards_updated_at
BEFORE UPDATE ON public.staffing_standards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_labor_performance_updated_at
BEFORE UPDATE ON public.labor_performance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_positions_updated_at
BEFORE UPDATE ON public.positions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();