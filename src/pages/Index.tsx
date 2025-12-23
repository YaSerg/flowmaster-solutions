import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Truck, Award, CheckCircle, Phone, Clock, Wrench } from "lucide-react";
import Layout from "@/components/layout/Layout";
import heroImage from "@/assets/hero-valve.jpg";
import projectRefinery from "@/assets/project-refinery.jpg";
import projectPowerplant from "@/assets/project-powerplant.jpg";
import projectChemical from "@/assets/project-chemical.jpg";

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
    title: "15+ лет опыта",
    description: "Надежный партнер для крупнейших предприятий отрасли",
  },
  {
    icon: Wrench,
    title: "Техподдержка",
    description: "Инженерное сопровождение и консультации на всех этапах",
  },
];

const projects = [
  {
    image: projectRefinery,
    title: "НПЗ «Роснефть»",
    description: "Поставка регулирующей арматуры для установки каталитического крекинга",
  },
  {
    image: projectPowerplant,
    title: "ТЭС «Энерго»",
    description: "Комплексное оснащение турбинного цеха запорной арматурой",
  },
  {
    image: projectChemical,
    title: "Химический завод «Полимер»",
    description: "Модернизация системы трубопроводов с заменой арматуры",
  },
];

const news = [
  {
    date: "18 декабря 2024",
    title: "Расширение складских мощностей",
    description: "Открытие нового склада в Московской области площадью 5000 м²",
  },
  {
    date: "5 декабря 2024",
    title: "Сертификация ISO 9001:2015",
    description: "Компания успешно прошла ресертификацию системы менеджмента качества",
  },
  {
    date: "22 ноября 2024",
    title: "Участие в выставке НЕФТЕГАЗ-2024",
    description: "Представили новую линейку регулирующих клапанов высокого давления",
  },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-transparent" />
        
        <div className="container relative z-10 py-20 lg:py-32">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary mb-6">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Надежный партнер с 2008 года</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight mb-6">
              Трубопроводная арматура для промышленности
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl leading-relaxed">
              Комплексные поставки и производство клапанов, задвижек и другой 
              трубопроводной арматуры для нефтегазовой и энергетической отрасли
            </p>
            
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
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                ООО «Торговый Дом Импульс» — ваш надежный партнер в сфере поставок 
                трубопроводной арматуры. Мы работаем с ведущими предприятиями нефтегазовой, 
                энергетической и химической промышленности.
              </p>
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
                  <div className="text-4xl font-display font-bold mb-2">15</div>
                  <div className="text-secondary-foreground/80">Лет на рынке</div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {projects.map((project, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl shadow-card"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={project.image}
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
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Новости компании
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {news.map((item, index) => (
              <article
                key={index}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-hover"
              >
                <time className="text-sm text-primary font-medium">{item.date}</time>
                <h3 className="text-lg font-display font-semibold text-foreground mt-2 mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

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
