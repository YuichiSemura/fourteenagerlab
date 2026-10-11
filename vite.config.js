import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: '/fourteenagerlab',
  build: {
    rolldownOptions: {
      input: {
        main: resolve('src', 'index.html'),
        products: resolve('src', 'products.html'),
        biography: resolve('src', 'biography.html'),
        prescription: resolve('src', 'prescription.html'),
      },
    },
    target: 'esnext',
    // esnext のままだと Lightning CSS が -webkit-backdrop-filter を削除し、iOS 17 以前の Safari でぼかしが消える
    cssTarget: ['chrome107', 'edge107', 'firefox104', 'safari16'],
  },
  server: {
    port: 8080,
  },
  define: {
    global: 'globalThis',
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
        quietDeps: true,
      },
    },
  },
});
