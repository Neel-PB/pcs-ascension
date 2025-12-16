-- Add spread_threshold column to volume_override_config table
ALTER TABLE volume_override_config 
ADD COLUMN spread_threshold numeric NOT NULL DEFAULT 15;

COMMENT ON COLUMN volume_override_config.spread_threshold IS 
'Maximum allowed percentage difference between 3-month low average and N-month average. If exceeded, falls back to N-month average.';