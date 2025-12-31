import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

interface SitePage {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  updated_at: string;
}

const PAGES = [
  { slug: "home", label: "Главная" },
  { slug: "about", label: "О компании" },
];

const SiteContentManagement = () => {
  const { toast } = useToast();
  const [pages, setPages] = useState<SitePage[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});

  const fetchPages = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("site_pages")
      .select("*")
      .in("slug", PAGES.map((p) => p.slug));

    if (error) {
      toast({ title: "Ошибка загрузки", description: error.message, variant: "destructive" });
    } else {
      setPages(data || []);
      // Initialize edited content
      const initialContent: Record<string, string> = {};
      (data || []).forEach((page: SitePage) => {
        initialContent[page.slug] = page.content || "";
      });
      setEditedContent(initialContent);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const savePage = async (slug: string) => {
    const page = pages.find((p) => p.slug === slug);
    if (!page) return;

    setSaving(slug);

    const { error } = await (supabase as any)
      .from("site_pages")
      .update({
        content: editedContent[slug] || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", page.id);

    if (error) {
      toast({ title: "Ошибка сохранения", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Страница сохранена" });
      fetchPages();
    }
    setSaving(null);
  };

  const getPage = (slug: string) => pages.find((p) => p.slug === slug);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {PAGES.map(({ slug, label }) => {
        const page = getPage(slug);
        const hasChanges = page && editedContent[slug] !== (page.content || "");

        return (
          <div key={slug} className="bg-card p-6 rounded-xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{label}</h2>
              <Button
                onClick={() => savePage(slug)}
                disabled={!page || saving === slug || !hasChanges}
              >
                {saving === slug ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Сохранить
              </Button>
            </div>

            {!page ? (
              <p className="text-muted-foreground text-sm">
                Страница не найдена в базе данных. Добавьте запись с slug="{slug}" в таблицу site_pages.
              </p>
            ) : (
              <div className="space-y-2">
                <RichTextEditor
                  content={editedContent[slug] || ""}
                  onChange={(html) => setEditedContent({ ...editedContent, [slug]: html })}
                />
                {page.updated_at && (
                  <p className="text-xs text-muted-foreground">
                    Последнее изменение:{" "}
                    {new Date(page.updated_at).toLocaleString("ru-RU")}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SiteContentManagement;
