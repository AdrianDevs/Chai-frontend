import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import type { UserConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    react(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    exclude: ['**/node_modules/**', '**/tests/e2e/**'],
  },
} as UserConfig);
