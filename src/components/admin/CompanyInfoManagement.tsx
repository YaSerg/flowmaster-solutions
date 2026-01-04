import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

interface CompanyInfo {
  id: number;
  title: string;
  content: string | null;
  updated_at: string;
}

const CompanyInfoManagement = () => {
  const { toast } = useToast();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");

  const fetchCompanyInfo = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("company_info")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      toast({ title: "Ошибка загрузки", description: error.message, variant: "destructive" });
    } else if (data) {
      setCompanyInfo(data);
      setEditedTitle(data.title || "");
      setEditedContent(data.content || "");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const saveCompanyInfo = async () => {
    setSaving(true);

    const { error } = await (supabase as any)
      .from("company_info")
      .update({
        title: editedTitle,
        content: editedContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) {
      toast({ title: "Ошибка сохранения", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Информация о компании сохранена" });
      fetchCompanyInfo();
    }
    setSaving(false);
  };

  const hasChanges =
    companyInfo &&
    (editedTitle !== (companyInfo.title || "") || editedContent !== (companyInfo.content || ""));

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </div>
    );
  }

  if (!companyInfo) {
    return (
      <div className="p-6 bg-card rounded-xl border border-border">
        <p className="text-muted-foreground">
          Запись не найдена. Добавьте запись с id=1 в таблицу company_info.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">О компании</h2>
        <Button onClick={saveCompanyInfo} disabled={saving || !hasChanges}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Сохранить
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyTitle">Заголовок</Label>
          <Input
            id="companyTitle"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Заголовок секции о компании"
          />
        </div>

        <div className="space-y-2">
          <Label>Содержимое</Label>
          <RichTextEditor content={editedContent} onChange={setEditedContent} />
        </div>

        {companyInfo.updated_at && (
          <p className="text-xs text-muted-foreground">
            Последнее изменение: {new Date(companyInfo.updated_at).toLocaleString("ru-RU")}
          </p>
        )}
      </div>
    </div>
  );
};

export default CompanyInfoManagement;
