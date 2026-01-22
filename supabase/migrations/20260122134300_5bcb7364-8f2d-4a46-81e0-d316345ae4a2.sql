-- Create table to store user's closure selections per department/facility/skill/shift
CREATE TABLE public.closure_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id TEXT NOT NULL,
  facility_id TEXT NOT NULL,
  skill_type TEXT NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('Day', 'Night')),
  employment_type TEXT NOT NULL CHECK (employment_type IN ('Full-Time', 'Part-Time', 'PRN')),
  selected_closure_ids TEXT[] DEFAULT '{}',
  selected_fte_sum NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(department_id, facility_id, skill_type, shift, employment_type)
);

-- Enable RLS
ALTER TABLE public.closure_selections ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view closure selections"
ON public.closure_selections FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert closure selections"
ON public.closure_selections FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update closure selections"
ON public.closure_selections FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete closure selections"
ON public.closure_selections FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_closure_selections_updated_at
BEFORE UPDATE ON public.closure_selections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();