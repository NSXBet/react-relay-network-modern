import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  platform: 'neutral', // runs in browser, react-native and node; relies on global fetch
  dts: true,
  clean: true,
  unbundle: true, // keep the source module graph (one output file per source file)
});
