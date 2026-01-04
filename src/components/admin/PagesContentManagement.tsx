import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Home, Building2 } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

interface PageInfo {
  id: number;
  title: string;
  subtitle: string | null;
  content: string | null;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
}

interface PageFormData {
  title: string;
  subtitle: string;
  content: string;
  seo_title: string;
  seo_description: string;
}

const defaultFormData: PageFormData = {
  title: "",
  subtitle: "",
  content: "",
  seo_title: "",
  seo_description: "",
};

const PagesContentManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"home" | "about">("home");
  
  // Home page (ID 1)
  const [homePage, setHomePage] = useState<PageInfo | null>(null);
  const [homeForm, setHomeForm] = useState<PageFormData>(defaultFormData);
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeSaving, setHomeSaving] = useState(false);

  // About page (ID 2)
  const [aboutPage, setAboutPage] = useState<PageInfo | null>(null);
  const [aboutForm, setAboutForm] = useState<PageFormData>(defaultFormData);
  const [aboutLoading, setAboutLoading] = useState(true);
  const [aboutSaving, setAboutSaving] = useState(false);

  const fetchPageById = async (id: number): Promise<PageInfo | null> => {
    const { data, error } = await (supabase as any)
      .from("company_info")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      toast({ title: "Ошибка загрузки", description: error.message, variant: "destructive" });
      return null;
    }
    return data;
  };

  const fetchHomePage = async () => {
    setHomeLoading(true);
    const data = await fetchPageById(1);
    if (data) {
      setHomePage(data);
      setHomeForm({
        title: data.title || "",
        subtitle: data.subtitle || "",
        content: data.content || "",
        seo_title: data.seo_title || "",
        seo_description: data.seo_description || "",
      });
    }
    setHomeLoading(false);
  };

  const fetchAboutPage = async () => {
    setAboutLoading(true);
    const data = await fetchPageById(2);
    if (data) {
      setAboutPage(data);
      setAboutForm({
        title: data.title || "",
        subtitle: data.subtitle || "",
        content: data.content || "",
        seo_title: data.seo_title || "",
        seo_description: data.seo_description || "",
      });
    }
    setAboutLoading(false);
  };

  useEffect(() => {
    fetchHomePage();
    fetchAboutPage();
  }, []);

  const savePageById = async (id: number, formData: PageFormData, setSaving: (v: boolean) => void, refetch: () => void, pageName: string) => {
    setSaving(true);

    const { error } = await (supabase as any)
      .from("company_info")
      .update({
        title: formData.title,
        subtitle: formData.subtitle,
        content: formData.content,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast({ title: "Ошибка сохранения", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${pageName} сохранена` });
      refetch();
    }
    setSaving(false);
  };

  const saveHomePage = () => savePageById(1, homeForm, setHomeSaving, fetchHomePage, "Главная страница");
  const saveAboutPage = () => savePageById(2, aboutForm, setAboutSaving, fetchAboutPage, "Страница О компании");

  const hasHomeChanges = homePage && (
    homeForm.title !== (homePage.title || "") ||
    homeForm.subtitle !== (homePage.subtitle || "") ||
    homeForm.content !== (homePage.content || "") ||
    homeForm.seo_title !== (homePage.seo_title || "") ||
    homeForm.seo_description !== (homePage.seo_description || "")
  );

  const hasAboutChanges = aboutPage && (
    aboutForm.title !== (aboutPage.title || "") ||
    aboutForm.subtitle !== (aboutPage.subtitle || "") ||
    aboutForm.content !== (aboutPage.content || "") ||
    aboutForm.seo_title !== (aboutPage.seo_title || "") ||
    aboutForm.seo_description !== (aboutPage.seo_description || "")
  );

  const renderPageForm = (
    pageData: PageInfo | null,
    formData: PageFormData,
    setFormData: (data: PageFormData) => void,
    isLoading: boolean,
    isSaving: boolean,
    hasChanges: boolean,
    onSave: () => void,
    pageName: string
  ) => {
    if (isLoading) {
      return (
        <div className="p-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </div>
      );
    }

    if (!pageData) {
      return (
        <div className="p-6 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">
            Запись не найдена. Добавьте запись в таблицу company_info.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Banner Section */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-lg font-semibold mb-4">Баннер</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${pageName}-title`}>Заголовок баннера</Label>
              <Input
                id={`${pageName}-title`}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Заголовок страницы"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${pageName}-subtitle`}>Подзаголовок баннера</Label>
              <Textarea
                id={`${pageName}-subtitle`}
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Подзаголовок или краткое описание"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-lg font-semibold mb-4">Основной контент</h3>
          <div className="space-y-2">
            <Label>Содержимое страницы</Label>
            <RichTextEditor
              content={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
            />
          </div>
        </div>

        {/* SEO Section */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <h3 className="text-lg font-semibold mb-4">SEO-настройки</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${pageName}-seo-title`}>Meta Title</Label>
              <Input
                id={`${pageName}-seo-title`}
                value={formData.seo_title}
                onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                placeholder="SEO заголовок (до 60 символов)"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {formData.seo_title.length}/60 символов
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${pageName}-seo-desc`}>Meta Description</Label>
              <Textarea
                id={`${pageName}-seo-desc`}
                value={formData.seo_description}
                onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                placeholder="SEO описание (до 160 символов)"
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">
                {formData.seo_description.length}/160 символов
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <Button onClick={onSave} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Сохранить {pageName}
          </Button>
          {pageData.updated_at && (
            <p className="text-xs text-muted-foreground">
              Последнее изменение: {new Date(pageData.updated_at).toLocaleString("ru-RU")}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "home" | "about")}>
        <TabsList className="mb-6">
          <TabsTrigger value="home" className="gap-2">
            <Home className="h-4 w-4" />
            Главная страница
          </TabsTrigger>
          <TabsTrigger value="about" className="gap-2">
            <Building2 className="h-4 w-4" />
            Страница О компании
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          {renderPageForm(
            homePage,
            homeForm,
            setHomeForm,
            homeLoading,
            homeSaving,
            !!hasHomeChanges,
            saveHomePage,
            "Главная"
          )}
        </TabsContent>

        <TabsContent value="about">
          {renderPageForm(
            aboutPage,
            aboutForm,
            setAboutForm,
            aboutLoading,
            aboutSaving,
            !!hasAboutChanges,
            saveAboutPage,
            "О компании"
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PagesContentManagement;
