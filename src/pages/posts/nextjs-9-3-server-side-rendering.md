---
title: Server Side Rendering を好きになれる NEXT.JS 9.3
category: nextjs-9-3-server-side-rendering
tags:
created_at: 2020-03-23 00:00:00 +0900
updated_at: 2020-03-23 00:00:00 +0900
published: true
layout: "@/layouts/BlogPost.astro"
---

最近は大体 Vue か Flutter を書いてるのだけど、 [NEXT.JS 9.3](https://nextjs.org/blog/next-9-3) でついに SSG が理想的な形で入ったので、 Nuxt.js で雑に作ったブログを NEXT.JS に置き換え、ついでに [NetlifyCMS](https://www.netlifycms.org/) を導入したりしていた。成果物はこのブログ。

NEXT.JS 9.3 の目玉は Data Fetching の方法が以下の 3 本柱になったこと。

- `getStaticProps/Paths` によるビルド時の Data Fetching
- `getServerSideProps` によるサーバサイドでの Data Fetching
- [`useSWR`](https://github.com/zeit/swr) によるクライアントサイドでの Data Fetching

この中でも、 `getServerSideProps` と `useSWR` の組み合わせは、 Server Side Rendering(SSR) があまり好きでない自分も「これなら良さそう」と思える使い心地だった。

自分は Nuxt `asyncData` と 9.3 以前の NEXT `getInitialProps` くらいでしかちゃんと SSR を使ったアプリを書いたことはない（と思う）が、どちらも、
「一発目のデータ取得はサーバサイドで行われて、それ以降のページ遷移でのデータ取得はクライアントサイドで行われる」
という方式である。

この挙動はときに思わぬ挙動をし、 **「リロードだと動くのに別ページからのページ遷移だと動かない :innocent: 」** といった気づきにくいバグを生む。

対して `getServerSideProps` は、 **「毎回 SSR のサーバ通して取得すればいいじゃん」** という方法に完全に倒すことで上記のツラミに対応している。
ドキュメントでも **絶対にクライアントサイドでは走らない** と明言されている。

さらに、クライアントサイドでの通信は [`useSWR`](https://github.com/zeit/swr) を使って render 部に書くのを推奨されており、こちらは逆に「クライアントサイドでしか走らない」ことが保証される。

あとは、ファーストビュー/SEO/Cookie/キャッシュといった諸々の都合を踏まえて、クライアントとサーバのどちらで通信を走らせるべきかさえ間違えなければ、実装ミスによる不具合は起きにくい……のではないかと思っている。

ということで NEXT の書き味がとても好みな感じになってきているので、しばらく趣味で書いてるものは NEXT で書いてみようかなと思っている。
