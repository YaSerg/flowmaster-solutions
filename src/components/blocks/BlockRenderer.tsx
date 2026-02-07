import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import SafeHTML from "@/components/SafeHTML";
import DynamicNewsBlock from "./DynamicNewsBlock";
import * as Icons from "lucide-react";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import heroValveDefault from "@/assets/hero-valve.jpg";

// Block type definitions
export interface BlockData {
  id: string;
  type: string;
  data: Record<string, any>;
}

export interface PageBlocks {
  blocks: BlockData[];
  seo_title?: string;
  seo_description?: string;
}

// Individual block components
const HeroBlock = ({ data }: { data: Record<string, any> }) => {
  const bgImage = data.bg_image || heroValveDefault;
  
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      {/* Gradient overlay matching original design */}
      <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      <div className="container relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
            {data.title || "Заголовок"}
          </h1>
          {data.subtitle && (
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              {data.subtitle}
            </p>
          )}
          {data.cta_text && data.cta_href && (
            <div className="mt-8">
              <Button asChild size="lg" variant={data.cta_variant || "default"}>
                <Link to={data.cta_href}>
                  {data.cta_text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const TextBlock = ({ data }: { data: Record<string, any> }) => (
  <section className={`py-6 lg:py-10 ${data.bg_color || "bg-background"}`}>
    <div className="container">
      <div className={`max-w-4xl ${data.centered ? "mx-auto text-center" : ""}`}>
        {data.title && (
          <h2 className={`text-3xl md:text-4xl font-display font-bold text-foreground mb-6 ${data.centered ? "text-center" : ""}`}>
            {data.title}
          </h2>
        )}
        {data.content && (
          <SafeHTML 
            html={data.content}
            className={`prose prose-lg max-w-none text-muted-foreground ${data.centered ? "[&>*]:text-center" : ""}`}
          />
        )}
      </div>
    </div>
  </section>
);

const FeaturesBlock = ({ data }: { data: Record<string, any> }) => {
  const features = data.features || [];
  const columns = data.columns || 4;
  
  return (
    <section className={`py-8 lg:py-11 ${data.bg_color || "bg-muted"}`}>
      <div className="container">
        {(data.title || data.subtitle) && (
          <div className="text-center mb-6">
            {data.title && (
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                {data.title}
              </h2>
            )}
            {data.subtitle && (
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {data.subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
          {features.map((feature: any, index: number) => {
            // Check if it's an icon name or image URL
            const isImageUrl = feature.icon && (feature.icon.startsWith('http') || feature.icon.startsWith('/'));
            const IconComponent = !isImageUrl && feature.icon ? (Icons as any)[feature.icon] : null;
            
            return (
              <div key={index} className="p-6 rounded-xl bg-card border border-border hover:shadow-hover transition-all">
                {isImageUrl && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden mb-4">
                    <img src={feature.icon} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                {IconComponent && (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                )}
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const ImageTextBlock = ({ data }: { data: Record<string, any> }) => (
  <section className={`py-8 lg:py-11 ${data.bg_color || "bg-background"}`}>
    <div className="container">
      <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${data.reverse ? "lg:flex-row-reverse" : ""}`}>
        <div className={data.reverse ? "lg:order-2" : ""}>
          {data.title && (
            <h2 className="text-3xl font-display font-bold text-foreground mb-6">
              {data.title}
            </h2>
          )}
          {data.content && (
            <SafeHTML 
              html={data.content}
              className="space-y-4 text-muted-foreground leading-relaxed prose max-w-none"
            />
          )}
          {data.stats && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {data.stats.map((stat: any, index: number) => (
                <div key={index} className="p-4 rounded-lg bg-muted">
                  <div className="text-3xl font-display font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className={`relative ${data.reverse ? "lg:order-1" : ""}`}>
          {data.image_url && (
            <img
              src={data.image_url}
              alt={data.image_alt || ""}
              className="rounded-xl shadow-industrial w-full"
            />
          )}
          {data.badge && (
            <div className="absolute -bottom-6 -right-6 p-6 rounded-xl bg-primary text-primary-foreground shadow-lg hidden lg:block">
              <div className="text-4xl font-display font-bold">{data.badge.value}</div>
              <div className="text-sm text-primary-foreground/80">{data.badge.label}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  </section>
);

const TimelineBlock = ({ data }: { data: Record<string, any> }) => {
  const milestones = data.milestones || [];
  
  return (
    <section className={`py-8 lg:py-11 ${data.bg_color || "bg-background"}`}>
      <div className="container">
        {data.title && (
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              {data.title}
            </h2>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto">
          {milestones.map((milestone: any, index: number) => (
            <div key={index} className="flex gap-6 mb-6 last:mb-0">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {milestone.year}
                </div>
                {index < milestones.length - 1 && (
                  <div className="w-0.5 h-full bg-border mt-2" />
                )}
              </div>
              <div className="flex-1 pb-6">
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
  );
};

const CTABlock = ({ data }: { data: Record<string, any> }) => (
  <section className={`py-8 ${data.bg_color || "bg-secondary"}`}>
    <div className="container text-center">
      {data.title && (
        <h2 className="text-2xl md:text-3xl font-display font-bold text-secondary-foreground mb-4">
          {data.title}
        </h2>
      )}
      {data.subtitle && (
        <p className="text-secondary-foreground/80 mb-6 max-w-xl mx-auto">
          {data.subtitle}
        </p>
      )}
      {data.cta_text && data.cta_href && (
        <Button asChild size="lg">
          <Link to={data.cta_href}>
            {data.cta_text}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  </section>
);

const NumberedCardsBlock = ({ data }: { data: Record<string, any> }) => {
  const cards = data.cards || [];
  const columns = data.columns || 3;
  
  return (
    <section className={`py-8 lg:py-11 ${data.bg_color || "bg-muted"}`}>
      <div className="container">
        {data.title && (
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              {data.title}
            </h2>
          </div>
        )}
        
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
          {cards.map((card: any, index: number) => (
            <div key={index} className="p-6 rounded-xl bg-card shadow-card">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mb-4">
                {index + 1}
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                {card.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ChecklistBlock = ({ data }: { data: Record<string, any> }) => {
  const items = data.items || [];
  
  return (
    <section className={`py-8 lg:py-11 ${data.bg_color || "bg-background"}`}>
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            {data.title && (
              <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                {data.title}
              </h2>
            )}
            {data.subtitle && (
              <p className="text-muted-foreground mb-6">
                {data.subtitle}
              </p>
            )}
            <ul className="space-y-3">
              {items.map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {data.sidebar && (
            <div className="bg-secondary p-6 lg:p-10 rounded-xl">
              <h3 className="text-2xl font-display font-bold text-secondary-foreground mb-4">
                {data.sidebar.title}
              </h3>
              {data.sidebar.content && (
                <SafeHTML 
                  html={data.sidebar.content}
                  className="text-secondary-foreground/80 mb-5"
                />
              )}
              {data.sidebar.cta_text && data.sidebar.cta_href && (
                <Button asChild size="lg">
                  <Link to={data.sidebar.cta_href}>
                    {data.sidebar.cta_text}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const StepsBlock = ({ data }: { data: Record<string, any> }) => {
  const steps = data.steps || [];
  
  return (
    <section className={`py-8 lg:py-11 ${data.bg_color || "bg-muted"}`}>
      <div className="container">
        {data.title && (
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              {data.title}
            </h2>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto">
          <div className={`grid grid-cols-1 md:grid-cols-${steps.length} gap-4`}>
            {steps.map((step: any, index: number) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                  {step.number || index + 1}
                </div>
                <h4 className="font-display font-semibold text-foreground mb-2">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const DynamicNewsBlockWrapper = ({ data }: { data: Record<string, any> }) => (
  <DynamicNewsBlock 
    title={data.title} 
    subtitle={data.subtitle}
    count={data.count || 3}
  />
);

// Dynamic Projects Block
const DynamicProjectsBlock = ({ data }: { data: Record<string, any> }) => {
  const count = data.count || 3;
  
  // Fallback project images when none in DB
  const fallbackImages = [
    "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=600&q=80",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
    "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=600&q=80",
  ];

  const { data: projects, isLoading } = useQuery({
    queryKey: ["recent-projects", count],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(count);
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <section className="py-8 lg:py-11 bg-muted">
        <div className="container text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </div>
      </section>
    );
  }

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section className={`py-8 lg:py-11 ${data.bg_color || "bg-muted"}`}>
      <div className="container">
        {(data.title || data.subtitle) && (
          <div className="text-center mb-6">
            {data.title && (
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                {data.title}
              </h2>
            )}
            {data.subtitle && (
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {data.subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: any, index: number) => {
            const projectImage = project.image_url || fallbackImages[index % fallbackImages.length];
            return (
              <div key={project.id} className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-hover transition-all">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={projectImage} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                    {project.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{project.year}</span>
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              </div>
            </div>
            );
          })}
        </div>
        
        {data.show_link && (
          <div className="text-center mt-6">
            <Button asChild variant="outline">
              <Link to="/projects">
                Все проекты
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

// Block type mapping
const blockComponents: Record<string, React.ComponentType<{ data: Record<string, any> }>> = {
  hero: HeroBlock,
  text: TextBlock,
  features: FeaturesBlock,
  image_text: ImageTextBlock,
  timeline: TimelineBlock,
  cta: CTABlock,
  numbered_cards: NumberedCardsBlock,
  checklist: ChecklistBlock,
  steps: StepsBlock,
  dynamic_news: DynamicNewsBlockWrapper,
  dynamic_projects: DynamicProjectsBlock,
};

// Main BlockRenderer component
interface BlockRendererProps {
  blocks: BlockData[];
}

const BlockRenderer = ({ blocks }: BlockRendererProps) => {
  const renderedBlocks = useMemo(() => {
    return blocks.map((block) => {
      const Component = blockComponents[block.type];
      if (!Component) {
        console.warn(`Unknown block type: ${block.type}`);
        return null;
      }
      return <Component key={block.id} data={block.data} />;
    });
  }, [blocks]);

  return <>{renderedBlocks}</>;
};

export default BlockRenderer;
export { blockComponents };
