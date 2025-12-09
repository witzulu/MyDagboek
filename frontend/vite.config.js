import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const FRONTEND_PORT = parseInt(env.VITE_PORT) || 7526;
  const BACKEND_PORT = parseInt(env.VITE_BACKEND_PORT) || 8275;
  const BACKEND_HOST = env.VITE_BACKEND_HOST || 'localhost';

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: FRONTEND_PORT,
      proxy: {
        '/api': {
          target: `http://${BACKEND_HOST}:${BACKEND_PORT}`,
          changeOrigin: true,
        },
        '/uploads': {
          target: `http://${BACKEND_HOST}:${BACKEND_PORT}`,
          changeOrigin: true,
        },
      },
    },
  };
});
