import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/deepl': {
        target: 'https://api.deepl.com/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/deepl/, ''),
        headers: {
          'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_AUTH_KEY || ''}`
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
