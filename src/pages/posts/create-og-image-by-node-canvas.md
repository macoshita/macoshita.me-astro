---
title: node.js canvas を使って OGP 画像を自動生成
created_at: 2022-05-06
layout: "@/layouts/BlogPost.astro"
---

かなり前に [puppeteer で作った](/posts/puppeteer-og-image/) ことはあったんだけど、生成に時間がかかりすぎるので、やっぱ node.js で画像生成なら canvas が王道だろうということで作り直した。

## 成果物

https://github.com/macoshita/macoshita.me-astro/blob/1d81716bc541625a7f9135d9d19b856719e187b0/src/pages/og-image/%5Bslug%5D.jpg.ts

![og-image](/og-image/create-og-image-by-node-canvas.jpg)

Astro の [Non-HTML Page](https://docs.astro.build/en/core-concepts/astro-pages/#non-html-pages) として作った。

## 解説

### getStaticPaths

Non-HTML Page では Astro.glob が現状使えないので、早速面倒なことになった。
Astro のテストコードに vite の機能 `import.meta.glob` で全記事取得してくるコードがあったので、それを参考に全記事の slug を無理やり取ってきた。
素直に Astro.glob が使える日を待ちたい。

```ts
export function getStaticPaths() {
  // Ref: https://github.com/withastro/astro/blob/c3f411a7f2d77739cc32e7b7fbceb3d02018238d/packages/astro/test/fixtures/static-build/src/pages/posts.json.js
  const posts = Object.keys(import.meta.glob("../posts/**/*.md"));

  return posts.map((filename) => ({
    params: { slug: filename.replace(/^.*\/(.*)\.md$/, "$1") },
  }));
}
```

またこの glob は VS Code で TypeScript のエラーを吐くので、 `src/import-meta.d.ts` に以下を追加してエラーを解消している。エラーのままでも動きはする。

```ts
// Ref:
// - https://github.com/vitejs/vite/blob/b5c370941bb36bdb420433ca16cea9c2402b9810/packages/vite/types/importMeta.d.ts
// - https://ja.vitejs.dev/guide/env-and-mode.html#typescript-%E7%94%A8%E3%81%AE%E8%87%AA%E5%8B%95%E8%A3%9C%E5%AE%8C
interface GlobOptions {
  as?: string;
}

interface ImportMeta {
  glob<Module = { [key: string]: any }>(
    pattern: string,
    options?: GlobOptions
  ): Record<string, () => Promise<Module>>;

  env: {
    SSR: boolean;
  };
}
```

### ブログのタイトルを書き込む

canvas の drawText では文字の折返しはサポートしていない。
前回 puppeteer 使ったのは、文字の折返しが楽だろうと思ったからだった。
今回は自前でなんとかする必要がある。

以下のように、テキストと最大横幅を入れると、複数行に折返して返してくれる関数を書いた。

```ts
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  return segmenter.segment(text).reduce(
    (lines, segment) => {
      const { width } = ctx.measureText(
        lines[lines.length - 1] + segment.trim()
      );
      if (width > maxWidth) {
        lines.push("");
      }

      lines[lines.length - 1] += segment;
      return lines;
    },
    [""]
  );
}
```

やってることは単純で、

1. [tiny-segmenter](http://chasen.org/~taku/software/TinySegmenter/) を使って日本語を分かち書き
2. 分かち書きした単語を 1 つずつ足していく
3. measureText で文字列の長さを測り、maxWidth をオーバーしたら次の行へ

他、細かいところとして、空白は trim して文字列の長さに含めないようにしている。

この関数をフォントサイズを変更しながら叩き、3 行以下に収まるところでやめ、中央にレンダリングしている。

余談だけど、 `npm i tiny-segmenter` で入るものは作者とは別の方が publish したものだったので、作者のサイトから DL して `src/lib/tiny_segmenter.js` に起き、 `export default TinySegmenter;` を追記した。
https://github.com/macoshita/macoshita.me-astro/blob/1d81716bc541625a7f9135d9d19b856719e187b0/src/lib/tiny_segmenter.js

ちょっとイマイチな改行位置の画像があったりするので、 tiny-segmenter はそのうち変えるかも。

### フォントの読み込み

Astro の Non-HTML ページは Non-HTML といえど Rollup される。
Rollup されることでフォントとの相対位置が変わってしまい、 `../fonts/font.ttf` とか書いてもそこに存在してくれるとは限らない。

import でファイルパスを取得してうまく加工するとか、import `?raw` つけてどこかに保存するとか考えたが、今回は SSG で動けばいいので、 `process.cwd()` で rollup 後だろうが同じパスを使って動くようにした。
そもそも Non-HTML は Rollup しなくていいんじゃないかと思わなくもない。

```ts
// only static build
registerFont(path.resolve(process.cwd(), "fonts/KiwiMaru-Regular.ttf"), {
  family: "KiwiMaru",
});
```

## まとめ

黒字によさげなフォントで書くだけで十分それっぽくなることがわかった（）

Astro の Non-HTML での生成はまだイマイチなところがある。 `Astro.*` は使えるようにならないとちょっと厳しい。
