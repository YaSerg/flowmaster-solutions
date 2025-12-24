-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  attachment_url TEXT,
  attachment_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for leads: only admins can read and delete
CREATE POLICY "Admins can view all leads" 
ON public.leads 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads" 
ON public.leads 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can insert leads (public form submission)
CREATE POLICY "Anyone can submit leads" 
ON public.leads 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- RLS policies for user_roles: only admins can view
CREATE POLICY "Admins can view user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create attachments storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('attachments', 'attachments', true, 10485760);

-- Storage policies for attachments
CREATE POLICY "Anyone can upload attachments"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'attachments');

CREATE POLICY "Anyone can view attachments"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'attachments');

CREATE POLICY "Admins can delete attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'attachments' AND public.has_role(auth.uid(), 'admin'));