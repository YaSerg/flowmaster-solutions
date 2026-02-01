import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { ViteSitemap } from 'vite-plugin-sitemap';
import fs from 'fs';

// динамическая генерация ссылок на продукты
const products = fs.existsSync('./src/data/products.json')
  ? JSON.parse(fs.readFileSync('./src/data/products.json', 'utf-8'))
  : [];

const productPaths = products.map(p => `/products/${p.slug}`);

export default defineConfig({
  plugins: [
    react(),
    ViteSitemap({
      hostname: 'https://oootdi.ru',
      routes: [
        '/',
        '/about',
        '/contact',
        ...productPaths
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // чтобы @/components/... работали
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'), // относительный путь
    },
  },
  esbuild: {
    // чтобы сборка не падала на <noscript> в <head>
    jsxInject: `/* empty */`,
  },
  server: {
    host: true, // чтобы dev сервер был доступен по IP
    port: 8080,
  },
});
