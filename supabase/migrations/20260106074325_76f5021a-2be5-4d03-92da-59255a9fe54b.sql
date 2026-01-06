-- Create company_info table for page content management
CREATE TABLE public.company_info (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT,
  seo_title TEXT,
  seo_description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read
CREATE POLICY "Anyone can view company_info" 
ON public.company_info 
FOR SELECT 
USING (true);

-- Policy: Only admins can update
CREATE POLICY "Admins can update company_info" 
ON public.company_info 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert initial records for Home (ID 1) and About (ID 2)
INSERT INTO public.company_info (id, title, subtitle, content, seo_title, seo_description) VALUES
(1, 'Трубопроводная арматура для промышленности', 'Комплексные поставки и производство клапанов, задвижек и другой трубопроводной арматуры для нефтегазовой и энергетической отрасли', '<p>ООО «Торговый Дом Импульс» — ваш надежный партнер в сфере поставок трубопроводной арматуры.</p>', 'Трубопроводная арматура ООО ТДИ', 'ООО Торговый Дом Импульс — комплексные поставки трубопроводной арматуры'),
(2, 'О компании', 'ООО «Торговый Дом Импульс» — надежный партнер в сфере комплексных поставок трубопроводной арматуры для промышленных предприятий России и СНГ', '<p>Компания «Торговый Дом Импульс» была основана в 2021 году.</p>', 'О компании ООО ТДИ', 'ООО Торговый Дом Импульс — надежный партнер с 2021 года');