import { Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useSEO } from "@/hooks/useSEO";
import { usePageBlocks } from "@/hooks/usePageBlocks";
import BlockRenderer from "@/components/blocks/BlockRenderer";

// Fallback static blocks for when DB is empty
const fallbackBlocks = [
  {
    id: "hero_1",
    type: "hero",
    data: {
      title: "Комплексные поставки трубопроводной арматуры",
      subtitle: "Регулирующие и отсечные клапаны, задвижки, запорная арматура для нефтегазовой и энергетической отрасли",
      cta_text: "Отправить запрос",
      cta_href: "/contacts",
    },
  },
  {
    id: "features_1",
    type: "features",
    data: {
      title: "Почему выбирают нас",
      subtitle: "Преимущества работы с ТД Импульс",
      columns: 4,
      features: [
        { icon: "Award", title: "Сертифицированная продукция", description: "Вся арматура соответствует ГОСТ, ТР ТС и международным стандартам" },
        { icon: "Truck", title: "Быстрая доставка", description: "Собственный склад и логистика. Доставка по России и СНГ" },
        { icon: "Shield", title: "Гарантия качества", description: "Полная техническая поддержка и гарантийное обслуживание" },
        { icon: "Users", title: "Индивидуальный подход", description: "Подбор оборудования под параметры вашего проекта" },
      ],
    },
  },
  {
    id: "cta_1",
    type: "cta",
    data: {
      title: "Нужна консультация?",
      subtitle: "Свяжитесь с нами для подбора оборудования под ваш проект",
      cta_text: "Связаться с нами",
      cta_href: "/contacts",
    },
  },
  {
    id: "news_1",
    type: "dynamic_news",
    data: {
      title: "Новости компании",
      subtitle: "Последние события и достижения ТД Импульс",
      count: 3,
    },
  },
];

const Index = () => {
  const { data: pageData, isLoading, error } = usePageBlocks("home_page");

  useSEO({
    title: pageData?.seo_title || "Трубопроводная арматура ООО ТДИ",
    description: pageData?.seo_description || "Комплексные поставки клапанов, задвижек и трубопроводной арматуры для нефтегазовой и энергетической отрасли",
    keywords: "трубопроводная арматура, клапаны, задвижки, регулирующая арматура, запорная арматура, ТДИ",
    canonical: "https://oootdi.ru/",
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Use DB blocks if available, otherwise use fallback
  const blocks = pageData?.blocks && pageData.blocks.length > 0 ? pageData.blocks : fallbackBlocks;

  return (
    <Layout>
      <BlockRenderer blocks={blocks} />
    </Layout>
  );
};

export default Index;
