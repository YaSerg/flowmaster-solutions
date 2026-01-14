import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
};

const SITE_URL = 'https://tdi-valves.ru';

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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch products
    const { data: products, error: productsError } = await (supabase as any)
      .from('products')
      .select('id, slug, updated_at')
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products:', productsError);
    }

    // Fetch projects
    const { data: projects, error: projectsError } = await (supabase as any)
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
      for (const product of products) {
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

    // Add project pages (projects use modal, not separate pages, but we include /projects)
    // If there were individual project pages like /projects/:id, we would add them here
    // Based on App.tsx, there's no /projects/:id route, only /projects
    // But let's add them anyway for future SEO benefit
    if (projects && projects.length > 0) {
      for (const project of projects) {
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

    return new Response(xml, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`,
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  }
});
