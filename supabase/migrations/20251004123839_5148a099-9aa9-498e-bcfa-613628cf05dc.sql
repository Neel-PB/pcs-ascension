-- Create a function to validate email domains
CREATE OR REPLACE FUNCTION public.validate_email_domain()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if email ends with allowed domains
  IF NEW.email !~* '@(ascension\.org|ascension-external\.org|particleblack\.com)$' THEN
    RAISE EXCEPTION 'Sign-up is restricted to @ascension.org, @ascension-external.org, or @particleblack.com email addresses only';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to validate email domain on user creation
DROP TRIGGER IF EXISTS validate_user_email_domain ON auth.users;
CREATE TRIGGER validate_user_email_domain
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_email_domain();