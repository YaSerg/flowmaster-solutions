import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useSEO } from "@/hooks/useSEO";
import projectRefinery from "@/assets/project-refinery.jpg";
import projectPowerplant from "@/assets/project-powerplant.jpg";
import projectChemical from "@/assets/project-chemical.jpg";

const projectCategories = [
  { id: "all", name: "Все проекты" },
  { id: "oil", name: "Нефтегазовая отрасль" },
  { id: "energy", name: "Энергетика" },
  { id: "chemical", name: "Химическая промышленность" },
];

const projects = [
  {
    id: 1,
    title: "НПЗ «Роснефть» Рязань",
    category: "oil",
    year: "2024",
    image: projectRefinery,
    description: "Комплексная поставка регулирующей и запорной арматуры для установки каталитического крекинга. Более 500 единиц оборудования.",
    details: "Поставка включала регулирующие клапаны с пневмоприводом, шаровые краны DN 50-300, предохранительные клапаны. Все оборудование прошло заводские испытания.",
  },
  {
    id: 2,
    title: "ТЭС «Энерго» Сургут",
    category: "energy",
    image: projectPowerplant,
    year: "2024",
    description: "Оснащение турбинного цеха запорной арматурой высокого давления для паропроводов.",
    details: "Поставлены задвижки клиновые PN 250, клапаны регулирующие для пара до 540°C, обратные клапаны. Гарантийное обслуживание 3 года.",
  },
  {
    id: 3,
    title: "Химический завод «Полимер»",
    category: "chemical",
    year: "2023",
    image: projectChemical,
    description: "Модернизация системы трубопроводов с полной заменой арматуры на производстве полипропилена.",
    details: "Замена устаревшей арматуры на современные аналоги из нержавеющей стали. Шаровые краны, дисковые затворы, регулирующие клапаны.",
  },
  {
    id: 4,
    title: "Газпром нефть — ОНПЗ",
    category: "oil",
    year: "2023",
    image: projectRefinery,
    description: "Поставка арматуры для установки первичной переработки нефти.",
    details: "Клапаны регулирующие для нефтепродуктов, задвижки клиновые, шаровые краны с огнестойким исполнением.",
  },
  {
    id: 5,
    title: "Красноярская ГЭС",
    category: "energy",
    year: "2022",
    image: projectPowerplant,
    description: "Замена арматуры на водоводах и системе охлаждения гидрогенераторов.",
    details: "Дисковые затворы большого диаметра DN 1000-1200, обратные клапаны, задвижки для технической воды.",
  },
  {
    id: 6,
    title: "Нижнекамскнефтехим",
    category: "chemical",
    year: "2022",
    image: projectChemical,
    description: "Комплексная поставка арматуры для производства этилена и пропилена.",
    details: "Криогенные клапаны для низких температур, регулирующая арматура для агрессивных сред, предохранительные клапаны.",
  },
];

const Projects = () => {
  useSEO({
    title: "Выполненные проекты ООО ТДИ",
    description: "Реализованные поставки трубопроводной арматуры для крупнейших предприятий нефтегазовой, энергетической и химической промышленности",
    keywords: "проекты ТДИ, поставки арматуры, нефтегазовая отрасль, энергетика, химическая промышленность",
    canonical: "https://oootdi.ru/projects",
  });

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);

  const filteredProjects = activeCategory === "all"
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-gradient-hero">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
              Наши проекты
            </h1>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              Реализованные поставки для крупнейших предприятий 
              нефтегазовой, энергетической и химической промышленности
            </p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-12 lg:py-20 bg-background">
        <div className="container">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {projectCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group relative overflow-hidden rounded-xl shadow-card cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/95 via-secondary/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="text-sm text-primary font-medium">{project.year}</span>
                  <h3 className="text-xl font-display font-semibold text-primary-foreground mt-1 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-primary-foreground/80 text-sm line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-xl shadow-industrial max-w-2xl w-full max-h-[90vh] overflow-auto animate-scale-in">
            <div className="relative">
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                className="w-full aspect-video object-cover"
              />
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-secondary/80 text-secondary-foreground hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <span className="text-sm text-primary font-medium">{selectedProject.year}</span>
              <h2 className="text-2xl font-display font-bold text-foreground mt-1 mb-4">
                {selectedProject.title}
              </h2>
              <p className="text-muted-foreground mb-4">{selectedProject.description}</p>
              <p className="text-foreground">{selectedProject.details}</p>
              <div className="mt-6 pt-6 border-t border-border">
                <Button asChild>
                  <Link to="/contacts" onClick={() => setSelectedProject(null)}>
                    Заказать аналогичный проект
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <section className="py-16 bg-muted">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-display font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Проектов выполнено</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Регионов поставки</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold text-primary mb-2">200+</div>
              <div className="text-muted-foreground">Партнеров</div>
            </div>
            <div>
              <div className="text-4xl font-display font-bold text-primary mb-2">99%</div>
              <div className="text-muted-foreground">Своевременных поставок</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Projects;
