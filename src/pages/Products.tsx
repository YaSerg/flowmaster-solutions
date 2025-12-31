import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Filter, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  image_url: string | null;
  specs: string | null;
}

const Products = () => {
  useSEO({
    title: "Клапаны регулирующие, клапаны отсечные, задвижки, запорные клапаны",
    description: "Широкий ассортимент трубопроводной арматуры: клапаны регулирующие, отсечные, запорные, задвижки, шаровые краны для нефтегазовой, энергетической и химической промышленности",
    keywords: "клапаны регулирующие, клапаны отсечные, задвижки, запорные клапаны, шаровые краны, дисковые затворы, трубопроводная арматура",
    canonical: "https://oootdi.ru/products",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([
        (supabase as any).from("product_categories").select("*").order("name"),
        (supabase as any).from("products").select("*").order("name"),
      ]);
      setCategories(catRes.data || []);
      setProducts(prodRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredProducts = activeCategory === "all"
    ? products
    : products.filter(p => p.category_id === activeCategory);

  const parseSpecs = (specs: string | null): string[] => {
    if (!specs) return [];
    return specs.split(",").map(s => s.trim()).filter(Boolean);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-gradient-hero">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
              Каталог продукции
            </h1>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              Широкий ассортимент трубопроводной арматуры для нефтегазовой, 
              энергетической и химической промышленности
            </p>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section className="py-12 lg:py-20 bg-background">
        <div className="container">
          {/* Filters */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Категории:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                Все категории
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              Товаров пока нет
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-hover transition-all duration-300"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Нет фото
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    {product.short_description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {product.short_description}
                      </p>
                    )}
                    {product.specs && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {parseSpecs(product.specs).map((spec, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-muted rounded text-muted-foreground"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}
                    <Button asChild className="w-full">
                      <Link to={`/contacts?product=${encodeURIComponent(product.name)}`}>
                        Отправить запрос
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info */}
      <section className="py-12 lg:py-16 bg-muted">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">
              Не нашли нужную позицию?
            </h2>
            <p className="text-muted-foreground mb-6">
              Мы работаем с широким спектром производителей и можем поставить 
              практически любую трубопроводную арматуру под заказ. Отправьте нам 
              техническое задание, и мы подберем оптимальное решение.
            </p>
            <Button asChild size="lg">
              <Link to="/contacts">Отправить запрос</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
