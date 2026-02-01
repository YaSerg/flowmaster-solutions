import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, GripVertical, Save } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

interface HeaderData {
  logo_url: string;
  phone: string;
  nav_items: NavItem[];
  cta_text: string;
  cta_href: string;
}

interface FooterData {
  description: string;
  phone: string;
  copyright: string;
  admin_link_text: string;
  contacts_title: string;
  nav_title: string;
  products_title: string;
}

const defaultHeader: HeaderData = {
  logo_url: "",
  phone: "+7-996-613-88-52",
  nav_items: [
    { label: "Главная", href: "/" },
    { label: "О компании", href: "/about" },
    { label: "Продукция", href: "/products" },
    { label: "Проекты", href: "/projects" },
    { label: "Для поставщиков", href: "/suppliers" },
    { label: "Контакты", href: "/contacts" },
  ],
  cta_text: "Отправить запрос",
  cta_href: "/contacts",
};

const defaultFooter: FooterData = {
  description: "Комплексные поставки и производство трубопроводной арматуры для нефтегазовой и энергетической отрасли.",
  phone: "+7-996-613-88-52",
  copyright: 'ООО "Торговый Дом Импульс". Все права защищены.',
  admin_link_text: "Вход для сотрудников",
  contacts_title: "Контакты",
  nav_title: "Навигация",
  products_title: "Продукция",
};

const DesignManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [headerData, setHeaderData] = useState<HeaderData>(defaultHeader);
  const [footerData, setFooterData] = useState<FooterData>(defaultFooter);

  useEffect(() => {
    fetchDesignData();
  }, []);

  const fetchDesignData = async () => {
    setLoading(true);
    
    const { data, error } = await (supabase as any)
      .from("site_design")
      .select("*");

    if (error) {
      toast({
        title: "Ошибка загрузки",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      const headerRecord = data.find((d: any) => d.id === "header");
      const footerRecord = data.find((d: any) => d.id === "footer");
      
      if (headerRecord?.data) {
        setHeaderData({ ...defaultHeader, ...headerRecord.data });
      }
      if (footerRecord?.data) {
        setFooterData({ ...defaultFooter, ...footerRecord.data });
      }
    }
    
    setLoading(false);
  };

  const saveHeaderData = async () => {
    setSaving(true);
    
    const { error } = await (supabase as any)
      .from("site_design")
      .upsert({ 
        id: "header", 
        data: headerData,
        updated_at: new Date().toISOString()
      });

    if (error) {
      toast({
        title: "Ошибка сохранения",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Настройки шапки сохранены" });
    }
    
    setSaving(false);
  };

  const saveFooterData = async () => {
    setSaving(true);
    
    const { error } = await (supabase as any)
      .from("site_design")
      .upsert({ 
        id: "footer", 
        data: footerData,
        updated_at: new Date().toISOString()
      });

    if (error) {
      toast({
        title: "Ошибка сохранения",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Настройки подвала сохранены" });
    }
    
    setSaving(false);
  };

  const addNavItem = () => {
    setHeaderData({
      ...headerData,
      nav_items: [...headerData.nav_items, { label: "", href: "/" }],
    });
  };

  const removeNavItem = (index: number) => {
    setHeaderData({
      ...headerData,
      nav_items: headerData.nav_items.filter((_, i) => i !== index),
    });
  };

  const updateNavItem = (index: number, field: "label" | "href", value: string) => {
    const newItems = [...headerData.nav_items];
    newItems[index] = { ...newItems[index], [field]: value };
    setHeaderData({ ...headerData, nav_items: newItems });
  };

  const moveNavItem = (index: number, direction: "up" | "down") => {
    const newItems = [...headerData.nav_items];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newItems.length) return;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setHeaderData({ ...headerData, nav_items: newItems });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Управление дизайном
        </h2>
        <p className="text-muted-foreground">
          Настройка глобальных элементов сайта: шапка и подвал
        </p>
      </div>

      <Tabs defaultValue="header">
        <TabsList>
          <TabsTrigger value="header">Шапка</TabsTrigger>
          <TabsTrigger value="footer">Подвал</TabsTrigger>
        </TabsList>

        {/* Header Tab */}
        <TabsContent value="header" className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border space-y-6">
            {/* Logo URL */}
            <div className="space-y-2">
              <Label>URL логотипа (оставьте пустым для логотипа по умолчанию)</Label>
              <Input
                value={headerData.logo_url}
                onChange={(e) => setHeaderData({ ...headerData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label>Телефон</Label>
              <Input
                value={headerData.phone}
                onChange={(e) => setHeaderData({ ...headerData, phone: e.target.value })}
                placeholder="+7-xxx-xxx-xx-xx"
              />
            </div>

            {/* CTA Button */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Текст кнопки CTA</Label>
                <Input
                  value={headerData.cta_text}
                  onChange={(e) => setHeaderData({ ...headerData, cta_text: e.target.value })}
                  placeholder="Отправить запрос"
                />
              </div>
              <div className="space-y-2">
                <Label>Ссылка кнопки CTA</Label>
                <Input
                  value={headerData.cta_href}
                  onChange={(e) => setHeaderData({ ...headerData, cta_href: e.target.value })}
                  placeholder="/contacts"
                />
              </div>
            </div>

            {/* Navigation Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Пункты меню</Label>
                <Button variant="outline" size="sm" onClick={addNavItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Добавить
                </Button>
              </div>
              
              <div className="space-y-2">
                {headerData.nav_items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-muted p-3 rounded-lg">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveNavItem(index, "up")}
                        disabled={index === 0}
                        className="h-6 w-6 p-0"
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveNavItem(index, "down")}
                        disabled={index === headerData.nav_items.length - 1}
                        className="h-6 w-6 p-0"
                      >
                        ↓
                      </Button>
                    </div>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Input
                      value={item.label}
                      onChange={(e) => updateNavItem(index, "label", e.target.value)}
                      placeholder="Название"
                      className="flex-1"
                    />
                    <Input
                      value={item.href}
                      onChange={(e) => updateNavItem(index, "href", e.target.value)}
                      placeholder="/path"
                      className="w-32"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNavItem(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={saveHeaderData} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Сохранить настройки шапки
            </Button>
          </div>
        </TabsContent>

        {/* Footer Tab */}
        <TabsContent value="footer" className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <Label>Описание под логотипом</Label>
              <Textarea
                value={footerData.description}
                onChange={(e) => setFooterData({ ...footerData, description: e.target.value })}
                placeholder="Описание компании..."
                rows={3}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label>Телефон в контактах</Label>
              <Input
                value={footerData.phone}
                onChange={(e) => setFooterData({ ...footerData, phone: e.target.value })}
                placeholder="+7-xxx-xxx-xx-xx"
              />
            </div>

            {/* Section Titles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Заголовок "Навигация"</Label>
                <Input
                  value={footerData.nav_title}
                  onChange={(e) => setFooterData({ ...footerData, nav_title: e.target.value })}
                  placeholder="Навигация"
                />
              </div>
              <div className="space-y-2">
                <Label>Заголовок "Продукция"</Label>
                <Input
                  value={footerData.products_title}
                  onChange={(e) => setFooterData({ ...footerData, products_title: e.target.value })}
                  placeholder="Продукция"
                />
              </div>
              <div className="space-y-2">
                <Label>Заголовок "Контакты"</Label>
                <Input
                  value={footerData.contacts_title}
                  onChange={(e) => setFooterData({ ...footerData, contacts_title: e.target.value })}
                  placeholder="Контакты"
                />
              </div>
            </div>

            {/* Copyright */}
            <div className="space-y-2">
              <Label>Копирайт</Label>
              <Input
                value={footerData.copyright}
                onChange={(e) => setFooterData({ ...footerData, copyright: e.target.value })}
                placeholder='ООО "Торговый Дом Импульс". Все права защищены.'
              />
            </div>

            {/* Admin Link */}
            <div className="space-y-2">
              <Label>Текст ссылки "Вход для сотрудников"</Label>
              <Input
                value={footerData.admin_link_text}
                onChange={(e) => setFooterData({ ...footerData, admin_link_text: e.target.value })}
                placeholder="Вход для сотрудников"
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Примечание:</strong> Блок "Продукция" в подвале автоматически подтягивает категории из базы данных. 
                Добавляйте новые категории в разделе "Категории" админ-панели.
              </p>
            </div>

            <Button onClick={saveFooterData} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Сохранить настройки подвала
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DesignManagement;
