import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { createSitemap } from 'vite-plugin-sitemap';
import fetch from 'node-fetch'; // если fetch не доступен, установи: npm i node-fetch

// Функция для получения динамических маршрутов из Supabase
async function getDynamicRoutes() {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=slug`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  const products = await res.json();
  return products.map((p: { slug: string }) => `/products/${p.slug}`);
}

export default defineConfig({
  plugins: [
    react(),
    createSitemap({
      hostname: 'https://oootdi.ru', // твой сайт
      outDir: 'dist', // куда будет сгенерирован sitemap
      async routes() {
        const staticRoutes = ['/', '/about', '/contact', '/products']; // статические страницы
        const dynamicRoutes = await getDynamicRoutes(); // товары из Supabase
        return [...staticRoutes, ...dynamicRoutes];
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
  esbuild: {
    jsxInject: `/* empty */`,
  },
  server: {
    host: true,
    port: 8080,
  },
});
