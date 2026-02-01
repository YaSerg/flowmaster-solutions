import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Генерация sitemap
function generateSitemap() {
  const productPaths = [
    '/products/control-valves-krzd',
    '/products/disk-type-axial-control-isolation-valves-krzdo',
    '/products/fast-acting-cutoff-valves-KOM',
    '/products/control-valves-RK',
    '/products/control-valves-KNP',
    '/products/fast-acting-cutoff-valves-KOG',
  ];

  return {
    name: 'generate-sitemap',
    closeBundle() {
      const staticRoutes = ['/', '/about', '/suppliers', '/contacts'];
      const allRoutes = [...staticRoutes, ...productPaths];

      const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (url) => `<url>
  <loc>https://oootdi.ru${url}</loc>
  <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  <changefreq>weekly</changefreq>
</url>`
  )
  .join('\n')}
</urlset>`;

      fs.writeFileSync(path.resolve(__dirname, 'dist/sitemap.xml'), sitemapContent);
      console.log('Sitemap generated ✅');
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    generateSitemap(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // @/components/... работает
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'), // относительный путь
    },
  },
  esbuild: {
    jsxInject: `/* empty */`, // чтобы сборка не падала на <noscript>
  },
  server: {
    host: true, // dev сервер доступен по IP
    port: 8080,
  },
});
