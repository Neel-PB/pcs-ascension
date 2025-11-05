-- Fix user_roles table to allow multiple roles per user
-- Drop the incorrect unique constraint that only allows one role per user
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_unique;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_key;

-- Add the correct unique constraint on (user_id, role) combination
-- This allows multiple roles per user, but prevents duplicate role assignments
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_roles_user_id_role_unique'
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_unique UNIQUE (user_id, role);
  END IF;
END $$;