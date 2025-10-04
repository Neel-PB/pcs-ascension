-- Add 'labor_team' role to the app_role enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'labor_team');
  ELSE
    -- Add labor_team if it doesn't exist
    BEGIN
      ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'labor_team';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- Update the handle_new_user function to automatically assign labor_team role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );
  
  -- Automatically assign labor_team role to all new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'labor_team'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN new;
END;
$$;