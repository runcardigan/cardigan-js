import path from 'path';
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      formats: ['es', 'iife', 'umd'],
      name: 'Cardigan',
      fileName: (format) => format === 'iife' ? 'cardigan.js' : `cardigan.${format}.js`
    }
  },
  plugins: [],
  server: {
    port: 5173
  }
});
