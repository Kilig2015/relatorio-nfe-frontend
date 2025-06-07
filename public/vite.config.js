import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Define a URL de backend como variável de ambiente
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  define: {
    'process.env': process.env,
  },
});
