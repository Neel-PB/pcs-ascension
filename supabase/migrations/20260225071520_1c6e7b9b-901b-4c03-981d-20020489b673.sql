
-- Create faqs table
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- SELECT: all authenticated users
CREATE POLICY "Authenticated users can view faqs"
  ON public.faqs FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT: authenticated users (created_by = auth.uid())
CREATE POLICY "Authenticated users can insert faqs"
  ON public.faqs FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- UPDATE: creator or admin
CREATE POLICY "Creator or admin can update faqs"
  ON public.faqs FOR UPDATE
  USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

-- DELETE: creator or admin
CREATE POLICY "Creator or admin can delete faqs"
  ON public.faqs FOR DELETE
  USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
