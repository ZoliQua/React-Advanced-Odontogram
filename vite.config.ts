// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Advanced-Odontogram
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { readFileSync } from 'fs'

// Inject the package version as a build-time constant (single source of truth =
// package.json) so the PDF report footer can stamp the generating version
// without bundling package.json into the output.
const pkgVersion = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8')).version

// Spec policy plus three additive hardenings: `blob:` in img-src (the PNG/JPG
// export path rasterizes the SVG through a blob URL <img>), object-src 'none',
// and base-uri 'self'. Build-only: the dev server needs Vite's inline preamble.
const CSP_CONTENT =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; " +
  "object-src 'none'; base-uri 'self'";

function injectCsp() {
  return {
    name: "inject-csp",
    apply: "build" as const,
    transformIndexHtml() {
      return [{
        tag: "meta",
        attrs: { "http-equiv": "Content-Security-Policy", content: CSP_CONTENT },
        injectTo: "head-prepend" as const,
      }];
    },
  };
}

export default defineConfig({
  plugins: [react(), injectCsp()],
  define: {
    __APP_VERSION__: JSON.stringify(pkgVersion),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
