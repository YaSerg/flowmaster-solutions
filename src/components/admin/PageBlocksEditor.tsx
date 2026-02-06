import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Type,
  Image,
  List,
  Clock,
  Zap,
  LayoutGrid,
  CheckSquare,
  Footprints,
  Newspaper,
  FolderKanban,
  Upload,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import RichTextEditor from "./RichTextEditor";
import { BlockData, PageBlocks } from "@/components/blocks/BlockRenderer";

// Available Lucide icons for features
const AVAILABLE_ICONS = [
  "Award", "Truck", "Shield", "Users", "Star", "CheckCircle", "Settings", 
  "Zap", "Heart", "Target", "Clock", "Globe", "Lock", "Briefcase",
  "Package", "BarChart", "Layers", "Database", "Server", "Cpu",
];

const BLOCK_TYPES = [
  { value: "hero", label: "Баннер (Hero)", icon: Image },
  { value: "text", label: "Текстовый блок", icon: Type },
  { value: "features", label: "Карточки преимуществ", icon: LayoutGrid },
  { value: "image_text", label: "Изображение + текст", icon: Image },
  { value: "timeline", label: "Таймлайн", icon: Clock },
  { value: "cta", label: "Призыв к действию", icon: Zap },
  { value: "numbered_cards", label: "Нумерованные карточки", icon: List },
  { value: "checklist", label: "Чек-лист", icon: CheckSquare },
  { value: "steps", label: "Шаги процесса", icon: Footprints },
  { value: "dynamic_news", label: "Блок новостей", icon: Newspaper },
  { value: "dynamic_projects", label: "Блок проектов", icon: FolderKanban },
];

const generateBlockId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getDefaultBlockData = (type: string): Record<string, any> => {
  switch (type) {
    case "hero":
      return { title: "Заголовок", subtitle: "", cta_text: "", cta_href: "", bg_image: "" };
    case "text":
      return { title: "", content: "", centered: false, max_width: "4xl" };
    case "features":
      return { title: "", subtitle: "", features: [], columns: 4 };
    case "image_text":
      return { title: "", content: "", image_url: "", reverse: false, stats: [] };
    case "timeline":
      return { title: "", milestones: [] };
    case "cta":
      return { title: "", subtitle: "", cta_text: "", cta_href: "" };
    case "numbered_cards":
      return { title: "", cards: [], columns: 3 };
    case "checklist":
      return { title: "", subtitle: "", items: [], sidebar: null };
    case "steps":
      return { title: "", steps: [] };
    case "dynamic_news":
      return { title: "Новости компании", subtitle: "", count: 3 };
    case "dynamic_projects":
      return { title: "Наши проекты", subtitle: "", count: 3, show_link: true };
    default:
      return {};
  }
};

interface PageBlocksEditorProps {
  pageId: string;
  pageLabel: string;
}

const PageBlocksEditor = ({ pageId, pageLabel }: PageBlocksEditorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageData, setPageData] = useState<PageBlocks>({
    blocks: [],
    seo_title: "",
    seo_description: "",
  });
  const [originalData, setOriginalData] = useState<PageBlocks | null>(null);

  const fetchPageData = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("site_design")
      .select("data")
      .eq("id", pageId)
      .maybeSingle();

    if (error) {
      toast({ title: "Ошибка загрузки", description: error.message, variant: "destructive" });
    } else if (data?.data) {
      const fetchedData = data.data as PageBlocks;
      setPageData(fetchedData);
      setOriginalData(fetchedData);
    } else {
      setPageData({ blocks: [], seo_title: "", seo_description: "" });
      setOriginalData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPageData();
  }, [pageId]);

  const savePageData = async () => {
    setSaving(true);
    const { error } = await (supabase as any)
      .from("site_design")
      .upsert({
        id: pageId,
        data: pageData,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      toast({ title: "Ошибка сохранения", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Страница сохранена" });
      setOriginalData(pageData);
    }
    setSaving(false);
  };

  const addBlock = (type: string) => {
    const newBlock: BlockData = {
      id: generateBlockId(),
      type,
      data: getDefaultBlockData(type),
    };
    setPageData({
      ...pageData,
      blocks: [...pageData.blocks, newBlock],
    });
  };

  const removeBlock = (blockId: string) => {
    setPageData({
      ...pageData,
      blocks: pageData.blocks.filter((b) => b.id !== blockId),
    });
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newBlocks = [...pageData.blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setPageData({ ...pageData, blocks: newBlocks });
  };

  const updateBlockData = (blockId: string, newData: Record<string, any>) => {
    setPageData({
      ...pageData,
      blocks: pageData.blocks.map((b) =>
        b.id === blockId ? { ...b, data: { ...b.data, ...newData } } : b
      ),
    });
  };

  const hasChanges = JSON.stringify(pageData) !== JSON.stringify(originalData);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SEO Settings */}
      <div className="bg-card p-6 rounded-xl border border-border">
        <h3 className="text-lg font-semibold mb-4">SEO-настройки</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Meta Title</Label>
            <Input
              value={pageData.seo_title || ""}
              onChange={(e) => setPageData({ ...pageData, seo_title: e.target.value })}
              placeholder="SEO заголовок"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">{(pageData.seo_title || "").length}/60</p>
          </div>
          <div className="space-y-2">
            <Label>Meta Description</Label>
            <Textarea
              value={pageData.seo_description || ""}
              onChange={(e) => setPageData({ ...pageData, seo_description: e.target.value })}
              placeholder="SEO описание"
              maxLength={160}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">{(pageData.seo_description || "").length}/160</p>
          </div>
        </div>
      </div>

      {/* Blocks List */}
      <div className="bg-card p-6 rounded-xl border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Блоки страницы ({pageData.blocks.length})</h3>
        </div>

        {pageData.blocks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Нет блоков. Добавьте первый блок ниже.
          </p>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {pageData.blocks.map((block, index) => {
              const blockType = BLOCK_TYPES.find((t) => t.value === block.type);
              const BlockIcon = blockType?.icon || Type;

              return (
                <AccordionItem
                  key={block.id}
                  value={block.id}
                  className="border border-border rounded-lg px-4"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <AccordionTrigger className="flex-1 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <BlockIcon className="h-4 w-4 text-primary" />
                        <span>{blockType?.label || block.type}</span>
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                      </div>
                    </AccordionTrigger>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlock(index, "up");
                        }}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlock(index, "down");
                        }}
                        disabled={index === pageData.blocks.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBlock(block.id);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <AccordionContent>
                    <BlockEditor
                      block={block}
                      onChange={(newData) => updateBlockData(block.id, newData)}
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      {/* Add Block */}
      <div className="bg-card p-6 rounded-xl border border-border">
        <h3 className="text-lg font-semibold mb-4">Добавить блок</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {BLOCK_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <Button
                key={type.value}
                variant="outline"
                className="flex flex-col h-auto py-4 gap-2"
                onClick={() => addBlock(type.value)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{type.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={savePageData} disabled={saving || !hasChanges} size="lg">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Сохранить {pageLabel}
        </Button>
      </div>
    </div>
  );
};

// Block editor component for individual block types
const BlockEditor = ({ block, onChange }: { block: BlockData; onChange: (data: Record<string, any>) => void }) => {
  const { type, data } = block;

  switch (type) {
    case "hero":
      return <HeroBlockEditor data={data} onChange={onChange} />;

    case "text":
      return (
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Заголовок (необязательно)</Label>
            <Input value={data.title || ""} onChange={(e) => onChange({ title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Контент</Label>
            <RichTextEditor content={data.content || ""} onChange={(html) => onChange({ content: html })} />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="centered" 
              checked={data.centered || false}
              onCheckedChange={(checked) => onChange({ centered: checked })}
            />
            <Label htmlFor="centered">Выравнивание по центру</Label>
          </div>
        </div>
      );

    case "cta":
      return (
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Заголовок</Label>
            <Input value={data.title || ""} onChange={(e) => onChange({ title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Подзаголовок</Label>
            <Textarea value={data.subtitle || ""} onChange={(e) => onChange({ subtitle: e.target.value })} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Текст кнопки</Label>
              <Input value={data.cta_text || ""} onChange={(e) => onChange({ cta_text: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Ссылка кнопки</Label>
              <Input value={data.cta_href || ""} onChange={(e) => onChange({ cta_href: e.target.value })} />
            </div>
          </div>
        </div>
      );

    case "dynamic_news":
      return (
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Заголовок секции</Label>
            <Input value={data.title || ""} onChange={(e) => onChange({ title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Подзаголовок</Label>
            <Input value={data.subtitle || ""} onChange={(e) => onChange({ subtitle: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Количество новостей</Label>
            <Select value={String(data.count || 3)} onValueChange={(v) => onChange({ count: parseInt(v) })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 новости</SelectItem>
                <SelectItem value="4">4 новости</SelectItem>
                <SelectItem value="6">6 новостей</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "dynamic_projects":
      return (
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Заголовок секции</Label>
            <Input value={data.title || ""} onChange={(e) => onChange({ title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Подзаголовок</Label>
            <Input value={data.subtitle || ""} onChange={(e) => onChange({ subtitle: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Количество проектов</Label>
            <Select value={String(data.count || 3)} onValueChange={(v) => onChange({ count: parseInt(v) })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 проекта</SelectItem>
                <SelectItem value="4">4 проекта</SelectItem>
                <SelectItem value="6">6 проектов</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="show_link" 
              checked={data.show_link !== false}
              onCheckedChange={(checked) => onChange({ show_link: checked })}
            />
            <Label htmlFor="show_link">Показать ссылку "Все проекты"</Label>
          </div>
        </div>
      );

    case "cta":
      return (
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Заголовок</Label>
            <Input value={data.title || ""} onChange={(e) => onChange({ title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Подзаголовок</Label>
            <Textarea value={data.subtitle || ""} onChange={(e) => onChange({ subtitle: e.target.value })} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Текст кнопки</Label>
              <Input value={data.cta_text || ""} onChange={(e) => onChange({ cta_text: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Ссылка кнопки</Label>
              <Input value={data.cta_href || ""} onChange={(e) => onChange({ cta_href: e.target.value })} />
            </div>
          </div>
        </div>
      );

    case "dynamic_news":
      return (
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Заголовок секции</Label>
            <Input value={data.title || ""} onChange={(e) => onChange({ title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Подзаголовок</Label>
            <Input value={data.subtitle || ""} onChange={(e) => onChange({ subtitle: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Количество новостей</Label>
            <Select value={String(data.count || 3)} onValueChange={(v) => onChange({ count: parseInt(v) })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 новости</SelectItem>
                <SelectItem value="4">4 новости</SelectItem>
                <SelectItem value="6">6 новостей</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case "features":
      return <FeaturesBlockEditor data={data} onChange={onChange} />;

    case "image_text":
      return <ImageTextBlockEditor data={data} onChange={onChange} />;

    case "timeline":
      return <TimelineBlockEditor data={data} onChange={onChange} />;

    case "numbered_cards":
      return <NumberedCardsBlockEditor data={data} onChange={onChange} />;

    case "checklist":
      return <ChecklistBlockEditor data={data} onChange={onChange} />;

    case "steps":
      return <StepsBlockEditor data={data} onChange={onChange} />;

    default:
      return (
        <div className="pt-4">
          <p className="text-muted-foreground">Редактор для типа "{type}" пока не реализован.</p>
          <pre className="mt-2 p-2 bg-muted rounded text-xs">{JSON.stringify(data, null, 2)}</pre>
        </div>
      );
  }
};

// Helper function to upload image
const uploadImage = async (file: File, folder: string): Promise<string | null> => {
  const ext = file.type.split('/')[1] || 'jpg';
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
  
  const { error } = await supabase.storage
    .from('attachments')
    .upload(fileName, file);
  
  if (error) {
    console.error('Upload error:', error);
    return null;
  }
  
  const { data: urlData } = supabase.storage
    .from('attachments')
    .getPublicUrl(fileName);
  
  return urlData.publicUrl;
};

// Hero block editor with background image
const HeroBlockEditor = ({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const url = await uploadImage(file, 'hero');
    setUploading(false);

    if (url) {
      onChange({ bg_image: url });
      toast({ title: "Изображение загружено" });
    } else {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Заголовок</Label>
        <Input value={data.title || ""} onChange={(e) => onChange({ title: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Подзаголовок</Label>
        <Textarea value={data.subtitle || ""} onChange={(e) => onChange({ subtitle: e.target.value })} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Текст кнопки</Label>
          <Input value={data.cta_text || ""} onChange={(e) => onChange({ cta_text: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Ссылка кнопки</Label>
          <Input value={data.cta_href || ""} onChange={(e) => onChange({ cta_href: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Фоновое изображение (по умолчанию: стандартное)</Label>
        <div className="flex gap-2">
          <Input 
            value={data.bg_image || ""} 
            onChange={(e) => onChange({ bg_image: e.target.value })} 
            placeholder="URL изображения или загрузите файл"
          />
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
        {data.bg_image && (
          <div className="mt-2">
            <img src={data.bg_image} alt="Preview" className="h-20 w-40 object-cover rounded" />
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onChange({ bg_image: "" })}>
              Удалить
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Features block editor with icon selection and image upload
const FeaturesBlockEditor = ({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) => {
  const features = data.features || [];
  const { toast } = useToast();

  const addFeature = () => {
    onChange({ features: [...features, { icon: "Award", title: "", description: "" }] });
  };

  const updateFeature = (index: number, field: string, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onChange({ features: newFeatures });
  };

  const removeFeature = (index: number) => {
    onChange({ features: features.filter((_: any, i: number) => i !== index) });
  };

  const handleFeatureImageUpload = async (index: number, file: File) => {
    const url = await uploadImage(file, 'features');
    if (url) {
      updateFeature(index, 'icon', url);
      toast({ title: "Изображение загружено" });
    } else {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Заголовок секции</Label>
          <Input value={data.title || ""} onChange={(e) => onChange({ title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Подзаголовок</Label>
          <Input value={data.subtitle || ""} onChange={(e) => onChange({ subtitle: e.target.value })} />
        </div>
      </div>
      
      <div className="space-y-3">
        <Label>Карточки ({features.length})</Label>
        {features.map((feature: any, index: number) => {
          const isImageUrl = feature.icon && (feature.icon.startsWith('http') || feature.icon.startsWith('/'));
          
          return (
            <div key={index} className="p-3 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Карточка #{index + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => removeFeature(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Иконка / Изображение</Label>
                <div className="flex gap-2 items-center">
                  <Select 
                    value={isImageUrl ? "custom" : (feature.icon || "")} 
                    onValueChange={(v) => {
                      if (v !== "custom") {
                        updateFeature(index, "icon", v);
                      }
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Выберите иконку" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ICONS.map((icon) => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                      <SelectItem value="custom">Своё изображение</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFeatureImageUpload(index, file);
                      }}
                    />
                    <Button variant="outline" size="sm" asChild>
                      <span><Upload className="h-4 w-4 mr-1" /> Загрузить</span>
                    </Button>
                  </label>
                  
                  {isImageUrl && (
                    <img src={feature.icon} alt="" className="h-8 w-8 object-cover rounded" />
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Заголовок"
                  value={feature.title || ""}
                  onChange={(e) => updateFeature(index, "title", e.target.value)}
                />
                <Input
                  placeholder="Описание"
                  value={feature.description || ""}
                  onChange={(e) => updateFeature(index, "description", e.target.value)}
                />
              </div>
            </div>
          );
        })}
        <Button variant="outline" size="sm" onClick={addFeature}>
          <Plus className="h-4 w-4 mr-2" /> Добавить карточку
        </Button>
      </div>
    </div>
  );
};

// Image + Text block editor
const ImageTextBlockEditor = ({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) => (
  <div className="space-y-4 pt-4">
    <div className="space-y-2">
      <Label>Заголовок</Label>
      <Input value={data.title || ""} onChange={(e) => onChange({ title: e.target.value })} />
    </div>
    <div className="space-y-2">
      <Label>Контент</Label>
      <RichTextEditor content={data.content || ""} onChange={(html) => onChange({ content: html })} />
    </div>
    <div className="space-y-2">
      <Label>URL изображения</Label>
      <Input value={data.image_url || ""} onChange={(e) => onChange({ image_url: e.target.value })} placeholder="https://..." />
    </div>
  </div>
);

// Timeline block editor
const TimelineBlockEditor = ({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) => {
  const milestones = data.milestones || [];

  const addMilestone = () => {
    onChange({ milestones: [...milestones, { year: "", title: "", description: "" }] });
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    onChange({ milestones: newMilestones });
  };

  const removeMilestone = (index: number) => {
    onChange({ milestones: milestones.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Заголовок секции</Label>
        <Input value={data.title || ""} onChange={(e) => onChange({ title: e.target.value })} />
      </div>
      
      <div className="space-y-3">
        <Label>События ({milestones.length})</Label>
        {milestones.map((milestone: any, index: number) => (
          <div key={index} className="p-3 border border-border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Событие #{index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeMilestone(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Год" value={milestone.year || ""} onChange={(e) => updateMilestone(index, "year", e.target.value)} />
              <Input placeholder="Заголовок" value={milestone.title || ""} onChange={(e) => updateMilestone(index, "title", e.target.value)} />
              <Input placeholder="Описание" value={milestone.description || ""} onChange={(e) => updateMilestone(index, "description", e.target.value)} />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addMilestone}>
          <Plus className="h-4 w-4 mr-2" /> Добавить событие
        </Button>
      </div>
    </div>
  );
};

// Numbered cards block editor
const NumberedCardsBlockEditor = ({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) => {
  const cards = data.cards || [];

  const addCard = () => {
    onChange({ cards: [...cards, { title: "", description: "" }] });
  };

  const updateCard = (index: number, field: string, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    onChange({ cards: newCards });
  };

  const removeCard = (index: number) => {
    onChange({ cards: cards.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Заголовок секции</Label>
        <Input value={data.title || ""} onChange={(e) => onChange({ title: e.target.value })} />
      </div>
      
      <div className="space-y-3">
        <Label>Карточки ({cards.length})</Label>
        {cards.map((card: any, index: number) => (
          <div key={index} className="p-3 border border-border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Карточка #{index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeCard(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Заголовок" value={card.title || ""} onChange={(e) => updateCard(index, "title", e.target.value)} />
              <Input placeholder="Описание" value={card.description || ""} onChange={(e) => updateCard(index, "description", e.target.value)} />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addCard}>
          <Plus className="h-4 w-4 mr-2" /> Добавить карточку
        </Button>
      </div>
    </div>
  );
};

// Checklist block editor
const ChecklistBlockEditor = ({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) => {
  const items = data.items || [];

  const addItem = () => {
    onChange({ items: [...items, ""] });
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange({ items: newItems });
  };

  const removeItem = (index: number) => {
    onChange({ items: items.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Заголовок</Label>
          <Input value={data.title || ""} onChange={(e) => onChange({ title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Подзаголовок</Label>
          <Input value={data.subtitle || ""} onChange={(e) => onChange({ subtitle: e.target.value })} />
        </div>
      </div>
      
      <div className="space-y-3">
        <Label>Пункты списка ({items.length})</Label>
        {items.map((item: string, index: number) => (
          <div key={index} className="flex gap-2">
            <Input value={item} onChange={(e) => updateItem(index, e.target.value)} placeholder={`Пункт ${index + 1}`} />
            <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" /> Добавить пункт
        </Button>
      </div>
    </div>
  );
};

// Steps block editor
const StepsBlockEditor = ({ data, onChange }: { data: Record<string, any>; onChange: (d: Record<string, any>) => void }) => {
  const steps = data.steps || [];

  const addStep = () => {
    onChange({ steps: [...steps, { title: "", description: "" }] });
  };

  const updateStep = (index: number, field: string, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    onChange({ steps: newSteps });
  };

  const removeStep = (index: number) => {
    onChange({ steps: steps.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Заголовок секции</Label>
        <Input value={data.title || ""} onChange={(e) => onChange({ title: e.target.value })} />
      </div>
      
      <div className="space-y-3">
        <Label>Шаги ({steps.length})</Label>
        {steps.map((step: any, index: number) => (
          <div key={index} className="p-3 border border-border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Шаг #{index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeStep(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Заголовок" value={step.title || ""} onChange={(e) => updateStep(index, "title", e.target.value)} />
              <Input placeholder="Описание" value={step.description || ""} onChange={(e) => updateStep(index, "description", e.target.value)} />
            </div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addStep}>
          <Plus className="h-4 w-4 mr-2" /> Добавить шаг
        </Button>
      </div>
    </div>
  );
};

export default PageBlocksEditor;
