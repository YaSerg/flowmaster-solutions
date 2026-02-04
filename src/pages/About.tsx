import { Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useSEO } from "@/hooks/useSEO";
import { usePageBlocks } from "@/hooks/usePageBlocks";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import heroImage from "@/assets/hero-valve.jpg";

// Fallback static blocks for when DB is empty
const fallbackBlocks = [
  {
    id: "hero_1",
    type: "hero",
    data: {
      title: "О компании",
      subtitle: "ООО «Торговый Дом Импульс» — надежный партнер в сфере комплексных поставок трубопроводной арматуры для промышленных предприятий России и СНГ",
    },
  },
  {
    id: "image_text_1",
    type: "image_text",
    data: {
      title: "На рынке промышленного оборудования с 2021 года",
      content: `<p>Компания «Торговый Дом Импульс» была основана в 2021 году и за это время 
        зарекомендовала себя как надежный поставщик трубопроводной арматуры для 
        предприятий нефтегазовой, энергетической и химической промышленности.</p>
        <p>Мы осуществляем поставки регулирующих, отсечных, запорных клапанов, 
        а также специальной арматуры для работы в сложных условиях эксплуатации. 
        Наша продукция соответствует требованиям ГОСТ, ТР ТС и международных стандартов.</p>
        <p>Собственный склад в Московской области и развитая логистическая сеть 
        позволяют оперативно доставлять продукцию во все регионы России и СНГ.</p>`,
      image_url: heroImage,
      image_alt: "Промышленное оборудование",
      stats: [
        { value: "500+", label: "Успешных проектов" },
        { value: "200+", label: "Постоянных клиентов" },
      ],
      badge: { value: "с 2021", label: "года на рынке" },
    },
  },
  {
    id: "features_1",
    type: "features",
    data: {
      title: "Наши ценности",
      subtitle: "Принципы, которые лежат в основе нашей работы",
      columns: 4,
      features: [
        { icon: "Award", title: "Качество", description: "Мы поставляем только сертифицированную продукцию, прошедшую многоступенчатый контроль качества" },
        { icon: "Users", title: "Клиентоориентированность", description: "Индивидуальный подход к каждому клиенту и гибкие условия сотрудничества" },
        { icon: "Globe", title: "Надежность", description: "Выполняем обязательства в срок и несем ответственность за каждую поставку" },
        { icon: "Building2", title: "Профессионализм", description: "Команда опытных инженеров и менеджеров с глубоким знанием отрасли" },
      ],
    },
  },
  {
    id: "timeline_1",
    type: "timeline",
    data: {
      title: "История развития",
      milestones: [
        { year: "2021", title: "Основание компании", description: "Начало работы в сфере поставок промышленной арматуры" },
        { year: "2022", title: "Первый крупный контракт", description: "Поставка оборудования для нефтеперерабатывающего завода" },
        { year: "2023", title: "Расширение ассортимента", description: "Добавление новых линеек регулирующей арматуры" },
        { year: "2024", title: "Новый этап развития", description: "Модернизация склада и расширение ассортимента" },
      ],
    },
  },
  {
    id: "cta_1",
    type: "cta",
    data: {
      title: "Готовы к сотрудничеству?",
      subtitle: "Свяжитесь с нами для обсуждения условий поставки",
      cta_text: "Связаться с нами",
      cta_href: "/contacts",
    },
  },
];

const About = () => {
  const { data: pageData, isLoading } = usePageBlocks("about_page");

  useSEO({
    title: pageData?.seo_title || "О компании ООО ТДИ",
    description: pageData?.seo_description || "ООО Торговый Дом Импульс — надежный партнер в сфере комплексных поставок трубопроводной арматуры",
    keywords: "о компании ТДИ, Торговый Дом Импульс, поставки арматуры, промышленное оборудование",
    canonical: "https://oootdi.ru/about",
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

export default About;
