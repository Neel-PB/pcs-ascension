-- Add new roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'leadership';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'cno';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'director';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'nurse_manager';

-- Create messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  target_roles text[] NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all messages
CREATE POLICY "Admins can view all messages"
  ON public.messages FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Only admins can send messages
CREATE POLICY "Only admins can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = sender_id);

-- Create message distribution function
CREATE OR REPLACE FUNCTION public.distribute_message_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  sender_name text;
BEGIN
  -- Get sender's name
  SELECT COALESCE(first_name || ' ' || last_name, 'Administrator')
  INTO sender_name
  FROM public.profiles
  WHERE id = NEW.sender_id;

  -- If 'all' is in target_roles, send to everyone
  IF 'all' = ANY(NEW.target_roles) THEN
    FOR target_user_id IN 
      SELECT id FROM public.profiles WHERE id != NEW.sender_id
    LOOP
      INSERT INTO public.notifications (user_id, type, title, message, link)
      VALUES (
        target_user_id,
        'message',
        sender_name || ': ' || NEW.title,
        NEW.message,
        '/'
      );
    END LOOP;
  ELSE
    -- Send to users with matching roles
    FOR target_user_id IN 
      SELECT DISTINCT ur.user_id 
      FROM public.user_roles ur
      WHERE ur.role::text = ANY(NEW.target_roles)
        AND ur.user_id != NEW.sender_id
    LOOP
      INSERT INTO public.notifications (user_id, type, title, message, link)
      VALUES (
        target_user_id,
        'message',
        sender_name || ': ' || NEW.title,
        NEW.message,
        '/'
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.distribute_message_notifications();