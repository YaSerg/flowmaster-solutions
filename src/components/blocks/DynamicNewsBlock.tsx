import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar, ArrowRight, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  image_url: string | null;
  published_at: string;
}

interface DynamicNewsBlockProps {
  title?: string;
  subtitle?: string;
  count?: number;
}

const fetchLatestNews = async (count: number): Promise<NewsItem[]> => {
  const { data, error } = await (supabase as any)
    .from("news")
    .select("id, title, slug, content, image_url, published_at")
    .order("published_at", { ascending: false })
    .limit(count);

  if (error) throw error;
  return data || [];
};

const DynamicNewsBlock = ({ 
  title = "Новости компании", 
  subtitle,
  count = 3 
}: DynamicNewsBlockProps) => {
  const { data: news = [], isLoading } = useQuery({
    queryKey: ["latest_news", count],
    queryFn: () => fetchLatestNews(count),
    staleTime: 1000 * 60 * 5,
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getExcerpt = (content: string | null, maxLength = 100) => {
    if (!content) return "";
    const text = content.replace(/<[^>]*>/g, "");
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (news.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 bg-muted">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground text-lg">{subtitle}</p>
            )}
          </div>
          <Button asChild variant="outline">
            <Link to="/news">
              Все новости
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {news.map((item) => (
            <Link
              key={item.id}
              to={`/news/${item.slug}`}
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-hover"
            >
              {item.image_url && (
                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
                <Calendar className="h-4 w-4" />
                {formatDate(item.published_at)}
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {getExcerpt(item.content)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DynamicNewsBlock;
