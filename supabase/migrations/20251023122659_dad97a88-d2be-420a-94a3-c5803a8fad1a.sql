-- Add actual_fte column to positions table
ALTER TABLE positions 
ADD COLUMN actual_fte numeric;

-- Initialize actual_fte with the same values as FTE for existing records
UPDATE positions 
SET actual_fte = "FTE" 
WHERE actual_fte IS NULL;

-- Enable UPDATE for positions table for authenticated users
CREATE POLICY "Authenticated users can update positions"
ON positions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);