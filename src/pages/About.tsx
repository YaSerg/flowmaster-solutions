import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Users, Globe, Award, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useSEO } from "@/hooks/useSEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-valve.jpg";

interface PageInfo {
  id: number;
  title: string;
  subtitle: string | null;
  content: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

const fetchAboutPageData = async (): Promise<PageInfo | null> => {
  const { data, error } = await (supabase as any)
    .from("company_info")
    .select("*")
    .eq("id", 2)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

const milestones = [
  { year: "2021", title: "Основание компании", description: "Начало работы в сфере поставок промышленной арматуры" },
  { year: "2022", title: "Первый крупный контракт", description: "Поставка оборудования для нефтеперерабатывающего завода" },
  { year: "2023", title: "Расширение ассортимента", description: "Добавление новых линеек регулирующей арматуры" },
  { year: "2024", title: "Новый этап развития", description: "Модернизация склада и расширение ассортимента" },
];

const values = [
  {
    icon: Award,
    title: "Качество",
    description: "Мы поставляем только сертифицированную продукцию, прошедшую многоступенчатый контроль качества",
  },
  {
    icon: Users,
    title: "Клиентоориентированность",
    description: "Индивидуальный подход к каждому клиенту и гибкие условия сотрудничества",
  },
  {
    icon: Globe,
    title: "Надежность",
    description: "Выполняем обязательства в срок и несем ответственность за каждую поставку",
  },
  {
    icon: Building2,
    title: "Профессионализм",
    description: "Команда опытных инженеров и менеджеров с глубоким знанием отрасли",
  },
];

const About = () => {
  const { data: pageData, isLoading } = useQuery({
    queryKey: ["about_page_data"],
    queryFn: fetchAboutPageData,
    staleTime: 1000 * 60 * 5,
  });

  // Default values
  const defaultTitle = "О компании";
  const defaultSubtitle = "ООО «Торговый Дом Импульс» — надежный партнер в сфере комплексных поставок трубопроводной арматуры для промышленных предприятий России и СНГ";
  const defaultSeoTitle = "О компании ООО ТДИ";
  const defaultSeoDescription = "ООО Торговый Дом Импульс — надежный партнер в сфере комплексных поставок трубопроводной арматуры для промышленных предприятий России и СНГ с 2021 года";

  const displayTitle = pageData?.title || defaultTitle;
  const displaySubtitle = pageData?.subtitle || defaultSubtitle;
  const displayContent = pageData?.content || null;
  const seoTitle = pageData?.seo_title || defaultSeoTitle;
  const seoDescription = pageData?.seo_description || defaultSeoDescription;

  useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: "о компании ТДИ, Торговый Дом Импульс, поставки арматуры, промышленное оборудование",
    canonical: "https://oootdi.ru/about",
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-20 lg:py-28 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div className="container relative z-10">
          <div className="max-w-3xl">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary-foreground" />
                <span className="text-primary-foreground/80">Загрузка...</span>
              </div>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
                  {displayTitle}
                </h1>
                <p className="text-xl text-primary-foreground/80 leading-relaxed">
                  {displaySubtitle}
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                На рынке промышленного оборудования с 2021 года
              </h2>
              {displayContent ? (
                <div 
                  className="space-y-4 text-muted-foreground leading-relaxed prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: displayContent }}
                />
              ) : (
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Компания «Торговый Дом Импульс» была основана в 2021 году и за это время 
                    зарекомендовала себя как надежный поставщик трубопроводной арматуры для 
                    предприятий нефтегазовой, энергетической и химической промышленности.
                  </p>
                  <p>
                    Мы осуществляем поставки регулирующих, отсечных, запорных клапанов, 
                    а также специальной арматуры для работы в сложных условиях эксплуатации. 
                    Наша продукция соответствует требованиям ГОСТ, ТР ТС и международных стандартов.
                  </p>
                  <p>
                    Собственный склад в Московской области и развитая логистическая сеть 
                    позволяют оперативно доставлять продукцию во все регионы России и СНГ.
                  </p>
                </div>
              )}
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-3xl font-display font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Успешных проектов</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-3xl font-display font-bold text-primary">200+</div>
                  <div className="text-sm text-muted-foreground">Постоянных клиентов</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img
                src={heroImage}
                alt="Промышленное оборудование"
                className="rounded-xl shadow-industrial w-full"
              />
              <div className="absolute -bottom-6 -right-6 p-6 rounded-xl bg-primary text-primary-foreground shadow-lg hidden lg:block">
                <div className="text-4xl font-display font-bold">с 2021</div>
                <div className="text-sm text-primary-foreground/80">года на рынке</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Наши ценности
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Принципы, которые лежат в основе нашей работы
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="p-6 rounded-xl bg-card border border-border hover:shadow-hover transition-all">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              История развития
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {milestone.year}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                    {milestone.title}
                  </h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-secondary-foreground mb-4">
            Готовы к сотрудничеству?
          </h2>
          <p className="text-secondary-foreground/80 mb-8 max-w-xl mx-auto">
            Свяжитесь с нами для обсуждения условий поставки
          </p>
          <Button asChild size="lg">
            <Link to="/contacts">
              Связаться с нами
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default About;
