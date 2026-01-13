import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import SafeHTML from "@/components/SafeHTML";

interface Product {
  id: string;
  title: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  image_url: string | null;
  specs: string | null;
  seo_title: string | null;
  seo_description: string | null;
  slug: string | null;
}

interface GalleryImage {
  id: string;
  image_url: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ProductDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      
      // Пытаемся найти по slug, если не нашли - по id
      let productData = null;
      
      // Сначала ищем по slug
      const { data: bySlug } = await (supabase as any)
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      
      if (bySlug) {
        productData = bySlug;
      } else {
        // Если не нашли по slug, ищем по id
        const { data: byId } = await (supabase as any)
          .from("products")
          .select("*")
          .eq("id", slug)
          .maybeSingle();
        productData = byId;
      }

      if (productData) {
        setProduct(productData);
        setSelectedImage(productData.image_url);

        // Fetch gallery
        const { data: galleryData } = await (supabase as any)
          .from("product_gallery")
          .select("*")
          .eq("product_id", productData.id)
          .order("created_at");
        
        if (galleryData) {
          setGallery(galleryData);
        }

        // Fetch category
        if (productData.category_id) {
          const { data: catData } = await (supabase as any)
            .from("product_categories")
            .select("*")
            .eq("id", productData.category_id)
            .maybeSingle();
          
          if (catData) {
            setCategory(catData);
          }
        }
      }

      setLoading(false);
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useSEO({
    title: product?.seo_title || product?.title || "Товар",
    description: product?.seo_description || product?.short_description || "",
    canonical: `https://oootdi.ru/products/${product?.slug || slug}`,
  });

  const parseSpecs = (specs: string | null): string[] => {
    if (!specs) return [];
    return specs.split(",").map(s => s.trim()).filter(Boolean);
  };

  // Все изображения: основное + галерея
  const allImages = [
    ...(product?.image_url ? [product.image_url] : []),
    ...gallery.map(g => g.image_url)
  ];

  if (loading) {
    return (
      <Layout>
        <div className="py-32 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="py-32 text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">
            Товар не найден
          </h1>
          <Button asChild>
            <Link to="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться в каталог
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <section className="py-4 bg-muted">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Главная
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">
              Каталог
            </Link>
            {category && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">{category.name}</span>
              </>
            )}
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {product.title}
            </span>
          </nav>
        </div>
      </section>

      {/* Product Content */}
      <section className="py-12 lg:py-20 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square overflow-hidden rounded-xl border border-border bg-muted">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Нет фото
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === img 
                          ? "border-primary" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.title} - фото ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {category && (
                <span className="inline-block px-3 py-1 text-sm bg-muted rounded-full text-muted-foreground">
                  {category.name}
                </span>
              )}

              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                {product.title}
              </h1>

              {product.short_description && (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {product.short_description}
                </p>
              )}

              {/* Specs */}
              {product.specs && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">Характеристики:</h3>
                  <div className="flex flex-wrap gap-2">
                    {parseSpecs(product.specs).map((spec, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 text-sm bg-muted rounded-lg text-foreground"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="pt-4 border-t border-border">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to={`/contacts?product=${encodeURIComponent(product.title)}`}>
                    Отправить запрос
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <p className="mt-3 text-sm text-muted-foreground">
                  Мы свяжемся с вами в течение рабочего дня
                </p>
              </div>
            </div>
          </div>

          {/* Full Description */}
          {product.description && (
            <div className="mt-12 pt-12 border-t border-border">
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                Описание
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <SafeHTML html={product.description} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Back to Catalog */}
      <section className="py-8 bg-muted">
        <div className="container">
          <Button asChild variant="outline">
            <Link to="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться в каталог
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetails;