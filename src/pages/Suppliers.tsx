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
      title: "Для поставщиков",
      subtitle: "Приглашаем производителей и поставщиков трубопроводной арматуры к взаимовыгодному сотрудничеству",
    },
  },
  {
    id: "features_1",
    type: "features",
    data: {
      title: "Преимущества сотрудничества",
      subtitle: "Почему производители и поставщики выбирают работу с нами",
      columns: 4,
      features: [
        { icon: "Handshake", title: "Долгосрочное партнерство", description: "Стабильные заказы и прозрачные условия сотрудничества" },
        { icon: "TrendingUp", title: "Рост вашего бизнеса", description: "Доступ к крупным промышленным заказчикам через нашу сеть" },
        { icon: "FileText", title: "Простое оформление", description: "Минимум бюрократии, быстрое согласование договоров" },
        { icon: "Shield", title: "Надежные выплаты", description: "Своевременная оплата по договорам без задержек" },
      ],
    },
  },
  {
    id: "numbered_cards_1",
    type: "numbered_cards",
    data: {
      title: "Формы сотрудничества",
      columns: 3,
      cards: [
        { title: "Производители арматуры", description: "Приглашаем заводы-изготовители к сотрудничеству по прямым поставкам продукции для наших заказчиков" },
        { title: "Дистрибьюторы и дилеры", description: "Рассматриваем предложения от компаний с собственными складскими запасами арматуры" },
        { title: "Импортеры оборудования", description: "Заинтересованы в поставках зарубежной арматуры ведущих мировых производителей" },
      ],
    },
  },
  {
    id: "checklist_1",
    type: "checklist",
    data: {
      title: "Требования к поставщикам",
      subtitle: "Для начала сотрудничества мы ожидаем от партнеров соответствие следующим критериям:",
      items: [
        "Наличие сертификатов качества на продукцию (ГОСТ, ТР ТС)",
        "Опыт работы в сфере производства или поставки арматуры",
        "Готовность к заключению долгосрочных контрактов",
        "Конкурентоспособные цены и сроки поставки",
        "Техническая документация на предлагаемую продукцию",
      ],
      sidebar: {
        title: "Станьте нашим партнером",
        content: "<p>Отправьте коммерческое предложение с описанием вашей продукции, прайс-листом и контактными данными через форму обратной связи. Мы рассмотрим заявку в течение 3 рабочих дней.</p><p><strong>Телефон:</strong> +7-996-613-88-52</p>",
        cta_text: "Отправить заявку",
        cta_href: "/contacts",
      },
    },
  },
  {
    id: "steps_1",
    type: "steps",
    data: {
      title: "Как начать сотрудничество",
      steps: [
        { title: "Заявка", description: "Отправьте коммерческое предложение" },
        { title: "Анализ", description: "Оценка предложения нашими экспертами" },
        { title: "Переговоры", description: "Согласование условий сотрудничества" },
        { title: "Договор", description: "Заключение контракта и начало работы" },
      ],
    },
  },
];

const Suppliers = () => {
  const { data: pageData, isLoading } = usePageBlocks("suppliers_page");

  useSEO({
    title: pageData?.seo_title || "Стать партнером ООО ТДИ",
    description: pageData?.seo_description || "Приглашаем производителей и поставщиков трубопроводной арматуры к взаимовыгодному сотрудничеству с ООО Торговый Дом Импульс",
    keywords: "партнерство ТДИ, поставщики арматуры, сотрудничество, производители клапанов",
    canonical: "https://oootdi.ru/suppliers",
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

export default Suppliers;
