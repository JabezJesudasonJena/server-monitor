import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc'
import path from 'path';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
  plugins: [swc.vite()],
});
