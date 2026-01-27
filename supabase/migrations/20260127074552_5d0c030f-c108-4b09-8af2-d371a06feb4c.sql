-- Add is_nursing column to departments table
-- Nursing departments are the default (true), non-nursing departments will be set to false
ALTER TABLE public.departments 
ADD COLUMN is_nursing BOOLEAN DEFAULT true;