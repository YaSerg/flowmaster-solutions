import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { useSEO } from "@/hooks/useSEO";
import SafeHTML from "@/components/SafeHTML";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, ArrowLeft, ImageIcon } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  image_url: string | null;
  published_at: string;
  seo_title: string | null;
  seo_description: string | null;
}

const fetchNewsItem = async (slug: string): Promise<NewsItem | null> => {
  const { data, error } = await (supabase as any)
    .from("news")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const NewsDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: newsItem, isLoading, error } = useQuery({
    queryKey: ["news_item", slug],
    queryFn: () => fetchNewsItem(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });

  const seoTitle = newsItem?.seo_title || newsItem?.title || "Новость";
  const seoDescription = newsItem?.seo_description || 
    (newsItem?.content ? newsItem.content.replace(/<[^>]*>/g, "").slice(0, 160) : "");

  useSEO({
    title: `${seoTitle} | ООО ТДИ`,
    description: seoDescription,
    keywords: "новости ТДИ, " + (newsItem?.title || ""),
    canonical: `https://oootdi.ru/news/${slug}`,
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !newsItem) {
    return (
      <Layout>
        <div className="py-20 container text-center">
          <h1 className="text-2xl font-bold mb-4">Новость не найдена</h1>
          <Button onClick={() => navigate("/news")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            К списку новостей
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-gradient-hero">
        <div className="container">
          <Link
            to="/news"
            className="inline-flex items-center text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Все новости
          </Link>
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-primary-foreground/70 mb-4">
              <Calendar className="h-4 w-4" />
              {formatDate(newsItem.published_at)}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground">
              {newsItem.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-20 bg-background">
        <div className="container">
          <article className="max-w-4xl mx-auto">
            {newsItem.image_url && (
              <div className="mb-8 rounded-xl overflow-hidden shadow-card">
                <img
                  src={newsItem.image_url}
                  alt={newsItem.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {newsItem.content ? (
              <SafeHTML
                html={newsItem.content}
                className="prose prose-lg max-w-none text-foreground"
              />
            ) : (
              <p className="text-muted-foreground">Содержание новости отсутствует.</p>
            )}

            <div className="mt-12 pt-8 border-t">
              <Button asChild variant="outline">
                <Link to="/news">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Все новости
                </Link>
              </Button>
            </div>
          </article>
        </div>
      </section>
    </Layout>
  );
};

export default NewsDetails;
