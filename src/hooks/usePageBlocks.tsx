import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageBlocks, BlockData } from "@/components/blocks/BlockRenderer";

const defaultPages: Record<string, PageBlocks> = {
  home_page: {
    blocks: [],
    seo_title: "Трубопроводная арматура ООО ТДИ",
    seo_description: "Комплексные поставки клапанов, задвижек и трубопроводной арматуры для нефтегазовой и энергетической отрасли",
  },
  about_page: {
    blocks: [],
    seo_title: "О компании ООО ТДИ",
    seo_description: "ООО Торговый Дом Импульс — надежный партнер в сфере комплексных поставок трубопроводной арматуры",
  },
  suppliers_page: {
    blocks: [],
    seo_title: "Стать партнером ООО ТДИ",
    seo_description: "Приглашаем производителей и поставщиков трубопроводной арматуры к взаимовыгодному сотрудничеству",
  },
  contacts_page: {
    blocks: [],
    seo_title: "Контакты ООО ТДИ",
    seo_description: "Свяжитесь с ООО Торговый Дом Импульс для консультации или отправьте запрос на поставку",
  },
};

export const usePageBlocks = (pageId: string) => {
  return useQuery({
    queryKey: ["page-blocks", pageId],
    queryFn: async (): Promise<PageBlocks> => {
      const { data, error } = await (supabase as any)
        .from("site_design")
        .select("data")
        .eq("id", pageId)
        .maybeSingle();

      if (error) throw error;
      
      if (data?.data) {
        const pageData = data.data as PageBlocks;
        return {
          blocks: pageData.blocks || [],
          seo_title: pageData.seo_title || defaultPages[pageId]?.seo_title,
          seo_description: pageData.seo_description || defaultPages[pageId]?.seo_description,
        };
      }
      
      return defaultPages[pageId] || { blocks: [], seo_title: "", seo_description: "" };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const savePageBlocks = async (pageId: string, pageData: PageBlocks) => {
  const { error } = await (supabase as any)
    .from("site_design")
    .upsert({
      id: pageId,
      data: pageData,
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;
};
