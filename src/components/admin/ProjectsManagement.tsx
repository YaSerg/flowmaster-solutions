import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Edit, X, Save, FolderTree } from "lucide-react";
import ProjectCategoriesManagement from "./ProjectCategoriesManagement";

interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  details: string;
  image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
}

interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
}

const ProjectsManagement = () => {
  const queryClient = useQueryClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("projects");
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    year: new Date().getFullYear().toString(),
    description: "",
    details: "",
    image_url: "",
    seo_title: "",
    seo_description: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await (supabase as any)
      .from("project_categories")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data) {
      setCategories(data as ProjectCategory[]);
      if (data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: data[0].slug }));
      }
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects((data || []) as Project[]);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Ошибка загрузки проектов");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: categories.length > 0 ? categories[0].slug : "",
      year: new Date().getFullYear().toString(),
      description: "",
      details: "",
      image_url: "",
      seo_title: "",
      seo_description: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `project-${Date.now()}.${fileExt}`;
    const filePath = `projects/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("attachments")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleEdit = (project: Project) => {
    setFormData({
      title: project.title,
      category: project.category,
      year: project.year,
      description: project.description,
      details: project.details,
      image_url: project.image_url || "",
      seo_title: project.seo_title || "",
      seo_description: project.seo_description || "",
    });
    setImagePreview(project.image_url);
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Введите название проекта");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile) || "";
      }

      const projectData = {
        title: formData.title,
        category: formData.category,
        year: formData.year,
        description: formData.description,
        details: formData.details,
        image_url: imageUrl || null,
        seo_title: formData.seo_title || null,
        seo_description: formData.seo_description || null,
      };

      if (editingId) {
        const { error } = await (supabase as any)
          .from("projects")
          .update(projectData)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Проект обновлен");
      } else {
        const { error } = await (supabase as any)
          .from("projects")
          .insert([projectData]);

        if (error) throw error;
        toast.success("Проект добавлен");
      }

      resetForm();
      fetchProjects();
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Ошибка сохранения проекта");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить этот проект?")) return;

    try {
      const { error } = await (supabase as any)
        .from("projects")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Проект удален");
      fetchProjects();
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Ошибка удаления проекта");
    }
  };

  const getCategoryName = (slug: string) => {
    return categories.find((c) => c.slug === slug)?.name || slug;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="projects">Проекты</TabsTrigger>
          <TabsTrigger value="categories">
            <FolderTree className="h-4 w-4 mr-2" />
            Категории
          </TabsTrigger>
        </TabsList>
        {activeTab === "projects" && !showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить проект
          </Button>
        )}
      </div>

      <TabsContent value="categories" className="mt-4">
        <ProjectCategoriesManagement />
      </TabsContent>

      <TabsContent value="projects" className="mt-4 space-y-6">

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">
              {editingId ? "Редактирование проекта" : "Новый проект"}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название проекта *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="НПЗ «Роснефть» Рязань"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Год</Label>
                <Input
                  id="year"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Изображение</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {imagePreview && (
              <div className="relative w-48 h-36 rounded-lg overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Краткое описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Комплексная поставка регулирующей и запорной арматуры..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Подробное описание</Label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                placeholder="Поставка включала регулирующие клапаны с пневмоприводом..."
                rows={3}
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">SEO-настройки</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seo_title">Meta Title</Label>
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                    placeholder="Проект НПЗ Роснефть — ООО ТДИ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_description">Meta Description</Label>
                  <Input
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                    placeholder="Комплексная поставка арматуры для НПЗ..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={resetForm}>
                Отмена
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingId ? "Сохранить" : "Добавить"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Проекты не найдены
          </p>
        ) : (
          projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                {project.image_url && (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-24 h-18 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{project.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {getCategoryName(project.category)} • {project.year}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(project)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(project.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProjectsManagement;
