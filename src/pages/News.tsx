import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { useSEO } from "@/hooks/useSEO";
import { Loader2, Calendar, ArrowRight, ImageIcon } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  image_url: string | null;
  published_at: string;
}

const fetchNews = async (): Promise<NewsItem[]> => {
  const { data, error } = await (supabase as any)
    .from("news")
    .select("id, title, slug, content, image_url, published_at")
    .order("published_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

const News = () => {
  useSEO({
    title: "Новости | ООО ТДИ",
    description: "Новости компании ООО Торговый Дом Импульс — события, обновления и достижения в сфере трубопроводной арматуры",
    keywords: "новости ТДИ, новости компании, трубопроводная арматура",
    canonical: "https://oootdi.ru/news",
  });

  const { data: news = [], isLoading } = useQuery({
    queryKey: ["news_list"],
    queryFn: fetchNews,
    staleTime: 1000 * 60 * 5,
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getExcerpt = (content: string | null, maxLength = 150) => {
    if (!content) return "";
    const text = content.replace(/<[^>]*>/g, "");
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-gradient-hero">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
              Новости компании
            </h1>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              События, обновления и достижения нашей компании
            </p>
          </div>
        </div>
      </section>

      {/* News List */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : news.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Новостей пока нет
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {news.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.slug}`}
                  className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-hover transition-all"
                >
                  <div className="aspect-video overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-primary mb-3">
                      <Calendar className="h-4 w-4" />
                      {formatDate(item.published_at)}
                    </div>
                    <h2 className="text-lg font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {getExcerpt(item.content)}
                    </p>
                    <span className="inline-flex items-center text-sm font-medium text-primary">
                      Читать далее
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default News;
