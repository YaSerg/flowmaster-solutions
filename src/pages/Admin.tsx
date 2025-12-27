import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { LogOut, Trash2, Download, RefreshCw, Eye, Lock, Loader2 } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  attachment_url: string | null;
  attachment_name: string | null;
  created_at: string;
}

const Admin = () => {
  useSEO({
    title: "Админ-панель | ООО ТДИ",
    description: "Панель администратора",
    canonical: "https://oootdi.ru/admin",
  });

  const { user, isAdmin, loading, signIn, signOut } = useAuth();
  const { toast } = useToast();

  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [leadsLoading, setLeadsLoading] = useState(false);

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Selected lead for preview
  const [previewLead, setPreviewLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    setLeadsLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Ошибка загрузки",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setLeads(data || []);
    }
    setLeadsLoading(false);
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchLeads();
    }
  }, [user, isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({
        title: "Ошибка входа",
        description: error.message,
        variant: "destructive",
      });
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Вы вышли из системы" });
  };

  const toggleLeadSelection = (id: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLeads(newSelected);
  };

  const toggleAllLeads = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map((l) => l.id)));
    }
  };

  const deleteSelectedLeads = async () => {
    if (selectedLeads.size === 0) return;

    const leadsToDelete = leads.filter((l) => selectedLeads.has(l.id));

    // Delete files from storage
    for (const lead of leadsToDelete) {
      if (lead.attachment_url) {
        const fileName = lead.attachment_url.split("/").pop();
        if (fileName) {
          await supabase.storage.from("attachments").remove([fileName]);
        }
      }
    }

    // Delete leads from database
    const { error } = await supabase
      .from("leads")
      .delete()
      .in("id", Array.from(selectedLeads));

    if (error) {
      toast({
        title: "Ошибка удаления",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: `Удалено заявок: ${selectedLeads.size}` });
      setSelectedLeads(new Set());
      fetchLeads();
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Пароли не совпадают",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: "Ошибка",
        description: "Пароль должен быть не менее 6 символов",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Пароль успешно изменен" });
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordChange(false);
    }
    setPasswordLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in - show login form
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-card border border-border">
          <h1 className="text-2xl font-display font-bold text-foreground mb-6 text-center">
            Вход в админ-панель
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Войти
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Доступ запрещен</h1>
          <p className="text-muted-foreground mb-4">У вас нет прав администратора</p>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-foreground">
            Панель администратора
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Button onClick={fetchLeads} variant="outline" disabled={leadsLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${leadsLoading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
          <Button
            onClick={deleteSelectedLeads}
            variant="destructive"
            disabled={selectedLeads.size === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Удалить ({selectedLeads.size})
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowPasswordChange(!showPasswordChange)}
          >
            <Lock className="h-4 w-4 mr-2" />
            Сменить пароль
          </Button>
        </div>

        {/* Password Change Form */}
        {showPasswordChange && (
          <div className="bg-card p-6 rounded-xl border border-border mb-6 max-w-md">
            <h2 className="text-lg font-semibold mb-4">Изменение пароля</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Новый пароль</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Сохранить
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowPasswordChange(false)}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Leads Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={selectedLeads.size === leads.length && leads.length > 0}
                      onCheckedChange={toggleAllLeads}
                    />
                  </th>
                  <th className="p-4 text-left font-medium">Дата</th>
                  <th className="p-4 text-left font-medium">Имя</th>
                  <th className="p-4 text-left font-medium">Email</th>
                  <th className="p-4 text-left font-medium">Компания</th>
                  <th className="p-4 text-left font-medium">Тема</th>
                  <th className="p-4 text-left font-medium">Файл</th>
                  <th className="p-4 text-left font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      {leadsLoading ? "Загрузка..." : "Заявок пока нет"}
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-border hover:bg-muted/50">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedLeads.has(lead.id)}
                          onCheckedChange={() => toggleLeadSelection(lead.id)}
                        />
                      </td>
                      <td className="p-4 whitespace-nowrap">{formatDate(lead.created_at)}</td>
                      <td className="p-4">{lead.name}</td>
                      <td className="p-4">{lead.email}</td>
                      <td className="p-4">{lead.company || "—"}</td>
                      <td className="p-4 max-w-[200px] truncate">{lead.subject || "—"}</td>
                      <td className="p-4">
                        {lead.attachment_url ? (
                          <a
                            href={lead.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <Download className="h-3 w-3" />
                            {lead.attachment_name || "Файл"}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewLead(lead)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead Preview Modal */}
        {previewLead && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setPreviewLead(null)}
          >
            <div
              className="bg-card rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Заявка от {previewLead.name}</h2>
                <Button variant="ghost" size="sm" onClick={() => setPreviewLead(null)}>
                  ✕
                </Button>
              </div>
              <div className="space-y-3 text-sm">
                <p><strong>Дата:</strong> {formatDate(previewLead.created_at)}</p>
                <p><strong>Email:</strong> {previewLead.email}</p>
                {previewLead.phone && <p><strong>Телефон:</strong> {previewLead.phone}</p>}
                {previewLead.company && <p><strong>Компания:</strong> {previewLead.company}</p>}
                {previewLead.subject && <p><strong>Тема:</strong> {previewLead.subject}</p>}
                <div>
                  <strong>Сообщение:</strong>
                  <p className="mt-1 whitespace-pre-wrap bg-muted p-3 rounded-lg">
                    {previewLead.message}
                  </p>
                </div>
                {previewLead.attachment_url && (
                  <p>
                    <strong>Прикрепленный файл:</strong>{" "}
                    <a
                      href={previewLead.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {previewLead.attachment_name || "Скачать"}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
