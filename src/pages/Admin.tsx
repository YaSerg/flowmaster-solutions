import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { 
  LogOut, Trash2, Download, RefreshCw, Eye, Lock, Loader2, 
  Search, Users, Plus, X, RotateCcw, Archive, Package, FileText, Briefcase, Palette, Newspaper
} from "lucide-react";
import ProductsManagement from "@/components/admin/ProductsManagement";
import PagesContentManagement from "@/components/admin/PagesContentManagement";
import ProjectsManagement from "@/components/admin/ProjectsManagement";
import DesignManagement from "@/components/admin/DesignManagement";
import NewsManagement from "@/components/admin/NewsManagement";

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
  is_read: boolean;
  is_deleted: boolean;
}

interface StaffUser {
  id: string;
  email: string;
  created_at: string;
}

const MAIN_ADMIN_EMAIL = "info@oootdi.ru";

const Admin = () => {
  useSEO({
    title: "Админ-панель | ООО ТДИ",
    description: "Панель администратора",
    canonical: "https://oootdi.ru/admin",
  });

  const { user, loading, signIn, signOut } = useAuth();
  const { toast } = useToast();

  // Access control state
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [accessLoading, setAccessLoading] = useState(true);

  // Check if user is main admin
  const isMainAdmin = user?.email === MAIN_ADMIN_EMAIL;

  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [activeLeadsTab, setActiveLeadsTab] = useState<"active" | "deleted">("active");

  // Main navigation tab
  const [mainTab, setMainTab] = useState<"leads" | "products" | "projects" | "content" | "design" | "news">("leads");

  // Search/filter state
  const [searchQuery, setSearchQuery] = useState("");

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Selected lead for preview
  const [previewLead, setPreviewLead] = useState<Lead | null>(null);

  // Staff management state
  const [showStaffManagement, setShowStaffManagement] = useState(false);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [addingStaff, setAddingStaff] = useState(false);

  // Staff password reset state
  const [resetPasswordStaff, setResetPasswordStaff] = useState<StaffUser | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  // Created staff password display
  const [createdStaffPassword, setCreatedStaffPassword] = useState<string | null>(null);

  // Check if user is authorized (main admin or in staff_users table)
  const checkAuthorization = async () => {
    if (!user) {
      setIsAuthorized(null);
      setAccessLoading(false);
      return;
    }

    setAccessLoading(true);

    // Main admin always authorized
    if (user.email === MAIN_ADMIN_EMAIL) {
      setIsAuthorized(true);
      setAccessLoading(false);
      return;
    }

    // Check if user is in staff_users table
    // Using any to bypass TypeScript since staff_users is not in generated types
    const { data, error } = await (supabase as any)
      .from("staff_users")
      .select("email")
      .eq("email", user.email)
      .maybeSingle();

    if (!error && data) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
    setAccessLoading(false);
  };

  useEffect(() => {
    if (!loading) {
      checkAuthorization();
    }
  }, [user, loading]);

  const fetchLeads = async () => {
    setLeadsLoading(true);
    // Using any to bypass TypeScript since is_read/is_deleted are not in generated types
    const { data, error } = await (supabase as any)
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
      setLeads((data || []) as Lead[]);
    }
    setLeadsLoading(false);
  };

  const fetchStaffUsers = async () => {
    setStaffLoading(true);
    const { data, error } = await (supabase as any)
      .from("staff_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Ошибка загрузки сотрудников",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setStaffUsers((data || []) as StaffUser[]);
    }
    setStaffLoading(false);
  };

  useEffect(() => {
    if (user && isAuthorized) {
      fetchLeads();
      if (isMainAdmin) {
        fetchStaffUsers();
      }
    }
  }, [user, isAuthorized, isMainAdmin]);

  // Mark lead as read
  const markAsRead = async (leadId: string) => {
    const { error } = await (supabase as any)
      .from("leads")
      .update({ is_read: true })
      .eq("id", leadId);

    if (!error) {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, is_read: true } : lead
        )
      );
    }
  };

  // Open lead preview and mark as read
  const openLeadPreview = async (lead: Lead) => {
    setPreviewLead(lead);
    if (!lead.is_read) {
      await markAsRead(lead.id);
    }
  };

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
    setIsAuthorized(false);
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

  const toggleAllLeads = (filteredLeads: Lead[]) => {
    if (selectedLeads.size === filteredLeads.length && filteredLeads.length > 0) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  // Soft delete - set is_deleted = true
  const softDeleteSelectedLeads = async () => {
    if (selectedLeads.size === 0) return;

    const { error } = await (supabase as any)
      .from("leads")
      .update({ is_deleted: true })
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

  // Restore deleted leads
  const restoreSelectedLeads = async () => {
    if (selectedLeads.size === 0) return;

    const { error } = await (supabase as any)
      .from("leads")
      .update({ is_deleted: false })
      .in("id", Array.from(selectedLeads));

    if (error) {
      toast({
        title: "Ошибка восстановления",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: `Восстановлено заявок: ${selectedLeads.size}` });
      setSelectedLeads(new Set());
      fetchLeads();
    }
  };

  // Permanent delete
  const permanentDeleteSelectedLeads = async () => {
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
      toast({ title: `Удалено навсегда: ${selectedLeads.size}` });
      setSelectedLeads(new Set());
      fetchLeads();
    }
  };

  // Staff management
  const addStaffUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newStaffEmail.trim().toLowerCase();
    const password = newStaffPassword.trim();

    if (!email || !password) {
      toast({
        title: "Ошибка",
        description: "Заполните email и пароль",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Ошибка",
        description: "Пароль должен быть не менее 6 символов",
        variant: "destructive",
      });
      return;
    }

    setAddingStaff(true);

    // Step 1: Create user account via signUp
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });

    if (signUpError) {
      toast({
        title: "Ошибка регистрации",
        description: signUpError.message,
        variant: "destructive",
      });
      setAddingStaff(false);
      return;
    }

    // Step 2: Add email to staff_users table
    const { error: insertError } = await (supabase as any)
      .from("staff_users")
      .insert({ email });

    if (insertError) {
      toast({
        title: "Ошибка добавления в список сотрудников",
        description: insertError.message,
        variant: "destructive",
      });
    } else {
      // Show created password to admin
      setCreatedStaffPassword(password);
      toast({ 
        title: "Сотрудник добавлен", 
        description: `Аккаунт создан для ${email}` 
      });
      setNewStaffEmail("");
      setNewStaffPassword("");
      fetchStaffUsers();
    }
    setAddingStaff(false);
  };

  // Reset staff password (uses edge function or shows instructions)
  const handleResetStaffPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordStaff || resetPasswordValue.length < 6) {
      toast({
        title: "Ошибка",
        description: "Пароль должен быть не менее 6 символов",
        variant: "destructive",
      });
      return;
    }

    setResetPasswordLoading(true);
    
    // Note: supabase.auth.admin.updateUserById() requires service role key
    // which is not available on client side. We'll show instructions instead.
    toast({
      title: "Сброс пароля",
      description: `Для сброса пароля сотрудника ${resetPasswordStaff.email} используйте функцию "Забыли пароль" на странице входа или обратитесь в поддержку Lovable Cloud.`,
    });
    
    setResetPasswordLoading(false);
    setResetPasswordStaff(null);
    setResetPasswordValue("");
  };

  const removeStaffUser = async (id: string) => {
    const { error } = await (supabase as any)
      .from("staff_users")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Ошибка удаления",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Сотрудник удален" });
      fetchStaffUsers();
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

  // Filter leads
  const filterLeads = (leadsToFilter: Lead[]) => {
    if (!searchQuery.trim()) return leadsToFilter;
    
    const query = searchQuery.toLowerCase();
    return leadsToFilter.filter(
      (lead) =>
        (lead.company && lead.company.toLowerCase().includes(query)) ||
        (lead.subject && lead.subject.toLowerCase().includes(query))
    );
  };

  const activeLeads = filterLeads(leads.filter((l) => !l.is_deleted));
  const deletedLeads = filterLeads(leads.filter((l) => l.is_deleted));

  // Show loading while auth or access check is in progress
  if (loading || (user && accessLoading)) {
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

  // Logged in but not authorized (only show after loading is complete)
  if (user && isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Доступ запрещен</h1>
          <p className="text-muted-foreground mb-4">У вас нет прав доступа к админ-панели</p>
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
              {isMainAdmin && (
                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  Главный админ
                </span>
              )}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Main Navigation Tabs */}
        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as any)} className="mb-6">
          <TabsList className="mb-6">
            <TabsTrigger value="leads" className="gap-2">
              <Eye className="h-4 w-4" />
              Заявки
            </TabsTrigger>
            {isMainAdmin && (
              <>
                <TabsTrigger value="products" className="gap-2">
                  <Package className="h-4 w-4" />
                  Товары
                </TabsTrigger>
                <TabsTrigger value="content" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Контент
                </TabsTrigger>
                <TabsTrigger value="projects" className="gap-2">
                  <Briefcase className="h-4 w-4" />
                  Проекты
                </TabsTrigger>
                <TabsTrigger value="news" className="gap-2">
                  <Newspaper className="h-4 w-4" />
                  Новости
                </TabsTrigger>
                <TabsTrigger value="design" className="gap-2">
                  <Palette className="h-4 w-4" />
                  Дизайн
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Leads Tab */}
          <TabsContent value="leads">
            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Button onClick={fetchLeads} variant="outline" disabled={leadsLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${leadsLoading ? "animate-spin" : ""}`} />
                Обновить
              </Button>
              
              {activeLeadsTab === "active" ? (
                <Button
                  onClick={softDeleteSelectedLeads}
                  variant="destructive"
                  disabled={selectedLeads.size === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить ({selectedLeads.size})
                </Button>
              ) : isMainAdmin ? (
                <>
                  <Button
                    onClick={restoreSelectedLeads}
                    variant="secondary"
                    disabled={selectedLeads.size === 0}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Восстановить ({selectedLeads.size})
                  </Button>
                  <Button
                    onClick={permanentDeleteSelectedLeads}
                    variant="destructive"
                    disabled={selectedLeads.size === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Удалить навсегда ({selectedLeads.size})
                  </Button>
                </>
              ) : null}

              <Button
                variant="secondary"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
              >
                <Lock className="h-4 w-4 mr-2" />
                Сменить пароль
              </Button>

              {isMainAdmin && (
                <Button
                  variant="outline"
                  onClick={() => setShowStaffManagement(!showStaffManagement)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Сотрудники
                </Button>
              )}
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по компании или теме..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
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

            {/* Staff Management (Main Admin Only) */}
            {isMainAdmin && showStaffManagement && (
              <div className="bg-card p-6 rounded-xl border border-border mb-6 max-w-md">
                <h2 className="text-lg font-semibold mb-4">Управление сотрудниками</h2>
                
                {/* Created password notification */}
                {createdStaffPassword && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      <strong>Аккаунт создан!</strong> Обязательно передайте сотруднику его временный пароль: <code className="bg-green-500/20 px-1 rounded">{createdStaffPassword}</code>, так как в целях безопасности он не хранится в открытом виде.
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setCreatedStaffPassword(null)}
                    >
                      Закрыть
                    </Button>
                  </div>
                )}
                
                <form onSubmit={addStaffUser} className="space-y-3 mb-4">
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Пароль (мин. 6 символов)"
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" disabled={addingStaff} className="w-full">
                    {addingStaff ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Добавить сотрудника
                  </Button>
                </form>

                {staffLoading ? (
                  <div className="text-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  </div>
                ) : staffUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Сотрудников пока нет</p>
                ) : (
                  <ul className="space-y-2">
                    {staffUsers.map((staff) => (
                      <li
                        key={staff.id}
                        className="flex items-center justify-between bg-muted p-2 rounded-lg"
                      >
                        <span className="text-sm">{staff.email}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setResetPasswordStaff(staff)}
                            title="Сбросить пароль"
                          >
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStaffUser(staff.id)}
                            title="Удалить"
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Reset Password Modal */}
            {resetPasswordStaff && (
              <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                onClick={() => setResetPasswordStaff(null)}
              >
                <div
                  className="bg-card rounded-xl p-6 max-w-sm w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-lg font-semibold mb-4">
                    Сброс пароля: {resetPasswordStaff.email}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Для сброса пароля сотрудника попросите его использовать функцию «Забыли пароль» на странице входа.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setResetPasswordStaff(null)}
                    >
                      Закрыть
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Leads Tabs */}
            <Tabs 
              value={activeLeadsTab} 
              onValueChange={(v) => {
                setActiveLeadsTab(v as "active" | "deleted");
                setSelectedLeads(new Set());
              }}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="active" className="gap-2">
                  Активные
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    {leads.filter((l) => !l.is_deleted).length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="deleted" className="gap-2">
                  <Archive className="h-4 w-4" />
                  Удаленные
                  <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                    {leads.filter((l) => l.is_deleted).length}
                  </span>
                </TabsTrigger>
              </TabsList>

              {!isMainAdmin && activeLeadsTab === "deleted" && (
                <div className="mb-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                  Вы можете просматривать удалённые заявки, но не можете их восстанавливать или удалять.
                </div>
              )}

              <TabsContent value="active">
                <LeadsTable
                  leads={activeLeads}
                  selectedLeads={selectedLeads}
                  toggleLeadSelection={toggleLeadSelection}
                  toggleAllLeads={() => toggleAllLeads(activeLeads)}
                  openLeadPreview={openLeadPreview}
                  formatDate={formatDate}
                  leadsLoading={leadsLoading}
                  showCheckboxes={true}
                />
              </TabsContent>

              <TabsContent value="deleted">
                <LeadsTable
                  leads={deletedLeads}
                  selectedLeads={selectedLeads}
                  toggleLeadSelection={toggleLeadSelection}
                  toggleAllLeads={() => toggleAllLeads(deletedLeads)}
                  openLeadPreview={openLeadPreview}
                  formatDate={formatDate}
                  leadsLoading={leadsLoading}
                  showCheckboxes={isMainAdmin}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>


          {/* Products Tab */}
          <TabsContent value="products">
            <ProductsManagement />
          </TabsContent>

          {/* Site Content Tab */}
          <TabsContent value="content">
            <PagesContentManagement />
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <ProjectsManagement />
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news">
            <NewsManagement />
          </TabsContent>

          {/* Design Tab */}
          <TabsContent value="design">
            <DesignManagement />
          </TabsContent>
        </Tabs>

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

// Leads Table Component
interface LeadsTableProps {
  leads: Lead[];
  selectedLeads: Set<string>;
  toggleLeadSelection: (id: string) => void;
  toggleAllLeads: () => void;
  openLeadPreview: (lead: Lead) => void;
  formatDate: (dateStr: string) => string;
  leadsLoading: boolean;
  showCheckboxes: boolean;
}

const LeadsTable = ({
  leads,
  selectedLeads,
  toggleLeadSelection,
  toggleAllLeads,
  openLeadPreview,
  formatDate,
  leadsLoading,
  showCheckboxes,
}: LeadsTableProps) => {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {showCheckboxes && (
                <th className="p-4 text-left">
                  <Checkbox
                    checked={selectedLeads.size === leads.length && leads.length > 0}
                    onCheckedChange={toggleAllLeads}
                  />
                </th>
              )}
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
                <td colSpan={showCheckboxes ? 8 : 7} className="p-8 text-center text-muted-foreground">
                  {leadsLoading ? "Загрузка..." : "Заявок нет"}
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  className={`border-t border-border hover:bg-muted/50 transition-colors ${
                    !lead.is_read ? "bg-primary/5 font-medium" : ""
                  }`}
                >
                  {showCheckboxes && (
                    <td className="p-4">
                      <Checkbox
                        checked={selectedLeads.has(lead.id)}
                        onCheckedChange={() => toggleLeadSelection(lead.id)}
                      />
                    </td>
                  )}
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {!lead.is_read && (
                        <span className="w-2 h-2 bg-primary rounded-full" />
                      )}
                      {formatDate(lead.created_at)}
                    </div>
                  </td>
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
                      onClick={() => openLeadPreview(lead)}
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
  );
};

export default Admin;
