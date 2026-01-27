-- Insert approval workflow permissions
INSERT INTO public.permissions (key, label, description, category, is_system) VALUES
  ('approvals.positions_to_open', 'Approve Positions to Open', 'Ability to approve or reject new position requests', 'approvals', true),
  ('approvals.positions_to_close', 'Approve Positions to Close', 'Ability to approve or reject position closure requests', 'approvals', true),
  ('approvals.volume_override', 'Approve Volume Overrides', 'Ability to create and modify volume overrides', 'approvals', true),
  ('approvals.np_override', 'Approve NP Overrides', 'Ability to create and modify NP overrides', 'approvals', true),
  ('approvals.feedback', 'Manage Feedback Status', 'Ability to approve, disregard, or backlog feedback items', 'approvals', true)
ON CONFLICT (key) DO NOTHING;

-- Set default role permissions for approvals
INSERT INTO public.role_permissions (role, permission_key, permission_value) VALUES
  -- Admin gets all approvals
  ('admin', 'approvals.positions_to_open', 'true'),
  ('admin', 'approvals.positions_to_close', 'true'),
  ('admin', 'approvals.volume_override', 'true'),
  ('admin', 'approvals.np_override', 'true'),
  ('admin', 'approvals.feedback', 'true'),
  -- Labor team gets all approvals
  ('labor_team', 'approvals.positions_to_open', 'true'),
  ('labor_team', 'approvals.positions_to_close', 'true'),
  ('labor_team', 'approvals.volume_override', 'true'),
  ('labor_team', 'approvals.np_override', 'true'),
  ('labor_team', 'approvals.feedback', 'true'),
  -- Leadership gets position approvals only
  ('leadership', 'approvals.positions_to_open', 'true'),
  ('leadership', 'approvals.positions_to_close', 'true'),
  -- CNO gets position approvals only
  ('cno', 'approvals.positions_to_open', 'true'),
  ('cno', 'approvals.positions_to_close', 'true'),
  -- Director gets position approvals for their scope
  ('director', 'approvals.positions_to_open', 'true'),
  ('director', 'approvals.positions_to_close', 'true')
ON CONFLICT (role, permission_key) DO NOTHING;