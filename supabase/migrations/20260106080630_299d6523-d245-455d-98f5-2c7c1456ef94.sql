-- Create projects table for dynamic project management
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'oil',
  year TEXT NOT NULL DEFAULT '2024',
  description TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view projects
CREATE POLICY "Anyone can view projects" 
ON public.projects 
FOR SELECT 
USING (true);

-- Policy: Only admins can insert
CREATE POLICY "Admins can insert projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Only admins can update
CREATE POLICY "Admins can update projects" 
ON public.projects 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Only admins can delete
CREATE POLICY "Admins can delete projects" 
ON public.projects 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert initial 6 projects
INSERT INTO public.projects (title, category, year, description, details, seo_title, seo_description) VALUES
('НПЗ «Роснефть» Рязань', 'oil', '2024', 'Комплексная поставка регулирующей и запорной арматуры для установки каталитического крекинга. Более 500 единиц оборудования.', 'Поставка включала регулирующие клапаны с пневмоприводом, шаровые краны DN 50-300, предохранительные клапаны. Все оборудование прошло заводские испытания.', 'Проект НПЗ Роснефть — ООО ТДИ', 'Комплексная поставка арматуры для НПЗ Роснефть Рязань'),
('ТЭС «Энерго» Сургут', 'energy', '2024', 'Оснащение турбинного цеха запорной арматурой высокого давления для паропроводов.', 'Поставлены задвижки клиновые PN 250, клапаны регулирующие для пара до 540°C, обратные клапаны. Гарантийное обслуживание 3 года.', 'Проект ТЭС Энерго — ООО ТДИ', 'Оснащение турбинного цеха ТЭС Энерго'),
('Химический завод «Полимер»', 'chemical', '2023', 'Модернизация системы трубопроводов с полной заменой арматуры на производстве полипропилена.', 'Замена устаревшей арматуры на современные аналоги из нержавеющей стали. Шаровые краны, дисковые затворы, регулирующие клапаны.', 'Проект завод Полимер — ООО ТДИ', 'Модернизация системы трубопроводов завода Полимер'),
('Газпром нефть — ОНПЗ', 'oil', '2023', 'Поставка арматуры для установки первичной переработки нефти.', 'Клапаны регулирующие для нефтепродуктов, задвижки клиновые, шаровые краны с огнестойким исполнением.', 'Проект ОНПЗ Газпром нефть — ООО ТДИ', 'Поставка арматуры для ОНПЗ Газпром нефть'),
('Красноярская ГЭС', 'energy', '2022', 'Замена арматуры на водоводах и системе охлаждения гидрогенераторов.', 'Дисковые затворы большого диаметра DN 1000-1200, обратные клапаны, задвижки для технической воды.', 'Проект Красноярская ГЭС — ООО ТДИ', 'Замена арматуры Красноярской ГЭС'),
('Нижнекамскнефтехим', 'chemical', '2022', 'Комплексная поставка арматуры для производства этилена и пропилена.', 'Криогенные клапаны для низких температур, регулирующая арматура для агрессивных сред, предохранительные клапаны.', 'Проект Нижнекамскнефтехим — ООО ТДИ', 'Поставка арматуры для Нижнекамскнефтехим');