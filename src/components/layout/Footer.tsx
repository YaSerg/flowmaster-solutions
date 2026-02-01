import { Link } from "react-router-dom";
import { Phone, Clock } from "lucide-react";
import { useFooterData, useProductCategories, useHeaderData } from "@/hooks/useSiteDesign";
import defaultLogo from "@/assets/logo.png";

const Footer = () => {
  const { data: footerData } = useFooterData();
  const { data: headerData } = useHeaderData();
  const { data: categories } = useProductCategories();

  const description = footerData?.description || "";
  const phone = footerData?.phone || "+7-996-613-88-52";
  const copyright = footerData?.copyright || 'ООО "Торговый Дом Импульс". Все права защищены.';
  const adminLinkText = footerData?.admin_link_text || "Вход для сотрудников";
  const contactsTitle = footerData?.contacts_title || "Контакты";
  const navTitle = footerData?.nav_title || "Навигация";
  const productsTitle = footerData?.products_title || "Продукция";
  
  const logoUrl = headerData?.logo_url || "";
  const navItems = headerData?.nav_items || [];

  // Format phone for tel: link
  const phoneLink = phone.replace(/[^\d+]/g, "");

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <img 
              src={logoUrl || defaultLogo} 
              alt="Торговый Дом Импульс" 
              className="h-12 w-auto brightness-0 invert" 
            />
            <p className="text-secondary-foreground/80 text-sm leading-relaxed">
              {description}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">{navTitle}</h4>
            <nav className="flex flex-col gap-2">
              {navItems.slice(1).map((item) => (
                <Link 
                  key={item.href}
                  to={item.href} 
                  className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Products - Dynamic from categories */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">{productsTitle}</h4>
            <nav className="flex flex-col gap-2">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <Link 
                    key={category.id}
                    to={`/products?category=${category.slug}`} 
                    className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                ))
              ) : (
                <Link 
                  to="/products" 
                  className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors"
                >
                  Все товары
                </Link>
              )}
            </nav>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">{contactsTitle}</h4>
            <div className="flex flex-col gap-3">
              <a
                href={`tel:${phoneLink}`}
                className="flex items-start gap-3 text-sm text-secondary-foreground/70 hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4 mt-0.5 text-primary" />
                {phone}
              </a>
              <Link
                to="/contacts"
                className="flex items-start gap-3 text-sm text-secondary-foreground/70 hover:text-primary transition-colors"
              >
                <Clock className="h-4 w-4 mt-0.5 text-primary" />
                Связаться с нами
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-secondary-foreground/60">
            © {new Date().getFullYear()} {copyright}
          </p>
          <Link to="/admin" className="text-xs text-secondary-foreground/40 hover:text-secondary-foreground/60 transition-colors">
            {adminLinkText}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
