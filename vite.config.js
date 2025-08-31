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
    target: 'esnext',
    minify: 'esbuild',
  },
  server: {
    port: 8080,
    hot: true,
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['@tsparticles/engine'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions'],
        quietDeps: true,
      },
    },
  },
});
