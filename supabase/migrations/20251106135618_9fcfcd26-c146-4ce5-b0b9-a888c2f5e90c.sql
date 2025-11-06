-- Add parent_id and is_gap_record columns to forecast_positions_to_open
ALTER TABLE forecast_positions_to_open 
ADD COLUMN parent_id uuid REFERENCES forecast_positions_to_open(id) ON DELETE CASCADE,
ADD COLUMN is_gap_record boolean DEFAULT true;

-- Add index for performance
CREATE INDEX idx_forecast_positions_parent_id ON forecast_positions_to_open(parent_id);

-- Add parent_id and is_gap_record columns to forecast_positions_to_close
ALTER TABLE forecast_positions_to_close 
ADD COLUMN parent_id uuid REFERENCES forecast_positions_to_close(id) ON DELETE CASCADE,
ADD COLUMN is_gap_record boolean DEFAULT true;

-- Add index for performance
CREATE INDEX idx_forecast_positions_close_parent_id ON forecast_positions_to_close(parent_id);