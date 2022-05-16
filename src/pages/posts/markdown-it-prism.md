---
title: Prism.js syntax highlighting on markdown-it
lang: en
category: markdown-it-prism
tags:
createdAt: 2018-03-18 00:00:00 +0900
updated_at: 2018-03-18 00:00:00 +0900
published: true
layout: "@/layouts/BlogPostLayout.astro"
---

[markdown-it](https://github.com/markdown-it/markdown-it) has the `highlight` option.
Apply syntax highlighting to fenced code blocks.

In README.md, use [highlight.js](https://highlightjs.org/) as highlighting engine, but can also use [Prism](http://prismjs.com/).

```js
const MarkdownIt = require("markdown-it");
const Prism = require("prismjs");
require("prismjs/components/prism-javascript");

const md = new MarkdownIt({
  highlight(str, lang) {
    let hl;

    try {
      hl = Prism.highlight(str, Prism.languages[lang]);
    } catch (error) {
      console.error(error);
      hl = md.utils.escapeHtml(str);
    }

    return `<pre class="language-${lang}"><code class="language-${lang}">${hl}</code></pre>`;
  },
});
```

This code works on nodejs.
