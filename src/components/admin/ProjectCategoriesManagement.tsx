import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit, X, Save } from "lucide-react";

interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

const ProjectCategoriesManagement = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("project_categories")
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
    const translitMap: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
      'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    
    return name
      .toLowerCase()
      .split('')
      .map(char => translitMap[char] || char)
      .join('')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;

    setAdding(true);
    const slug = generateSlug(name);

    const { error } = await (supabase as any)
      .from("project_categories")
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

  const startEditing = (cat: ProjectCategory) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveCategory = async (id: string) => {
    const name = editingName.trim();
    if (!name) return;

    const slug = generateSlug(name);
    const { error } = await (supabase as any)
      .from("project_categories")
      .update({ name, slug })
      .eq("id", id);

    if (error) {
      toast({
        title: "Ошибка сохранения",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Категория обновлена" });
      cancelEditing();
      fetchCategories();
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Удалить эту категорию? Проекты останутся без категории.")) {
      return;
    }

    const { error } = await (supabase as any)
      .from("project_categories")
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
    <div className="space-y-4">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">Добавить категорию проектов</h4>
        <form onSubmit={addCategory} className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Название категории"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={adding} size="sm">
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Добавить</span>
          </Button>
        </form>
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
        <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
          {categories.map((cat) => (
            <li key={cat.id} className="flex items-center justify-between p-3 bg-card hover:bg-muted/50">
              {editingId === cat.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" onClick={() => saveCategory(cat.id)}>
                    <Save className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={cancelEditing}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <span className="font-medium">{cat.name}</span>
                    <span className="ml-2 text-sm text-muted-foreground">({cat.slug})</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEditing(cat)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectCategoriesManagement;
