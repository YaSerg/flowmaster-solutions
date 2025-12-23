import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const navItems = [
  { label: "Главная", href: "/" },
  { label: "О компании", href: "/about" },
  { label: "Продукция", href: "/products" },
  { label: "Проекты", href: "/projects" },
  { label: "Для поставщиков", href: "/suppliers" },
  { label: "Контакты", href: "/contacts" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/95 backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
          <img src={logo} alt="Торговый Дом Импульс" className="h-14 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-md hover:bg-muted hover:text-primary ${
                location.pathname === item.href
                  ? "text-primary bg-primary/5"
                  : "text-foreground/80"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Phone & CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <a
            href="tel:+79966138852"
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            <Phone className="h-4 w-4 text-primary" />
            +7-996-613-88-52
          </a>
          <Button asChild size="sm">
            <Link to="/contacts">Отправить запрос</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
          aria-label="Меню"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden border-t border-border bg-card animate-fade-in">
          <nav className="container py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 text-sm font-medium transition-colors rounded-md hover:bg-muted ${
                  location.pathname === item.href
                    ? "text-primary bg-primary/5"
                    : "text-foreground/80"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-border">
              <a
                href="tel:+79966138852"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-foreground"
              >
                <Phone className="h-4 w-4 text-primary" />
                +7-996-613-88-52
              </a>
              <Button asChild className="w-full mt-3">
                <Link to="/contacts" onClick={() => setIsOpen(false)}>
                  Отправить запрос
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
