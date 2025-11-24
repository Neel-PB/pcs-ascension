-- Phase 1: Create Volume Override Configuration Table
CREATE TABLE IF NOT EXISTS volume_override_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Rule thresholds (configurable by admin)
  min_months_for_target INTEGER NOT NULL DEFAULT 3,
  min_months_mandatory_override INTEGER NOT NULL DEFAULT 2,
  max_override_months_full_history INTEGER NOT NULL DEFAULT 12,
  
  -- Fiscal governance
  fiscal_year_end_month INTEGER NOT NULL DEFAULT 6,
  fiscal_year_end_day INTEGER NOT NULL DEFAULT 30,
  
  -- Backfill settings
  enable_backfill BOOLEAN NOT NULL DEFAULT true,
  backfill_lookback_months INTEGER NOT NULL DEFAULT 24,
  
  -- Volume thresholds
  min_volume_threshold NUMERIC DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Insert default configuration (only if table is empty)
INSERT INTO volume_override_config (
  min_months_for_target, 
  min_months_mandatory_override, 
  max_override_months_full_history,
  fiscal_year_end_month,
  fiscal_year_end_day
)
SELECT 3, 2, 12, 6, 30
WHERE NOT EXISTS (SELECT 1 FROM volume_override_config);

-- Enable RLS
ALTER TABLE volume_override_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage config" ON volume_override_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can view config" ON volume_override_config
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Add computed columns to volume_overrides table
ALTER TABLE volume_overrides
ADD COLUMN IF NOT EXISTS historical_months_count INTEGER,
ADD COLUMN IF NOT EXISTS target_volume NUMERIC,
ADD COLUMN IF NOT EXISTS override_mandatory BOOLEAN,
ADD COLUMN IF NOT EXISTS max_allowed_expiry_date DATE,
ADD COLUMN IF NOT EXISTS validation_status TEXT,
ADD COLUMN IF NOT EXISTS validation_message TEXT;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_volume_override_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER volume_override_config_updated_at
  BEFORE UPDATE ON volume_override_config
  FOR EACH ROW
  EXECUTE FUNCTION update_volume_override_config_updated_at();