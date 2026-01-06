import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import projectRefinery from "@/assets/project-refinery.jpg";
import projectPowerplant from "@/assets/project-powerplant.jpg";
import projectChemical from "@/assets/project-chemical.jpg";

interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  details: string;
  image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

const projectCategories = [
  { id: "all", name: "Все проекты" },
  { id: "oil", name: "Нефтегазовая отрасль" },
  { id: "energy", name: "Энергетика" },
  { id: "chemical", name: "Химическая промышленность" },
];

// Fallback images by category
const fallbackImages: Record<string, string> = {
  oil: projectRefinery,
  energy: projectPowerplant,
  chemical: projectChemical,
};

const Projects = () => {
  useSEO({
    title: "Выполненные проекты ООО ТДИ",
    description: "Реализованные поставки трубопроводной арматуры для крупнейших предприятий нефтегазовой, энергетической и химической промышленности",
    keywords: "проекты ТДИ, поставки арматуры, нефтегазовая отрасль, энергетика, химическая промышленность",
    canonical: "https://oootdi.ru/projects",
  });

  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("year", { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
  });

  const filteredProjects = activeCategory === "all"
    ? projects
    : projects.filter(p => p.category === activeCategory);

  const getProjectImage = (project: Project) => {
    return project.image_url || fallbackImages[project.category] || projectRefinery;
  };

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

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}

          {/* Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="group relative overflow-hidden rounded-xl shadow-card cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={getProjectImage(project)}
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
          )}

          {/* Empty State */}
          {!isLoading && filteredProjects.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">
                Проекты в этой категории пока не добавлены
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-xl shadow-industrial max-w-2xl w-full max-h-[90vh] overflow-auto animate-scale-in">
            <div className="relative">
              <img
                src={getProjectImage(selectedProject)}
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
