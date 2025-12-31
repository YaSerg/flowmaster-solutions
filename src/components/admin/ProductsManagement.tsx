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
import { Loader2, Plus, Trash2, ImageIcon, X } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  short_description: string | null;
  category_id: string | null;
  image_url: string | null;
  specs: string | null;
  created_at: string;
}

const ProductsManagement = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    description: "",
    categoryId: "",
    specs: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
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
    });
    clearImage();
    setShowForm(false);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: "Введите название товара", variant: "destructive" });
      return;
    }

    setSaving(true);
    let imageUrl: string | null = null;

    // Upload image if provided
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        toast({ title: "Ошибка загрузки фото", description: uploadError.message, variant: "destructive" });
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    // Insert product
    const { error } = await (supabase as any).from("products").insert({
      name: formData.name.trim(),
      short_description: formData.shortDescription.trim() || null,
      description: formData.description || null,
      category_id: formData.categoryId || null,
      specs: formData.specs.trim() || null,
      image_url: imageUrl,
    });

    if (error) {
      toast({ title: "Ошибка сохранения", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Товар добавлен" });
      resetForm();
      fetchData();
    }
    setSaving(false);
  };

  const deleteProduct = async (product: Product) => {
    if (!confirm(`Удалить товар "${product.name}"?`)) return;

    // Delete image from storage
    if (product.image_url) {
      const fileName = product.image_url.split("/").pop();
      if (fileName) {
        await supabase.storage.from("product-images").remove([fileName]);
      }
    }

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
      {/* Add Product Button */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить товар
        </Button>
      )}

      {/* Add Product Form */}
      {showForm && (
        <div className="bg-card p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Добавить товар</h2>
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
                <Label htmlFor="category">Категория</Label>
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

            <div className="space-y-2">
              <Label>Фото товара</Label>
              {imagePreview ? (
                <div className="relative w-40 h-40">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2"
                    onClick={clearImage}
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

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Сохранить товар
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
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{getCategoryName(product.category_id)}</p>
                  {product.short_description && (
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {product.short_description}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteProduct(product)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsManagement;
