const { resolve } = require('path');
const { defineConfig } = require('vite');

export default defineConfig({
  root: resolve(__dirname, 'src'),
  resolve: {
    alias: {
      '~bootstrap': resolve(__dirname, 'node_modules/bootstrap'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, '/index.html'),
        products: resolve(__dirname, '/products.html'),
        biography: resolve(__dirname, '/biography.html'),
        prescription: resolve(__dirname, '/prescription.html'),
      },
    },
  },
  server: {
    port: 8080,
    hot: true,
  },
});
