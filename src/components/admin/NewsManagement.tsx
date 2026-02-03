import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Pencil, ImageIcon, X, Calendar } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  image_url: string | null;
  published_at: string;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
}

const NewsManagement = () => {
  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("news")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) {
      toast({ title: "Ошибка загрузки", description: error.message, variant: "destructive" });
    } else {
      setNews(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const generateSlug = (text: string) => {
    const translitMap: Record<string, string> = {
      а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
      з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
      п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
      ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
    };

    return text
      .toLowerCase()
      .split("")
      .map((char) => translitMap[char] || char)
      .join("")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editingItem) {
      setSlug(generateSlug(value));
    }
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setContent("");
    setImageUrl("");
    setPublishedAt(new Date().toISOString().slice(0, 16));
    setSeoTitle("");
    setSeoDescription("");
    setImageFile(null);
    setImagePreview(null);
    setEditingItem(null);
    setShowForm(false);
  };

  const openEditForm = (item: NewsItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setSlug(item.slug);
    setContent(item.content || "");
    setImageUrl(item.image_url || "");
    setPublishedAt(new Date(item.published_at).toISOString().slice(0, 16));
    setSeoTitle(item.seo_title || "");
    setSeoDescription(item.seo_description || "");
    setImagePreview(item.image_url || null);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return imageUrl || null;

    setUploadingImage(true);
    const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `news/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { error } = await supabase.storage.from("attachments").upload(fileName, imageFile);
    if (error) {
      toast({ title: "Ошибка загрузки изображения", description: error.message, variant: "destructive" });
      setUploadingImage(false);
      return null;
    }

    const { data: urlData } = supabase.storage.from("attachments").getPublicUrl(fileName);
    setUploadingImage(false);
    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      toast({ title: "Заполните обязательные поля", variant: "destructive" });
      return;
    }

    setSaving(true);
    const uploadedImageUrl = await uploadImage();

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      content: content || null,
      image_url: uploadedImageUrl,
      published_at: new Date(publishedAt).toISOString(),
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
    };

    if (editingItem) {
      const { error } = await (supabase as any)
        .from("news")
        .update(payload)
        .eq("id", editingItem.id);

      if (error) {
        toast({ title: "Ошибка сохранения", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Новость обновлена" });
        resetForm();
        fetchNews();
      }
    } else {
      const { error } = await (supabase as any)
        .from("news")
        .insert(payload);

      if (error) {
        toast({ title: "Ошибка создания", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Новость создана" });
        resetForm();
        fetchNews();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (item: NewsItem) => {
    if (!confirm(`Удалить новость "${item.title}"?`)) return;

    // Delete image if exists
    if (item.image_url) {
      const path = item.image_url.split("/attachments/")[1];
      if (path) {
        await supabase.storage.from("attachments").remove([path]);
      }
    }

    const { error } = await (supabase as any)
      .from("news")
      .delete()
      .eq("id", item.id);

    if (error) {
      toast({ title: "Ошибка удаления", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Новость удалена" });
      fetchNews();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!showForm && (
        <Button onClick={() => {
          setPublishedAt(new Date().toISOString().slice(0, 16));
          setShowForm(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить новость
        </Button>
      )}

      {showForm && (
        <div className="bg-card p-6 rounded-xl border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">
              {editingItem ? "Редактирование новости" : "Новая новость"}
            </h3>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Заголовок *</Label>
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Заголовок новости"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL) *</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="news-slug"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Дата публикации</Label>
              <Input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Изображение</Label>
              <div className="flex items-start gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-40 h-24 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setImageUrl("");
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-40 h-24 bg-muted rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Или укажите URL изображения
                  </p>
                  <Input
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                      setImageFile(null);
                    }}
                    placeholder="https://..."
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Содержание</Label>
              <RichTextEditor content={content} onChange={setContent} />
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">SEO</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SEO заголовок</Label>
                  <Input
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Title для поисковиков"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SEO описание</Label>
                  <Input
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Meta description"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={saving || uploadingImage}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingItem ? "Сохранить" : "Создать"}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* News list */}
      <div className="space-y-4">
        {news.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Новостей пока нет
          </p>
        ) : (
          news.map((item) => (
            <div
              key={item.id}
              className="bg-card p-4 rounded-xl border border-border flex items-center gap-4"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-14 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{item.title}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(item.published_at)}
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="icon" onClick={() => openEditForm(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(item)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsManagement;
