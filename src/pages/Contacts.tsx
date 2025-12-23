import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Clock, Send, Paperclip, X, RefreshCw, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";

const generateCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  return { question: `${num1} + ${num2} = ?`, answer: num1 + num2 };
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const Contacts = () => {
  const [searchParams] = useSearchParams();
  const productFromUrl = searchParams.get("product");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: productFromUrl ? `Запрос: ${productFromUrl}` : "",
    message: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (productFromUrl) {
      setFormData(prev => ({ ...prev, subject: `Запрос: ${productFromUrl}` }));
    }
  }, [productFromUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Файл слишком большой",
          description: `Файл "${file.name}" превышает 10 МБ`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });
    
    setFiles(prev => [...prev, ...validFiles].slice(0, 5));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (parseInt(captchaInput) !== captcha.answer) {
      toast({
        title: "Неверный ответ",
        description: "Пожалуйста, решите пример правильно",
        variant: "destructive",
      });
      refreshCaptcha();
      return;
    }

    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Заполните обязательные поля",
        description: "Имя, email и сообщение обязательны",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: "Сообщение отправлено!",
      description: "Мы свяжемся с вами в ближайшее время",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " Б";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " КБ";
    return (bytes / (1024 * 1024)).toFixed(1) + " МБ";
  };

  if (isSubmitted) {
    return (
      <Layout>
        <section className="py-20 lg:py-32 bg-background">
          <div className="container">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-accent" />
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-4">
                Сообщение отправлено!
              </h1>
              <p className="text-muted-foreground mb-8">
                Спасибо за обращение. Наши специалисты свяжутся с вами 
                в течение одного рабочего дня.
              </p>
              <Button onClick={() => {
                setIsSubmitted(false);
                setFormData({ name: "", email: "", phone: "", company: "", subject: "", message: "" });
                setFiles([]);
                refreshCaptcha();
              }}>
                Отправить еще одно сообщение
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-gradient-hero">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
              Контакты
            </h1>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              Свяжитесь с нами для консультации или отправьте запрос 
              на поставку оборудования
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-12 lg:py-20 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                  Контактная информация
                </h2>
              </div>
              
              <div className="space-y-4">
                <a
                  href="tel:+79966138852"
                  className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Телефон</div>
                    <div className="font-semibold text-foreground">+7-996-613-88-52</div>
                  </div>
                </a>
                
                <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Режим работы</div>
                    <div className="font-semibold text-foreground">Пн-Пт: 9:00 - 18:00</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-card p-6 lg:p-8 rounded-xl border border-border shadow-card">
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  Форма обратной связи
                </h2>
                <p className="text-muted-foreground mb-6">
                  Заполните форму, и мы свяжемся с вами в ближайшее время
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Имя *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ваше имя"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+7 (___) ___-__-__"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Компания</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Название компании"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Тема</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Тема обращения"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Сообщение *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Опишите ваш запрос или вопрос..."
                      rows={5}
                      required
                    />
                  </div>
                  
                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>Прикрепить файлы (до 10 МБ каждый)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Paperclip className="h-5 w-5" />
                        <span>Выбрать файлы</span>
                      </button>
                      
                      {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {files.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-muted rounded-lg"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm truncate">{file.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({formatFileSize(file.size)})
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="p-1 hover:bg-destructive/10 rounded transition-colors"
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Поддерживаемые форматы: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, ZIP, RAR
                    </p>
                  </div>
                  
                  {/* Captcha */}
                  <div className="space-y-2">
                    <Label>Защита от спама *</Label>
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 bg-muted rounded-lg font-mono text-lg font-semibold text-foreground">
                        {captcha.question}
                      </div>
                      <Input
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        placeholder="Ответ"
                        className="w-24"
                        required
                      />
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Обновить пример"
                      >
                        <RefreshCw className="h-5 w-5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  
                  <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Отправить сообщение
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact */}
      <section className="py-12 bg-muted">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center">
            <p className="text-muted-foreground">
              Предпочитаете звонить? Наши специалисты на связи:
            </p>
            <a
              href="tel:+79966138852"
              className="flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <Phone className="h-5 w-5" />
              +7-996-613-88-52
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contacts;
