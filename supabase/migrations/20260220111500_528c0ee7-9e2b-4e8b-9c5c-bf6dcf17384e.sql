ALTER TABLE public.profiles
  ADD COLUMN onboarding_completed boolean DEFAULT false;

-- Mark all existing users as completed so they don't get re-toured
UPDATE public.profiles SET onboarding_completed = true;