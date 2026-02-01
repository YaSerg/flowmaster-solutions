import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';

const app = express();
app.use(cors());

// Supabase
const supabaseUrl = 'https://hrhpuupyyopgbwhonhcc.supabase.co';
const supabaseKey = 'sb_publishable_ky754fLUeA3zg-Ob6vYDcw_51oVLkaR';
const supabase = createClient(supabaseUrl, supabaseKey);

const PORT = process.env.PORT || 8080;

// Статические страницы с lastmod
const staticPages = [
  { url: '/', lastmod: '2026-02-01' },
  { url: '/about', lastmod: '2026-02-01' },
  { url: '/suppliers', lastmod: '2026-02-01' },
  { url: '/contacts', lastmod: '2026-02-01' }
];

// Генерация sitemap
app.get('/sitemap.xml', async (req, res) => {
  try {
    const { data: products } = await supabase.from('products').select('slug, updated_at');
    const { data: projects } = await supabase.from('projects').select('slug, updated_at');

    let urls = '';

    // Статические страницы
    staticPages.forEach(page => {
      urls += `<url><loc>https://oootdi.ru${page.url}</loc><lastmod>${page.lastmod}</lastmod></url>\n`;
    });

    // Продукты
    if (products) {
      products.forEach(p => {
        const lastmod = p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : '2026-02-01';
        urls += `<url><loc>https://oootdi.ru/products/${encodeURIComponent(p.slug)}</loc><lastmod>${lastmod}</lastmod></url>\n`;
      });
    }

    // Проекты
    if (projects) {
      projects.forEach(pr => {
        const lastmod = pr.updated_at ? new Date(pr.updated_at).toISOString().split('T')[0] : '2026-02-01';
        urls += `<url><loc>https://oootdi.ru/projects/${encodeURIComponent(pr.slug || '')}</loc><lastmod>${lastmod}</lastmod></url>\n`;
      });
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
