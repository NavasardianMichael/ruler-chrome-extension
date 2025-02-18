import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from 'vite-plugin-svgr'
import manifest from "./src/manifest";

export default defineConfig({
  plugins: [react(), crx({ manifest }), tsconfigPaths(), svgr({
    include: '**/*.svg',
  }),],
  build: {
    sourcemap: true
  },
  server: {
    port: 5575,
    open: true,
  },
});
