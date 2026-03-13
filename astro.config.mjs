import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://portfolio.dev",
  output: "static",
  integrations: [
    mdx(),
    tailwind({ applyBaseStyles: false }),
    react(),
    sitemap(),
  ],
  image: {
    service: { entrypoint: "astro/assets/services/sharp" },
    domains: [],
  },
  vite: {
    build: {
      cssMinify: true,
      rollupOptions: {
        output: { manualChunks: undefined },
      },
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});
