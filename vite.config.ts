import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./src/manifest";

export default defineConfig({
  plugins: [crx({ manifest })],
  build: {
    minify: "esbuild",
  },
  server: {
    port: 5575,
    open: true,
  },
});
