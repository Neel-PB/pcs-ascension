-- Add region column to user_organization_access table
ALTER TABLE user_organization_access 
ADD COLUMN region text;