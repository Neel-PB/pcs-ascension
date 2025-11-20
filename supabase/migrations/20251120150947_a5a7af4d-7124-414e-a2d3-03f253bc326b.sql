-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.create_notifications_for_message()
RETURNS TRIGGER AS $$
DECLARE
  target_user RECORD;
BEGIN
  -- Loop through all users who match the target roles
  FOR target_user IN 
    SELECT DISTINCT u.id
    FROM auth.users u
    INNER JOIN public.user_roles ur ON ur.user_id = u.id
    WHERE 
      -- If 'all' is in target_roles, send to everyone
      'all' = ANY(NEW.target_roles)
      OR
      -- Otherwise check if user has any of the target roles
      ur.role::text = ANY(NEW.target_roles)
  LOOP
    -- Create a notification for each target user
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      read,
      created_at
    ) VALUES (
      target_user.id,
      'message',
      NEW.title,
      NEW.message,
      false,
      NOW()
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;