import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
// https://astro.build/config
export default defineConfig({
  integrations: [preact()],
  markdown: {
    shikiConfig: {
      // Choose from Shiki's built-in themes
      // https://github.com/shikijs/shiki/blob/main/docs/themes.md#all-themes
      theme: "dark-plus",
      wrap: true,
    },
  },
});
