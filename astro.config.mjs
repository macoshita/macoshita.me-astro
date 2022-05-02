import { defineConfig } from "astro/config";
import breaks from "remark-breaks";
import gfm from "remark-gfm";
import emoji from "remark-emoji";

import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [gfm, emoji, breaks],
    shikiConfig: {
      // Choose from Shiki's built-in themes
      // https://github.com/shikijs/shiki/blob/main/docs/themes.md#all-themes
      theme: "dark-plus",
      wrap: true
    }
  },
  integrations: [svelte()]
});