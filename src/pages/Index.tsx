import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Truck, Award, CheckCircle, Phone, Clock, Wrench, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useSEO } from "@/hooks/useSEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-valve.jpg";
import projectRefinery from "@/assets/project-refinery.jpg";
import projectPowerplant from "@/assets/project-powerplant.jpg";
import projectChemical from "@/assets/project-chemical.jpg";
import SafeHTML from "@/components/SafeHTML";
import DynamicNewsBlock from "@/components/blocks/DynamicNewsBlock";

interface PageInfo {
  id: number;
  title: string;
  subtitle: string | null;
  content: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string | null;
}

interface PageInfo {
  id: number;
  title: string;
  subtitle: string | null;
  content: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

const fetchHomePageData = async (): Promise<PageInfo | null> => {
  const { data, error } = await (supabase as any)
    .from("company_info")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  
  if (error) throw error;
  return data;
};

const fetchLatestProjects = async (): Promise<Project[]> => {
  const { data, error } = await (supabase as any)
    .from("projects")
    .select("id, title, category, description, image_url")
    .order("created_at", { ascending: false })
    .limit(3);
  
  if (error) throw error;
  return data || [];
};

// Fallback images by category
const fallbackImages: Record<string, string> = {
  oil: projectRefinery,
  energy: projectPowerplant,
  chemical: projectChemical,
};

const features = [
  {
    icon: Shield,
    title: "Гарантия качества",
    description: "Сертифицированная продукция соответствует ГОСТ и международным стандартам",
  },
  {
    icon: Truck,
    title: "Оперативная доставка",
    description: "Собственный склад и логистика по всей России и СНГ",
  },
  {
    icon: Award,
    title: "С 2021 года",
    description: "Надежный партнер для крупнейших предприятий отрасли",
  },
  {
    icon: Wrench,
    title: "Техподдержка",
    description: "Инженерное сопровождение и консультации на всех этапах",
  },
];


const Index = () => {
  const { data: pageData, isLoading } = useQuery({
    queryKey: ["home_page_data"],
    queryFn: fetchHomePageData,
    staleTime: 1000 * 60 * 5,
  });

  const { data: latestProjects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["latest_projects"],
    queryFn: fetchLatestProjects,
    staleTime: 1000 * 60 * 5,
  });

  const getProjectImage = (project: Project) => {
    return project.image_url || fallbackImages[project.category] || projectRefinery;
  };

  // Default values
  const defaultTitle = "Трубопроводная арматура для промышленности";
  const defaultSubtitle = "Комплексные поставки и производство клапанов, задвижек и другой трубопроводной арматуры для нефтегазовой и энергетической отрасли";
  const defaultSeoTitle = "Трубопроводная арматура ООО ТДИ";
  const defaultSeoDescription = "ООО Торговый Дом Импульс — комплексные поставки и производство трубопроводной арматуры: клапаны регулирующие, отсечные, запорные, задвижки для нефтегазовой и энергетической отрасли";

  const displayTitle = pageData?.title || defaultTitle;
  const displaySubtitle = pageData?.subtitle || defaultSubtitle;
  const seoTitle = pageData?.seo_title || defaultSeoTitle;
  const seoDescription = pageData?.seo_description || defaultSeoDescription;

  useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: "трубопроводная арматура, клапаны регулирующие, клапаны отсечные, задвижки, запорные клапаны, ТДИ, Торговый Дом Импульс",
    canonical: "https://oootdi.ru/",
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/70 to-secondary/40" />
        
        <div className="container relative z-10 py-20 lg:py-32">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary mb-6">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Надежный партнер с 2021 года</span>
            </div>
            
            {isLoading ? (
              <div className="flex items-center gap-2 mb-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary-foreground" />
              </div>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight mb-6">
                  {displayTitle}
                </h1>
                
                <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl leading-relaxed">
                  {displaySubtitle}
                </p>
              </>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="hero" size="xl">
                <Link to="/products">
                  Каталог продукции
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="heroOutline" size="xl">
                <Link to="/contacts">Отправить запрос</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Почему выбирают нас
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Торговый Дом Импульс — это надежные поставки качественной арматуры 
              от ведущих производителей России и зарубежья
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 lg:p-8 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
                О компании
              </h2>
              {pageData?.content ? (
                <SafeHTML 
                  html={pageData.content}
                  className="text-muted-foreground text-lg mb-6 leading-relaxed prose max-w-none"
                />
              ) : (
                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                  ООО «Торговый Дом Импульс» — ваш надежный партнер в сфере поставок 
                  трубопроводной арматуры. Мы работаем с ведущими предприятиями нефтегазовой, 
                  энергетической и химической промышленности.
                </p>
              )}
              <ul className="space-y-3 mb-8">
                {[
                  "Собственное производство и склад",
                  "Работа по прямым контрактам с заводами",
                  "Гибкая ценовая политика",
                  "Техническая экспертиза и подбор оборудования",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-foreground">
                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild>
                <Link to="/about">
                  Подробнее о компании
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="p-6 rounded-xl bg-card shadow-card">
                  <div className="text-4xl font-display font-bold text-primary mb-2">500+</div>
                  <div className="text-muted-foreground">Выполненных проектов</div>
                </div>
                <div className="p-6 rounded-xl bg-secondary text-secondary-foreground shadow-card">
                  <div className="text-4xl font-display font-bold mb-2">с 2021</div>
                  <div className="text-secondary-foreground/80">Года на рынке</div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="p-6 rounded-xl bg-primary text-primary-foreground shadow-card">
                  <div className="text-4xl font-display font-bold mb-2">200+</div>
                  <div className="text-primary-foreground/80">Партнеров</div>
                </div>
                <div className="p-6 rounded-xl bg-card shadow-card">
                  <div className="text-4xl font-display font-bold text-accent mb-2">99%</div>
                  <div className="text-muted-foreground">Довольных клиентов</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
                Наши проекты
              </h2>
              <p className="text-muted-foreground text-lg">
                Реализованные поставки для крупнейших предприятий
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/projects">
                Все проекты
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {projectsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : latestProjects.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Проекты скоро появятся
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {latestProjects.map((project) => (
                <div
                  key={project.id}
                  className="group relative overflow-hidden rounded-xl shadow-card"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={getProjectImage(project)}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-display font-semibold text-primary-foreground mb-2">
                      {project.title}
                    </h3>
                    <p className="text-primary-foreground/80 text-sm">
                      {project.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Dynamic News Section */}
      <DynamicNewsBlock />

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-secondary">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-secondary-foreground mb-4">
                Нужна консультация специалиста?
              </h2>
              <p className="text-secondary-foreground/80 max-w-xl">
                Наши инженеры помогут подобрать оптимальное решение для вашего проекта
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a
                href="tel:+79966138852"
                className="flex items-center gap-3 px-6 py-4 rounded-lg bg-secondary-foreground/10 text-secondary-foreground hover:bg-secondary-foreground/20 transition-colors"
              >
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-secondary-foreground/70">Звоните нам</div>
                  <div className="font-semibold">+7-996-613-88-52</div>
                </div>
              </a>
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/contacts">Отправить запрос</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
