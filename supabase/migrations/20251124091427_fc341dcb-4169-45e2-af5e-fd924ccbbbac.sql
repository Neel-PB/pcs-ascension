-- Fix function search path security warning
CREATE OR REPLACE FUNCTION update_volume_override_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS volume_override_config_updated_at ON volume_override_config;

CREATE TRIGGER volume_override_config_updated_at
  BEFORE UPDATE ON volume_override_config
  FOR EACH ROW
  EXECUTE FUNCTION update_volume_override_config_updated_at();