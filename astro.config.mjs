import { defineConfig } from "astro/config";
import emoji from "remark-emoji";
// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [emoji],
    shikiConfig: {
      // Choose from Shiki's built-in themes
      // https://github.com/shikijs/shiki/blob/main/docs/themes.md#all-themes
      theme: "dark-plus",
      wrap: true,
    },
  },
});
