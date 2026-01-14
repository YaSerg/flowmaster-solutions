import { createClient } from '@supabase/supabase-js';

export default async function handler(request, response) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response.status(500).send('<error>Missing Environment Variables</error>');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const staticPages = [
    '',
    '/about',
    '/products',
    '/projects',
    '/suppliers',
    '/contacts'
  ];

  // Запрашиваем данные. Если updated_at еще нет, используем created_at
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('slug, created_at, updated_at');

  const baseUrl = 'https://oootdi.ru';

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Статические страницы
  staticPages.forEach((page) => {
    sitemap += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  // Товары
  if (products && products.length > 0) {
    products.forEach((product) => {
      if (!product.slug) return;
      // Fallback для даты
      const lastMod = product.updated_at || product.created_at || new Date().toISOString();
      sitemap += `
  <url>
    <loc>${baseUrl}/products/${product.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });
  }

  // Логирование ошибки прямо в XML (в комментарий) для отладки
  if (productsError) {
    sitemap += `<!-- Database Error: ${productsError.message} -->`;
  }

  sitemap += `
</urlset>`;

  response.setHeader('Content-Type', 'application/xml');
  response.status(200).send(sitemap);
}
