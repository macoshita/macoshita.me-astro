---
title: SvelteKit でブログ作ってみた
createdAt: 2021-04-15 00:45:00 +0900
tags: [Svelte]
layout: "@/layouts/BlogPost.astro"
---

[SvelteKit が Public Beta になった](https://svelte.dev/blog/sveltekit-beta)ので、いつもの病気を発症してブログ環境を置き換えてみた。

## できたもの

- このブログ
- コードは https://github.com/macoshita/svelte-blog

## やったこと

- https://kit.svelte.dev/docs の通りに Getting Start し、このプロジェクトの下地を作成
- Static Site Generation (SSG) できるように [adapter-static](https://github.com/sveltejs/kit/tree/master/packages/adapter-static) を導入
- ブログ記事の frontmatter 付き markdown を全部コピー
- 元々作ってあったブログ記事用の markdown parser もコピー
- markdown parser を使って記事一覧・記事詳細を json で返す endpoint を実装
  - `/api/posts.json.ts`, `/api/posts/[slug].json.ts` で実装
- `index.svelte`, `posts/[slug].svelte` ファイルの `<script context="module">` の中で上記 API を fetch
- `<script>` の中でクライアントサイド用に加工
- html, css の実装
  - 内部リンクを sveltekit:prefetch 使うようにした
- オプションで hydrate をオフにした

### adapter-static

sveltekit は adapter によって netlify 用、vercel 用、シンプル nodejs 用とビルド時の出力を変えられる。
static を使えばサイト全体を static ファイルにしてくれる。
導入したら npm run build で build ディレクトリに static ファイルが吐き出される。

### endpoint

`.json.ts` という拡張子をつけると `.json` の endpoint が作れる。
endpoint はサーバサイドでしか実行されない。
get, post, delete など HTTP メソッド名の関数を export しておくと、アクセス時の HTTP メソッドと同名の関数が実行される。

### `<script context="module">` と load

そのファイル専用の設定を書いたり、load を書いたりする。
load は next で言うところの `getStaticProps`, `getServerSideProps` だし、一番近いのは nuxt の asyncData か。
サーバ側では load の結果は JSON stringify されて HTML に埋め込まれる。
クライアント側は埋め込まれた JSON があったらそれ使うのですぐ読み込める。
……というよくある SSR の方式。

### sveltekit:prefetch

https://kit.svelte.dev/docs#anchor-options-sveltekit-prefetch

内部リンクにつけとくと、マウスカーソル当てたり、指が触れた瞬間（離れる前）に、リンク先のコンテンツを先読みしてくれる超クールな機能。

### hydrate

Server Side Rendering のハイドレーションとは、ざっくりいうと「サーバ側がレンダリングした HTML を表示しつつ、クライアント側でも HTML を再レンダリングすることで差を埋める」みたいな話。
「差」として多分いちばん重要なのはイベントハンドラで、こいつが設定されないと「クリックしたら開くはずのメニュー」とかが動かない。

https://developers.google.com/web/updates/2019/02/rendering-on-the-web?hl=ja

TBD

## よかったこと

かなりお気に入り。

### init スクリプト

TypeScript, ESLint, Prettier, Less/SCSS を導入するか聞かれてスタートし、完成したあとは svelte.config.cjs で SSR 切ったりできる。

vue, react 系の新規プロジェクト作成はいろんなのを触ってきたけど、個人的には SvelteKit がベストというか、自分の好みにベストマッチしていた。

### サーバ・クライアント両方で動く部分がまぁまぁ簡単に書けそう

endpoint はサーバサイド。
onMount はもちろんクライアントのみ。
それ以外は SSR 有効時は基本両方で動く。

load で使える sveltekit 備え付けの fetch はサバクラ両方で動くので基本これで頑張る形っぽい？
fetch では書きにくい！　みたいなケースもありそうだけど、Next.js みたいに、外部への http 通信は基本 endpoint で proxy してやって、サバクラ両方で動く場所では fetch で endpoint からデータ取ってくるだけという方針でも良さそう。

### 軽い

とにかく軽い。読み込みが一瞬で完了する。

### 簡潔

svelte 自体が簡潔なのもあるけど、コード量がすごく少なく感じる。

## プチハマり

多分 public beta な今だけ。

### adapter-static が動かない

バージョン違いでどうにもうまく動かず、github からインストールしようとしてもサブディレクトリなので苦労した。
このプロジェクトでは [GitPkg](https://gitpkg.vercel.app/) というサービスで無理やりサブディレクトリからインストールしている。

### 日本語ファイル名が使えない

おそらく。

### エラーがわかりにくい

load 内でエラーが起こったときになんにも表示されない。
どうも $error ページにエラーがあるとこうなっちゃうっぽい。

try-catch したり console.log デバッグでなんとかエラーを特定して実装した。
