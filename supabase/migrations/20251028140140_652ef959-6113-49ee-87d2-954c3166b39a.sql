-- Add job_title column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS job_title text;

-- Create table to track user organizational access
CREATE TABLE IF NOT EXISTS public.user_organization_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  market text,
  facility_id text,
  facility_name text,
  department_id text,
  department_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, market, facility_id, department_id)
);

-- Enable RLS
ALTER TABLE public.user_organization_access ENABLE ROW LEVEL SECURITY;

-- Users can view their own organizational access
CREATE POLICY "Users can view their own org access"
  ON public.user_organization_access
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all organizational access
CREATE POLICY "Admins can manage org access"
  ON public.user_organization_access
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Auto-update trigger
CREATE TRIGGER set_user_org_access_updated_at
  BEFORE UPDATE ON public.user_organization_access
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();