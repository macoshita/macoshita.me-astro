---
title: "Puppeteer で OGP 画像を自動生成"
category: puppeteer-og-image
tags: [Node.js]
createdAt: 2020-09-16 00:00:00 +0900
updated_at: 2020-09-16 00:00:00 +0900
published: true
number: 2
layout: "@/layouts/BlogPostLayout.astro"
---

このブログ、[ISUCON 10 の予選の記事](https://macoshita.me/posts/isucon10-qualifier)を書くに当たって、Netlify CMS + [next.js Blog Template](https://github.com/wutali/nextjs-netlify-blog-template) でデザインをとりあえずなんとかしたやつなんだけど、OGP 画像とかなんにもかんがえてなかったので無事死亡した。

![og:image not found](/images/screenshot-2020-09-16-18.31.16.png)

デフォルト画像をとりあえず変えときゃいいかなとも思ったんだけど、どうせならちょっと作るかーということで、 puppeteer で OGP 画像を生成するようにしてみた。

<https://github.com/macoshita/macoshita.me/blob/master/gen-og-image.ts>

```typescript
import path from "path";
import mkdirp from "mkdirp";
import puppeteer from "puppeteer";
import { fetchPostContent, PostContent } from "./src/lib/posts";

(async () => {
  const ogImageDir = path.resolve(process.cwd(), "./dist/og-image/");
  await mkdirp(ogImageDir);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setViewport({ width: 1200, height: 630 });
  await page.goto(
    `file:${path.resolve(process.cwd(), "./og-image/index.html")}`
  );
  await page.waitForSelector(".wf-active");

  for await (const post of fetchPostContent()) {
    page.evaluate((post) => {
      const p = JSON.parse(post) as PostContent;
      const $ = (id: string): HTMLElement => document.getElementById(id)!;
      $("title").innerText = p.title;
      $("description").innerText = p.tags?.map((t) => `#${t}`).join(" ") ?? "";
    }, JSON.stringify(post));
    await page.screenshot({ path: path.join(ogImageDir, post.slug + ".png") });
  }

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

やっていることは割と単純で、

1. next export が終わったあと、dist の中に og-image ディレクトリを作る
2. ブラウザを立ち上げて、og:image のサイズにする
3. ローカルの og-image/index.html を開く
4. Google Fonts が有効になるのを待つ `waitForSelector('.wf-active')`
5. page.evaluate でタイトルや概要を置き換えてスクショを撮る
6. ↑ をブログのページ数分繰り返す

多分、変更があったページだけに絞るとかしないといつか重すぎて死ぬ、、けどそのときはそのときで。スクショ撮るのはそんなに時間がかからないっぽいので、ぶっちゃけ 100 ページくらいまでは余裕なんじゃないかと思う。

スクショ用の html はこちら → <https://github.com/macoshita/macoshita.me/blob/master/og-image/index.html>
Ajax でローカルのファイルを取ってきたりをしてないので、今の所ローカルサーバ立てなくてもちゃんと表示できる。もし必要が出てきても、gen-og-image.ts でサーバ立ててスクショ取ってサーバ終了、でイケるはず。

大勝利した様子 ↓

![](/images/screenshot-2020-09-16-18.57.22.png)

## 2020/09/28 追記:

原因不明だけどちゃんと動いていない。が、Netlify CMS の入力欄がいまいちすぎるので、早くも違うものを使いたくなってきたので、これ以上詰めるかはあやしい。なかなかブログ環境はいい感じに決まらない……。
