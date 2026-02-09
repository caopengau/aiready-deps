import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/button': 'src/components/button.tsx',
    'components/card': 'src/components/card.tsx',
    'components/input': 'src/components/input.tsx',
    'components/label': 'src/components/label.tsx',
    'components/badge': 'src/components/badge.tsx',
    'components/container': 'src/components/container.tsx',
    'components/grid': 'src/components/grid.tsx',
    'components/stack': 'src/components/stack.tsx',
    'components/separator': 'src/components/separator.tsx',
    'components/checkbox': 'src/components/checkbox.tsx',
    'components/radio-group': 'src/components/radio-group.tsx',
    'components/switch': 'src/components/switch.tsx',
    'components/textarea': 'src/components/textarea.tsx',
    'components/select': 'src/components/select.tsx',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  target: 'es2020',
  splitting: false,
  treeshake: true,
});
