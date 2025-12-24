import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Trash2, 
  LogOut, 
  RefreshCw, 
  Eye, 
  Download,
  Settings,
  Inbox,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import logo from "@/assets/logo.png";

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
    title: "Админ-панель ООО ТДИ",
    description: "Административная панель управления заявками",
    keywords: "админ, панель управления",
    canonical: "https://oootdi.ru/admin",
  });

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'leads' | 'settings'>('leads');
  
  // Auth form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer the admin check
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: userId, _role: 'admin' });

      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data === true);
        if (data === true) {
          fetchLeads();
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить заявки",
        variant: "destructive",
      });
    } else {
      setLeads(data || []);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Ошибка входа",
          description: error.message === "Invalid login credentials" 
            ? "Неверный email или пароль" 
            : error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLeads([]);
    setSelectedLeads([]);
  };

  const handleDeleteLead = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    
    // Delete attachment from storage if exists
    if (lead?.attachment_url) {
      const fileName = lead.attachment_url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('attachments').remove([fileName]);
      }
    }

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить заявку",
        variant: "destructive",
      });
    } else {
      setLeads(leads.filter(l => l.id !== leadId));
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
      toast({
        title: "Успешно",
        description: "Заявка удалена",
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedLeads.length === 0) return;

    // Delete attachments
    for (const leadId of selectedLeads) {
      const lead = leads.find(l => l.id === leadId);
      if (lead?.attachment_url) {
        const fileName = lead.attachment_url.split('/').pop();
        if (fileName) {
          await supabase.storage.from('attachments').remove([fileName]);
        }
      }
    }

    const { error } = await supabase
      .from('leads')
      .delete()
      .in('id', selectedLeads);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить заявки",
        variant: "destructive",
      });
    } else {
      setLeads(leads.filter(l => !selectedLeads.includes(l.id)));
      setSelectedLeads([]);
      toast({
        title: "Успешно",
        description: `Удалено заявок: ${selectedLeads.length}`,
      });
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

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast({
          title: "Ошибка",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Успешно",
          description: "Пароль успешно изменен",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const toggleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l.id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Login form
  if (!user) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-xl border border-border shadow-card p-8">
            <div className="text-center mb-8">
              <img src={logo} alt="ТДИ" className="h-12 mx-auto mb-4" />
              <h1 className="text-2xl font-display font-bold text-foreground">
                Вход в систему
              </h1>
              <p className="text-muted-foreground mt-2">
                Админ-панель ООО ТДИ
              </p>
            </div>

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
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Вход...
                  </>
                ) : (
                  "Войти"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-card rounded-xl border border-border shadow-card p-8">
            <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              Доступ запрещен
            </h1>
            <p className="text-muted-foreground mb-6">
              У вас нет прав администратора для доступа к этой странице.
            </p>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </Button>
          </div>
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
          <div className="flex items-center gap-4">
            <img src={logo} alt="ТДИ" className="h-10" />
            <h1 className="text-xl font-display font-bold text-foreground hidden sm:block">
              Админ-панель
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'leads' ? 'default' : 'outline'}
            onClick={() => setActiveTab('leads')}
          >
            <Inbox className="h-4 w-4 mr-2" />
            Заявки
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Настройки
          </Button>
        </div>

        {activeTab === 'leads' && (
          <>
            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchLeads}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Обновить
                </Button>
                {selectedLeads.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Удалить выбранные ({selectedLeads.length})
                  </Button>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Всего заявок: {leads.length}
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {leads.length === 0 ? (
                <div className="p-12 text-center">
                  <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Заявок пока нет</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-4 text-left">
                          <Checkbox
                            checked={selectedLeads.length === leads.length && leads.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Дата</th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Имя</th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Email</th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Телефон</th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Компания</th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Тема</th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Сообщение</th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Файл</th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-muted/50">
                          <td className="p-4">
                            <Checkbox
                              checked={selectedLeads.includes(lead.id)}
                              onCheckedChange={() => toggleSelectLead(lead.id)}
                            />
                          </td>
                          <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(lead.created_at)}
                          </td>
                          <td className="p-4 text-sm font-medium text-foreground">
                            {lead.name}
                          </td>
                          <td className="p-4 text-sm">
                            <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                              {lead.email}
                            </a>
                          </td>
                          <td className="p-4 text-sm">
                            {lead.phone ? (
                              <a href={`tel:${lead.phone}`} className="text-primary hover:underline">
                                {lead.phone}
                              </a>
                            ) : '-'}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {lead.company || '-'}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {lead.subject || '-'}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">
                            {lead.message}
                          </td>
                          <td className="p-4">
                            {lead.attachment_url ? (
                              <a 
                                href={lead.attachment_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                <Download className="h-4 w-4" />
                                {lead.attachment_name || 'Файл'}
                              </a>
                            ) : '-'}
                          </td>
                          <td className="p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLead(lead.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-md">
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-display font-bold text-foreground mb-4">
                Изменить пароль
              </h2>
              
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
                    placeholder="Повторите новый пароль"
                    required
                  />
                </div>
                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    "Сохранить пароль"
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
