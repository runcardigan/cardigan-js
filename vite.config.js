import path from 'path';
import { defineConfig } from 'vite'
import mix from 'vite-plugin-mix'

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
  plugins: [
    {
      ...mix({
        handler: './token.js',
      }),
      apply: 'serve'
    }
  ],
  server: {
    port: 5173
  }
});
