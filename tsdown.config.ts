import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'lib/index.ts',
    transform: 'lib/transform/index.ts',
  },
  outDir: 'dist',
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
});
