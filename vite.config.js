import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
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
