import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <img src={logo} alt="Торговый Дом Импульс" className="h-12 w-auto brightness-0 invert" />
            <p className="text-secondary-foreground/80 text-sm leading-relaxed">
              Комплексные поставки и производство трубопроводной арматуры для нефтегазовой и энергетической отрасли.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Навигация</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/about" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                О компании
              </Link>
              <Link to="/products" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                Продукция
              </Link>
              <Link to="/projects" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                Наши проекты
              </Link>
              <Link to="/suppliers" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                Для поставщиков
              </Link>
              <Link to="/contacts" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                Контакты
              </Link>
            </nav>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Продукция</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/products" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                Регулирующие клапаны
              </Link>
              <Link to="/products" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                Отсечные клапаны
              </Link>
              <Link to="/products" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                Запорные клапаны
              </Link>
              <Link to="/products" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                Регулирующе-отсечные клапаны
              </Link>
            </nav>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Контакты</h4>
            <div className="flex flex-col gap-3">
              <a
                href="tel:+79966138852"
                className="flex items-start gap-3 text-sm text-secondary-foreground/70 hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 mt-0.5 text-primary" />
                +7-996-613-88-52
              </a>
              <a
                href="mailto:info@oootdi.ru"
                className="flex items-start gap-3 text-sm text-secondary-foreground/70 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 mt-0.5 text-primary" />
                info@oootdi.ru
              </a>
              <div className="flex items-start gap-3 text-sm text-secondary-foreground/70">
                <Clock className="h-4 w-4 mt-0.5 text-primary" />
                Пн-Пт: 9:00 - 18:00
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-secondary-foreground/60">
            © {new Date().getFullYear()} ООО "Торговый Дом Импульс". Все права защищены.
          </p>
          <div className="flex gap-4">
            <Link to="/contacts" className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors">
              Политика конфиденциальности
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
