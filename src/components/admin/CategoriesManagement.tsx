import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

const CategoriesManagement = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("product_categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      toast({
        title: "Ошибка загрузки категорий",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-zа-яё0-9\s-]/gi, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;

    setAdding(true);
    const slug = generateSlug(name);

    const { error } = await (supabase as any)
      .from("product_categories")
      .insert({ name, slug });

    if (error) {
      toast({
        title: "Ошибка добавления",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Категория добавлена" });
      setNewCategoryName("");
      fetchCategories();
    }
    setAdding(false);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Удалить эту категорию? Товары в ней останутся без категории.")) {
      return;
    }

    const { error } = await (supabase as any)
      .from("product_categories")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Ошибка удаления",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Категория удалена" });
      fetchCategories();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-xl border border-border">
        <h2 className="text-lg font-semibold mb-4">Добавить категорию</h2>
        <form onSubmit={addCategory} className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Название категории"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={adding}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Добавить</span>
          </Button>
        </form>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Список категорий</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Категорий пока нет
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                <div>
                  <span className="font-medium">{cat.name}</span>
                  <span className="ml-2 text-sm text-muted-foreground">({cat.slug})</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteCategory(cat.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CategoriesManagement;
