-- Create project_categories table for project categories management
CREATE TABLE public.project_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view categories
CREATE POLICY "Anyone can view project categories"
ON public.project_categories
FOR SELECT
USING (true);

-- Only admins can insert categories
CREATE POLICY "Admins can insert project categories"
ON public.project_categories
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update categories
CREATE POLICY "Admins can update project categories"
ON public.project_categories
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete categories
CREATE POLICY "Admins can delete project categories"
ON public.project_categories
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default categories
INSERT INTO public.project_categories (name, slug) VALUES
  ('Нефтегазовая отрасль', 'oil'),
  ('Энергетика', 'energy'),
  ('Химическая промышленность', 'chemical');