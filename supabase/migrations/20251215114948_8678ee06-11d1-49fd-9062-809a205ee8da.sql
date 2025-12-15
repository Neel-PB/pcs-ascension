-- Add location columns and is_global flag to volume_override_config table
ALTER TABLE public.volume_override_config
ADD COLUMN market TEXT,
ADD COLUMN facility_id TEXT,
ADD COLUMN facility_name TEXT,
ADD COLUMN department_id TEXT,
ADD COLUMN department_name TEXT,
ADD COLUMN is_global BOOLEAN DEFAULT TRUE;

-- Update existing global config row(s) to have is_global = TRUE
UPDATE public.volume_override_config SET is_global = TRUE WHERE is_global IS NULL;

-- Create unique constraint for department-specific configs
CREATE UNIQUE INDEX idx_volume_override_config_department 
ON public.volume_override_config (market, facility_id, department_id) 
WHERE is_global = FALSE;

-- Add comment for documentation
COMMENT ON COLUMN public.volume_override_config.is_global IS 'TRUE for universal/global config, FALSE for department-specific overrides';