import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // The API runs separately (npm run dev -w backend); proxy it so the app
    // and images share one origin in development.
    proxy: { '/api': `http://localhost:${process.env.POCABIN_API_PORT || 4000}` },
  },
});
