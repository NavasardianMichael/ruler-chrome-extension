import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import react from '@vitejs/plugin-react'
import manifest from "./src/manifest";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  server: {
    port: 5575,
    open: true,
  },
});
