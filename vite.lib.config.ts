// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026
//
// Library build config — produces the distributable npm package artifacts.
//
// Kept SEPARATE from `vite.config.ts` (the demo/GitHub-Pages app build) so
// `npm run build` keeps emitting the demo site unchanged, while
// `npm run build:lib` emits the consumable library. React is a peer and
// jspdf stays external (lazy-loaded via dynamic import only when a consumer
// exercises PDF export) — no second copy of React, no bundled jspdf. dompurify
// is DELIBERATELY bundled (not externalized) so every consumer gets the SVG
// sanitizer out of the box with zero extra installs, since sanitization runs
// unconditionally on every render, not behind an opt-in feature.
// vite-plugin-dts (rollupTypes) emits a single bundled dist/index.d.ts.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import path from 'path'
import { readFileSync } from 'fs'

const pkgVersion = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8')).version

export default defineConfig({
  plugins: [
    react(),
    dts({
      // One bundled dist/index.d.ts (via @microsoft/api-extractor) instead of a
      // tree of per-file .d.ts — hides internal __*ForTest declarations and
      // resolves cleanly under any moduleResolution (no extensionless relative
      // imports in the output). NOTE: vite-plugin-dts v5 calls this option
      // `bundleTypes` (v4 called it `rollupTypes`).
      bundleTypes: true,
      tsconfigPath: './tsconfig.build.json',
      include: ['src'],
      exclude: ['src/main.tsx', 'src/**/__tests__/**', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(pkgVersion),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'odontogram.js',
      // Guarantee a stable, single stylesheet name (dist/style.css).
      cssFileName: 'style',
    },
    // One combined stylesheet instead of per-chunk CSS.
    cssCodeSplit: false,
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // Do NOT bundle React or the one runtime dep — the consumer provides
      // React (peer) and jspdf (dep, lazy-loaded via dynamic import).
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'jspdf',
      ],
    },
  },
})
