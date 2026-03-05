import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    alias: {
      '@aiready/cli': path.resolve(__dirname, '../cli/src'),
      '@aiready/core': path.resolve(__dirname, '../core/src'),
      '@aiready/pattern-detect': path.resolve(
        __dirname,
        '../pattern-detect/src'
      ),
      '@aiready/context-analyzer': path.resolve(
        __dirname,
        '../context-analyzer/src'
      ),
      '@aiready/consistency': path.resolve(__dirname, '../consistency/src'),
    },
  },
});
