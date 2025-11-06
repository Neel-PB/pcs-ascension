-- Add column to store selected employee position IDs for closure
ALTER TABLE forecast_positions_to_close 
ADD COLUMN selected_position_ids jsonb DEFAULT '[]'::jsonb;