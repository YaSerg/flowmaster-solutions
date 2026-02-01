import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  label: string;
  href: string;
}

export interface HeaderData {
  logo_url: string;
  phone: string;
  nav_items: NavItem[];
  cta_text: string;
  cta_href: string;
}

export interface FooterData {
  description: string;
  phone: string;
  copyright: string;
  admin_link_text: string;
  contacts_title: string;
  nav_title: string;
  products_title: string;
}

const defaultHeader: HeaderData = {
  logo_url: "",
  phone: "+7-996-613-88-52",
  nav_items: [
    { label: "Главная", href: "/" },
    { label: "О компании", href: "/about" },
    { label: "Продукция", href: "/products" },
    { label: "Проекты", href: "/projects" },
    { label: "Для поставщиков", href: "/suppliers" },
    { label: "Контакты", href: "/contacts" },
  ],
  cta_text: "Отправить запрос",
  cta_href: "/contacts",
};

const defaultFooter: FooterData = {
  description: "Комплексные поставки и производство трубопроводной арматуры для нефтегазовой и энергетической отрасли.",
  phone: "+7-996-613-88-52",
  copyright: 'ООО "Торговый Дом Импульс". Все права защищены.',
  admin_link_text: "Вход для сотрудников",
  contacts_title: "Контакты",
  nav_title: "Навигация",
  products_title: "Продукция",
};

export const useHeaderData = () => {
  return useQuery({
    queryKey: ["site-design", "header"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("site_design")
        .select("data")
        .eq("id", "header")
        .maybeSingle();

      if (error) throw error;
      
      if (data?.data) {
        return { ...defaultHeader, ...data.data } as HeaderData;
      }
      
      return defaultHeader;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useFooterData = () => {
  return useQuery({
    queryKey: ["site-design", "footer"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("site_design")
        .select("data")
        .eq("id", "footer")
        .maybeSingle();

      if (error) throw error;
      
      if (data?.data) {
        return { ...defaultFooter, ...data.data } as FooterData;
      }
      
      return defaultFooter;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useProductCategories = () => {
  return useQuery({
    queryKey: ["product-categories-footer"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_categories")
        .select("id, name, slug")
        .order("name");

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
