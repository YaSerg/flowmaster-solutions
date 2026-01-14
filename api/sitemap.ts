import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://oootdi.ru';

// Static pages from App.tsx (excluding /admin and 404)
const staticPages = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/about', priority: '0.8', changefreq: 'monthly' },
  { loc: '/products', priority: '0.9', changefreq: 'weekly' },
  { loc: '/projects', priority: '0.8', changefreq: 'weekly' },
  { loc: '/suppliers', priority: '0.7', changefreq: 'monthly' },
  { loc: '/contacts', priority: '0.8', changefreq: 'monthly' },
];

function formatDate(date: string | null): string {
  if (!date) return new Date().toISOString().split('T')[0];
  return new Date(date).toISOString().split('T')[0];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS and content type headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Use environment variables (Vercel will provide these)
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return res.status(200).send(generateFallbackSitemap());
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, slug, updated_at')
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products:', productsError);
    }

    // Fetch projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, updated_at')
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
    }

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add product pages
    if (products && products.length > 0) {
      for (const product of products as any[]) {
        const slug = product.slug || product.id;
        xml += `  <url>
    <loc>${SITE_URL}/products/${escapeXml(slug)}</loc>
    <lastmod>${formatDate(product.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    // Add project pages
    if (projects && projects.length > 0) {
      for (const project of projects as any[]) {
        xml += `  <url>
    <loc>${SITE_URL}/projects/${escapeXml(project.id)}</loc>
    <lastmod>${formatDate(project.updated_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    xml += `</urlset>`;

    console.log(`Sitemap generated: ${staticPages.length} static pages, ${products?.length || 0} products, ${projects?.length || 0} projects`);

    return res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return res.status(200).send(generateFallbackSitemap());
  }
}

function generateFallbackSitemap(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`;
}
