import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
  plugins: [swc.vite()]
});
