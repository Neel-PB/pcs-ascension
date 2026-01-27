-- Phase 1: Create permissions and roles tables for dynamic RBAC

-- 1. Create permissions table
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create roles table
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable RLS on both tables
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for permissions table
CREATE POLICY "Authenticated users can view permissions"
ON public.permissions FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage permissions"
ON public.permissions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. RLS policies for roles table
CREATE POLICY "Authenticated users can view roles"
ON public.roles FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage roles"
ON public.roles FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 6. Create updated_at triggers
CREATE TRIGGER update_permissions_updated_at
BEFORE UPDATE ON public.permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
BEFORE UPDATE ON public.roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Seed existing permissions from rbacConfig.ts
INSERT INTO public.permissions (key, label, description, category, is_system) VALUES
-- Modules
('admin.access', 'Admin Module', 'Access to admin panel', 'modules', true),
('feedback.access', 'Feedback Module', 'Access to feedback page', 'modules', true),
('staffing.access', 'Staffing', 'Access to staffing summary', 'modules', true),
('positions.access', 'Positions', 'Access to positions page', 'modules', true),
('analytics.access', 'Analytics', 'Access to analytics page', 'modules', true),
('reports.access', 'Reports', 'Access to reports page', 'modules', true),
('support.access', 'Support', 'Access to support page', 'modules', true),
-- Settings
('settings.volume_override', 'Volume Override Settings', 'Access to volume override configuration', 'settings', true),
('settings.np_override', 'NP Override Settings', 'Access to NP override configuration', 'settings', true),
-- Filters
('filters.region', 'Region Filter', 'Access to region filter', 'filters', true),
('filters.market', 'Market Filter', 'Access to market filter', 'filters', true),
('filters.facility', 'Facility Filter', 'Access to facility filter', 'filters', true),
('filters.department', 'Department Filter', 'Access to department filter', 'filters', true),
-- Subfilters
('filters.submarket', 'Submarket Filter', 'Access to submarket filter', 'subfilters', true),
('filters.level2', 'Level 2 Filter', 'Access to level 2 filter', 'subfilters', true),
('filters.pstat', 'PSTAT Filter', 'Access to PSTAT filter', 'subfilters', true);

-- 8. Seed existing roles from rbacConfig.ts (matching existing app_role enum values)
INSERT INTO public.roles (name, label, description, is_system, sort_order) VALUES
('admin', 'Admin', 'Full system access including all modules, settings, and permissions management', true, 1),
('labor_team', 'Labor Management', 'Full access to all modules, filters, and settings', true, 2),
('leadership', 'Leadership', 'Access to all filters and sub-filters, excluded from Admin, Feedback, and Settings', true, 3),
('cno', 'CNO', 'Chief Nursing Officer with configurable filter access, excluded from Admin, Feedback, and Settings', true, 4),
('director', 'Director', 'Facility and department level access only, no sub-filters, excluded from Admin, Feedback, and Settings', true, 5),
('manager', 'Manager', 'Department level access only, no sub-filters, excluded from Admin, Feedback, and Settings', true, 6),
('moderator', 'Moderator', 'Legacy role with administrative capabilities', true, 7),
('user', 'User', 'Basic user role with limited access', true, 8),
('nurse_manager', 'Nurse Manager (Legacy)', 'Legacy role - now mapped to Manager', true, 9);

-- 9. Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.permissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.roles;