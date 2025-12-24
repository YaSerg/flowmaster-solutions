import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Handshake, FileText, TrendingUp, Shield } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useSEO } from "@/hooks/useSEO";

const benefits = [
  {
    icon: Handshake,
    title: "Долгосрочное партнерство",
    description: "Стабильные заказы и прозрачные условия сотрудничества",
  },
  {
    icon: TrendingUp,
    title: "Рост вашего бизнеса",
    description: "Доступ к крупным промышленным заказчикам через нашу сеть",
  },
  {
    icon: FileText,
    title: "Простое оформление",
    description: "Минимум бюрократии, быстрое согласование договоров",
  },
  {
    icon: Shield,
    title: "Надежные выплаты",
    description: "Своевременная оплата по договорам без задержек",
  },
];

const requirements = [
  "Наличие сертификатов качества на продукцию (ГОСТ, ТР ТС)",
  "Опыт работы в сфере производства или поставки арматуры",
  "Готовность к заключению долгосрочных контрактов",
  "Конкурентоспособные цены и сроки поставки",
  "Техническая документация на предлагаемую продукцию",
];

const cooperationTypes = [
  {
    title: "Производители арматуры",
    description: "Приглашаем заводы-изготовители к сотрудничеству по прямым поставкам продукции для наших заказчиков",
  },
  {
    title: "Дистрибьюторы и дилеры",
    description: "Рассматриваем предложения от компаний с собственными складскими запасами арматуры",
  },
  {
    title: "Импортеры оборудования",
    description: "Заинтересованы в поставках зарубежной арматуры ведущих мировых производителей",
  },
];

const Suppliers = () => {
  useSEO({
    title: "Стать партнером ООО ТДИ",
    description: "Приглашаем производителей и поставщиков трубопроводной арматуры к взаимовыгодному сотрудничеству с ООО Торговый Дом Импульс",
    keywords: "партнерство ТДИ, поставщики арматуры, сотрудничество, производители клапанов",
    canonical: "https://oootdi.ru/suppliers",
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-gradient-hero">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
              Для поставщиков
            </h1>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              Приглашаем производителей и поставщиков трубопроводной арматуры 
              к взаимовыгодному сотрудничеству
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Преимущества сотрудничества
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Почему производители и поставщики выбирают работу с нами
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="p-6 rounded-xl bg-card border border-border hover:shadow-hover transition-all">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cooperation Types */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Формы сотрудничества
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cooperationTypes.map((type, index) => (
              <div key={index} className="p-8 rounded-xl bg-card shadow-card">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                  {type.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {type.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                Требования к поставщикам
              </h2>
              <p className="text-muted-foreground mb-8">
                Для начала сотрудничества мы ожидаем от партнеров соответствие 
                следующим критериям:
              </p>
              <ul className="space-y-4">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-secondary p-8 lg:p-12 rounded-xl">
              <h3 className="text-2xl font-display font-bold text-secondary-foreground mb-4">
                Станьте нашим партнером
              </h3>
              <p className="text-secondary-foreground/80 mb-6">
                Отправьте коммерческое предложение с описанием вашей продукции, 
                прайс-листом и контактными данными через форму обратной связи. 
                Мы рассмотрим заявку в течение 3 рабочих дней.
              </p>
              <div className="space-y-3 text-secondary-foreground/80 mb-8">
                <p><strong>Телефон:</strong> +7-996-613-88-52</p>
              </div>
              <Button asChild size="lg">
                <Link to="/contacts">
                  Отправить заявку
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Как начать сотрудничество
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Заявка", desc: "Отправьте коммерческое предложение" },
                { step: "2", title: "Анализ", desc: "Оценка предложения нашими экспертами" },
                { step: "3", title: "Переговоры", desc: "Согласование условий сотрудничества" },
                { step: "4", title: "Договор", desc: "Заключение контракта и начало работы" },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                    {item.step}
                  </div>
                  <h4 className="font-display font-semibold text-foreground mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Suppliers;
