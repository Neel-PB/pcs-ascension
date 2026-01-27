-- Create RBAC Audit Log table
CREATE TABLE public.rbac_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  target_name TEXT,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_rbac_audit_log_created_at ON public.rbac_audit_log(created_at DESC);
CREATE INDEX idx_rbac_audit_log_action_type ON public.rbac_audit_log(action_type);
CREATE INDEX idx_rbac_audit_log_target_type ON public.rbac_audit_log(target_type);
CREATE INDEX idx_rbac_audit_log_actor_id ON public.rbac_audit_log(actor_id);

-- Enable RLS
ALTER TABLE public.rbac_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view audit log
CREATE POLICY "Admins can view audit log"
ON public.rbac_audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- No INSERT/UPDATE/DELETE policies for users - only triggers can insert

-- Create trigger function for RBAC audit logging
CREATE OR REPLACE FUNCTION public.log_rbac_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action_type TEXT;
  v_target_type TEXT;
  v_target_id UUID;
  v_target_name TEXT;
  v_actor_id UUID;
  v_old_value JSONB;
  v_new_value JSONB;
BEGIN
  -- Get the current user (may be NULL if triggered by system)
  v_actor_id := auth.uid();
  
  -- Determine target type based on table
  v_target_type := TG_TABLE_NAME;
  
  -- Handle different operations
  IF TG_OP = 'INSERT' THEN
    v_old_value := NULL;
    v_new_value := to_jsonb(NEW);
    
    IF TG_TABLE_NAME = 'roles' THEN
      v_action_type := 'role_created';
      v_target_id := NEW.id;
      v_target_name := NEW.name;
    ELSIF TG_TABLE_NAME = 'permissions' THEN
      v_action_type := 'permission_created';
      v_target_id := NEW.id;
      v_target_name := NEW.key;
    ELSIF TG_TABLE_NAME = 'role_permissions' THEN
      v_action_type := 'permission_granted';
      v_target_id := NEW.id;
      v_target_name := NEW.role::TEXT || ':' || NEW.permission_key;
    END IF;
    
  ELSIF TG_OP = 'UPDATE' THEN
    v_old_value := to_jsonb(OLD);
    v_new_value := to_jsonb(NEW);
    
    IF TG_TABLE_NAME = 'roles' THEN
      v_action_type := 'role_updated';
      v_target_id := NEW.id;
      v_target_name := NEW.name;
    ELSIF TG_TABLE_NAME = 'permissions' THEN
      v_action_type := 'permission_updated';
      v_target_id := NEW.id;
      v_target_name := NEW.key;
    ELSIF TG_TABLE_NAME = 'role_permissions' THEN
      v_action_type := 'permission_changed';
      v_target_id := NEW.id;
      v_target_name := NEW.role::TEXT || ':' || NEW.permission_key;
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    v_old_value := to_jsonb(OLD);
    v_new_value := NULL;
    
    IF TG_TABLE_NAME = 'roles' THEN
      v_action_type := 'role_deleted';
      v_target_id := OLD.id;
      v_target_name := OLD.name;
    ELSIF TG_TABLE_NAME = 'permissions' THEN
      v_action_type := 'permission_deleted';
      v_target_id := OLD.id;
      v_target_name := OLD.key;
    ELSIF TG_TABLE_NAME = 'role_permissions' THEN
      v_action_type := 'permission_revoked';
      v_target_id := OLD.id;
      v_target_name := OLD.role::TEXT || ':' || OLD.permission_key;
    END IF;
  END IF;
  
  -- Insert audit log entry
  INSERT INTO public.rbac_audit_log (
    action_type,
    target_type,
    target_id,
    target_name,
    actor_id,
    old_value,
    new_value
  ) VALUES (
    v_action_type,
    v_target_type,
    v_target_id,
    v_target_name,
    v_actor_id,
    v_old_value,
    v_new_value
  );
  
  -- Return appropriate row
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Attach triggers to RBAC tables
CREATE TRIGGER audit_roles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.log_rbac_change();

CREATE TRIGGER audit_permissions_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.permissions
  FOR EACH ROW EXECUTE FUNCTION public.log_rbac_change();

CREATE TRIGGER audit_role_permissions_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.log_rbac_change();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.rbac_audit_log;