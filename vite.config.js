import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: '/fourteenagerlab',
  resolve: {
    alias: {
      '~bootstrap': resolve(process.cwd(), 'node_modules/bootstrap'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve('src', 'index.html'),
        products: resolve('src', 'products.html'),
        biography: resolve('src', 'biography.html'),
        prescription: resolve('src', 'prescription.html'),
      },
    },
  },
  server: {
    port: 8080,
    hot: true,
  },
});
