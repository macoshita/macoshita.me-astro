---
title: TinySegmenter を Intl.Segmenter で置き換えた
createdAt: 2024-01-12 21:16:00 +09:00
tags: [Astro, Node.js]
layout: "@/layouts/BlogPostLayout.astro"
---

[Intl.Segmenter](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter) という、Node.js や Deno に組み込まれてる形態素解析 API を知ったので、TinySegmenter を置き換えた。

実はこのブログの OGP で使っていた。

![og-image](/og-image/silhouette-game.jpg)

OGP をどう作ってるかは [こちら](/posts/create-og-image-by-node-canvas/) 。

ちなみに話題の [BudouX](https://github.com/google/budoux/tree/main/javascript/) も検討したけど、 `[ 'オレオレ webpack loader 作って', ' nuxt に', '導入する', 'メモ' ]` みたいに 1 単語がやたら長い区切りになることがあって、今の実装をそこそこ修正する必要があったのでやめた。
