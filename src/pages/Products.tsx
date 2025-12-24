import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Filter } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useSEO } from "@/hooks/useSEO";
import productControlValve from "@/assets/product-control-valve.jpg";
import productBallValve from "@/assets/product-ball-valve.jpg";
import productButterflyValve from "@/assets/product-butterfly-valve.jpg";
import productGateValve from "@/assets/product-gate-valve.jpg";
import productSafetyValve from "@/assets/product-safety-valve.jpg";

const categories = [
  { id: "all", name: "Все категории" },
  { id: "regulating", name: "Регулирующие клапаны" },
  { id: "shutoff", name: "Отсечные клапаны" },
  { id: "gate", name: "Запорные клапаны" },
  { id: "safety", name: "Предохранительные клапаны" },
  { id: "ball", name: "Шаровые краны" },
  { id: "butterfly", name: "Дисковые затворы" },
];

const products = [
  {
    id: 1,
    name: "Клапан регулирующий КР-25",
    category: "regulating",
    image: productControlValve,
    description: "Регулирующий клапан с пневматическим приводом. DN 25-300, PN 16-40. Температура рабочей среды до +450°C.",
    specs: ["DN 25-300", "PN 16-40", "Нерж. сталь"],
  },
  {
    id: 2,
    name: "Клапан отсечной КО-50",
    category: "shutoff",
    image: productBallValve,
    description: "Быстродействующий отсечной клапан с электроприводом. Время закрытия менее 1 сек. Для аварийного отключения.",
    specs: ["DN 50-200", "PN 16-63", "Сталь 20"],
  },
  {
    id: 3,
    name: "Затвор дисковый ЗД-100",
    category: "butterfly",
    image: productButterflyValve,
    description: "Дисковый затвор с редуктором для регулирования потока. Компактная конструкция, простой монтаж.",
    specs: ["DN 50-1200", "PN 10-25", "Чугун/Сталь"],
  },
  {
    id: 4,
    name: "Задвижка клиновая ЗКЛ",
    category: "gate",
    image: productGateValve,
    description: "Клиновая задвижка с выдвижным шпинделем. Надежная конструкция для магистральных трубопроводов.",
    specs: ["DN 50-600", "PN 16-160", "Сталь 20ГЛ"],
  },
  {
    id: 5,
    name: "Клапан предохранительный КП-80",
    category: "safety",
    image: productSafetyValve,
    description: "Пружинный предохранительный клапан. Защита от превышения давления в системе. Сертифицирован РОСТЕХНАДЗОР.",
    specs: ["DN 25-150", "PN 16-250", "Нерж. сталь"],
  },
  {
    id: 6,
    name: "Кран шаровой КШ-150",
    category: "ball",
    image: productBallValve,
    description: "Полнопроходной шаровой кран с ручным или механизированным управлением. Минимальное гидравлическое сопротивление.",
    specs: ["DN 15-500", "PN 16-160", "Сталь/Нерж."],
  },
  {
    id: 7,
    name: "Клапан регулирующе-отсечной",
    category: "regulating",
    image: productControlValve,
    description: "Комбинированный клапан для регулирования и аварийного отключения. Два в одном — экономия пространства.",
    specs: ["DN 25-200", "PN 40-63", "Нерж. 12Х18Н10Т"],
  },
  {
    id: 8,
    name: "Затвор обратный поворотный",
    category: "gate",
    image: productGateValve,
    description: "Обратный клапан с поворотным диском. Предотвращает обратный поток среды. Низкое сопротивление.",
    specs: ["DN 50-1000", "PN 10-40", "Чугун/Сталь"],
  },
];

const Products = () => {
  useSEO({
    title: "Клапаны регулирующие, клапаны отсечные, задвижки, запорные клапаны",
    description: "Широкий ассортимент трубопроводной арматуры: клапаны регулирующие, отсечные, запорные, задвижки, шаровые краны для нефтегазовой, энергетической и химической промышленности",
    keywords: "клапаны регулирующие, клапаны отсечные, задвижки, запорные клапаны, шаровые краны, дисковые затворы, трубопроводная арматура",
    canonical: "https://oootdi.ru/products",
  });

  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProducts = activeCategory === "all"
    ? products
    : products.filter(p => p.category === activeCategory);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-hover transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.specs.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs bg-muted rounded text-muted-foreground"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                  <Button asChild className="w-full">
                    <Link to="/contacts?product=${product.name}">
                      Отправить запрос
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
