import { defineConfig } from "astro/config";
import breaks from "remark-breaks";
import gfm from "remark-gfm";
import emoji from "remark-emoji";

import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  site: "https://macoshita.me",
  markdown: {
    remarkPlugins: [gfm, emoji, breaks],
    shikiConfig: {
      // Choose from Shiki's built-in themes
      // https://github.com/shikijs/shiki/blob/main/docs/themes.md#all-themes
      theme: "dark-plus",
      wrap: true,
    },
  },
  integrations: [svelte()],
  vite: {
    optimizeDeps: {
      // Ref: https://github.com/evanw/esbuild/issues/1051#issuecomment-1006992549
      exclude: ["@napi-rs/canvas"],
    },
  },
});
