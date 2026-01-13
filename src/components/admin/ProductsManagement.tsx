import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, ImageIcon, X, Pencil, Images } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  category_id: string | null;
  image_url: string | null;
  specs: string | null;
  seo_title: string | null;
  seo_description: string | null;
  slug: string | null;
  created_at: string;
}

interface GalleryImage {
  id: string;
  product_id: string;
  image_url: string;
}

// Функция транслитерации для генерации slug
const transliterate = (text: string): string => {
  const map: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
    'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    ' ': '-', '_': '-'
  };
  
  return text
    .toLowerCase()
    .split('')
    .map(char => map[char] || char)
    .join('')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const mimeToExtension: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

const ProductsManagement = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    description: "",
    categoryId: "",
    specs: "",
    seoTitle: "",
    seoDescription: "",
    slug: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  
  // Gallery state
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<GalleryImage[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const [categoriesRes, productsRes] = await Promise.all([
      (supabase as any).from("product_categories").select("*").order("name"),
      (supabase as any).from("products").select("*").order("created_at", { ascending: false }),
    ]);

    if (categoriesRes.error) {
      toast({ title: "Ошибка", description: categoriesRes.error.message, variant: "destructive" });
    } else {
      setCategories(categoriesRes.data || []);
    }

    if (productsRes.error) {
      toast({ title: "Ошибка", description: productsRes.error.message, variant: "destructive" });
    } else {
      setProducts(productsRes.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchGallery = async (productId: string) => {
    const { data, error } = await (supabase as any)
      .from("product_gallery")
      .select("*")
      .eq("product_id", productId)
      .order("created_at");
    
    if (!error && data) {
      setExistingGallery(data);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setGalleryFiles(prev => [...prev, ...files]);
      const previews = files.map(f => URL.createObjectURL(f));
      setGalleryPreviews(prev => [...prev, ...previews]);
    }
  };

  const removeGalleryPreview = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const deleteGalleryImage = async (galleryItem: GalleryImage) => {
    // Удаляем файл из Storage
    const fileName = galleryItem.image_url.split("/").pop();
    if (fileName) {
      await supabase.storage.from("attachments").remove([fileName]);
    }
    
    // Удаляем запись из БД
    const { error } = await (supabase as any)
      .from("product_gallery")
      .delete()
      .eq("id", galleryItem.id);
    
    if (error) {
      toast({ title: "Ошибка удаления", description: error.message, variant: "destructive" });
    } else {
      setExistingGallery(prev => prev.filter(g => g.id !== galleryItem.id));
      toast({ title: "Фото удалено" });
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      shortDescription: "",
      description: "",
      categoryId: "",
      specs: "",
      seoTitle: "",
      seoDescription: "",
      slug: "",
    });
    clearImage();
    setExistingImageUrl(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setExistingGallery([]);
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.title,
      shortDescription: product.short_description || "",
      description: product.description || "",
      categoryId: product.category_id || "",
      specs: product.specs || "",
      seoTitle: product.seo_title || "",
      seoDescription: product.seo_description || "",
      slug: product.slug || "",
    });
    setExistingImageUrl(product.image_url);
    setImagePreview(null);
    setImageFile(null);
    await fetchGallery(product.id);
    setShowForm(true);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = mimeToExtension[file.type] || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "Ошибка загрузки фото", description: uploadError.message, variant: "destructive" });
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("attachments")
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: "Введите название товара", variant: "destructive" });
      return;
    }

    // Проверка категории
    if (!formData.categoryId) {
      toast({ title: "Выберите категорию", variant: "destructive" });
      return;
    }

    setSaving(true);
    
    // Генерация slug если пустой
    const slug = formData.slug.trim() || transliterate(formData.name.trim());
    
    let imageUrl: string | null = existingImageUrl;

    // Upload new main image if provided
    if (imageFile) {
      const uploadedUrl = await uploadFile(imageFile);
      if (uploadedUrl) {
        // Удаляем старое изображение если было
        if (existingImageUrl) {
          const oldFileName = existingImageUrl.split("/").pop();
          if (oldFileName) {
            await supabase.storage.from("attachments").remove([oldFileName]);
          }
        }
        imageUrl = uploadedUrl;
      } else {
        setSaving(false);
        return;
      }
    }

    const productData = {
      title: formData.name.trim(),
      short_description: formData.shortDescription.trim() || null,
      description: formData.description || null,
      category_id: formData.categoryId || null,
      specs: formData.specs.trim() || null,
      seo_title: formData.seoTitle.trim() || null,
      seo_description: formData.seoDescription.trim() || null,
      slug: slug,
      image_url: imageUrl,
    };

    let productId = editingProduct?.id;

    if (editingProduct) {
      // UPDATE
      const { error } = await (supabase as any)
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) {
        toast({ title: "Ошибка сохранения", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    } else {
      // INSERT
      const { data, error } = await (supabase as any)
        .from("products")
        .insert(productData)
        .select()
        .single();

      if (error) {
        toast({ title: "Ошибка сохранения", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      productId = data.id;
    }

    // Upload gallery images
    if (galleryFiles.length > 0 && productId) {
      for (const file of galleryFiles) {
        const galleryUrl = await uploadFile(file);
        if (galleryUrl) {
          await (supabase as any).from("product_gallery").insert({
            product_id: productId,
            image_url: galleryUrl,
          });
        }
      }
    }

    toast({ title: editingProduct ? "Товар обновлен" : "Товар добавлен" });
    resetForm();
    fetchData();
    setSaving(false);
  };

  const deleteProduct = async (product: Product) => {
    if (!confirm(`Удалить товар "${product.title}"?`)) return;

    // Получаем все фото галереи
    const { data: galleryData } = await (supabase as any)
      .from("product_gallery")
      .select("image_url")
      .eq("product_id", product.id);

    // Собираем все файлы для удаления
    const filesToDelete: string[] = [];
    
    // Основное фото
    if (product.image_url) {
      const fileName = product.image_url.split("/").pop();
      if (fileName) filesToDelete.push(fileName);
    }
    
    // Фото галереи
    if (galleryData) {
      for (const item of galleryData) {
        const fileName = item.image_url.split("/").pop();
        if (fileName) filesToDelete.push(fileName);
      }
    }

    // Удаляем файлы из Storage
    if (filesToDelete.length > 0) {
      await supabase.storage.from("attachments").remove(filesToDelete);
    }

    // Удаляем записи галереи (каскадно удалятся с продуктом, но на всякий случай)
    await (supabase as any).from("product_gallery").delete().eq("product_id", product.id);

    // Удаляем продукт
    const { error } = await (supabase as any).from("products").delete().eq("id", product.id);

    if (error) {
      toast({ title: "Ошибка удаления", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Товар удален" });
      fetchData();
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Без категории";
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name || "Без категории";
  };

  return (
    <div className="space-y-6">
      {!showForm && (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить товар
        </Button>
      )}

      {showForm && (
        <div className="bg-card p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingProduct ? "Редактировать товар" : "Добавить товар"}
            </h2>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={saveProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Клапан регулирующий КР-25"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Категория *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL (slug)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="klapan-reguliruyuschiy-kr-25 (генерируется автоматически)"
              />
              <p className="text-xs text-muted-foreground">
                Оставьте пустым для автоматической генерации из названия
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDesc">Краткое описание</Label>
              <Textarea
                id="shortDesc"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Краткое описание для карточки товара"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specs">Характеристики (краткие, через запятую)</Label>
              <Input
                id="specs"
                value={formData.specs}
                onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                placeholder="DN 25-300, PN 16-40, Нерж. сталь"
              />
            </div>

            <div className="space-y-2">
              <Label>Полное описание</Label>
              <RichTextEditor
                content={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
              />
            </div>

            {/* SEO Fields */}
            <div className="border-t border-border pt-4 mt-4">
              <h3 className="text-sm font-medium mb-3">SEO настройки</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder="Заголовок для поисковых систем (до 60 символов)"
                    maxLength={60}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    placeholder="Описание для поисковых систем (до 160 символов)"
                    maxLength={160}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Main Image */}
            <div className="space-y-2">
              <Label>Основное фото</Label>
              {(imagePreview || existingImageUrl) ? (
                <div className="relative w-40 h-40">
                  <img
                    src={imagePreview || existingImageUrl || ""}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2"
                    onClick={() => {
                      clearImage();
                      setExistingImageUrl(null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Выбрать файл</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Gallery Images */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Images className="h-4 w-4" />
                Дополнительные фото (галерея)
              </Label>
              
              {/* Existing gallery images */}
              {existingGallery.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {existingGallery.map((item) => (
                    <div key={item.id} className="relative w-24 h-24">
                      <img
                        src={item.image_url}
                        alt="Gallery"
                        className="w-full h-full object-cover rounded-lg border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => deleteGalleryImage(item)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* New gallery previews */}
              {galleryPreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative w-24 h-24">
                      <img
                        src={preview}
                        alt="New gallery"
                        className="w-full h-full object-cover rounded-lg border border-border border-dashed"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => removeGalleryPreview(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                <Plus className="h-6 w-6 text-muted-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingProduct ? "Сохранить изменения" : "Добавить товар"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Отмена
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Список товаров</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Товаров пока нет
          </div>
        ) : (
          <div className="divide-y divide-border">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{product.title}</h3>
                  <p className="text-sm text-muted-foreground">{getCategoryName(product.category_id)}</p>
                  {product.slug && (
                    <p className="text-xs text-muted-foreground/70 truncate">/{product.slug}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                    <Pencil className="h-4 w-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteProduct(product)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsManagement;
