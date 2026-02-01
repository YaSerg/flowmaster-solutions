-- Create site_design table for storing header/footer configuration
CREATE TABLE public.site_design (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_design ENABLE ROW LEVEL SECURITY;

-- Anyone can view site design
CREATE POLICY "Anyone can view site design"
ON public.site_design
FOR SELECT
USING (true);

-- Only admins can update site design
CREATE POLICY "Admins can update site design"
ON public.site_design
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert site design
CREATE POLICY "Admins can insert site design"
ON public.site_design
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default header config
INSERT INTO public.site_design (id, data) VALUES (
  'header',
  '{
    "logo_url": "",
    "phone": "+7-996-613-88-52",
    "nav_items": [
      {"label": "Главная", "href": "/"},
      {"label": "О компании", "href": "/about"},
      {"label": "Продукция", "href": "/products"},
      {"label": "Проекты", "href": "/projects"},
      {"label": "Для поставщиков", "href": "/suppliers"},
      {"label": "Контакты", "href": "/contacts"}
    ],
    "cta_text": "Отправить запрос",
    "cta_href": "/contacts"
  }'::jsonb
);

-- Insert default footer config
INSERT INTO public.site_design (id, data) VALUES (
  'footer',
  '{
    "description": "Комплексные поставки и производство трубопроводной арматуры для нефтегазовой и энергетической отрасли.",
    "phone": "+7-996-613-88-52",
    "copyright": "ООО \"Торговый Дом Импульс\". Все права защищены.",
    "admin_link_text": "Вход для сотрудников",
    "contacts_title": "Контакты",
    "nav_title": "Навигация",
    "products_title": "Продукция"
  }'::jsonb
);