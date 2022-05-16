---
title: オレオレ webpack loader 作って nuxt に導入するメモ
category: oreore-webpack-loader
tags:
createdAt: 2018-03-16 00:00:00 +0900
updated_at: 2018-03-16 00:00:00 +0900
published: true
layout: "@/layouts/BlogPost.astro"
---

このブログを作るのにちょっとした webpack loader を書いて nuxt に適用したので、そのメモ。

## メモ

- [基本の書き方](https://webpack.js.org/contribute/writing-a-loader/)
- node で動かすことに留意する
  - import/export で書かれてるが、 node で v9 でもまだ `--experimental-modules` 立てないと動かないので、 `module.exports` と `require` で書く等。
- 雛形を作成して、読み込まれることを確認してから先に進む
  - 単に source を受け取って console.log するだけのやつでもいい
- loader は hot reload 対象外
  - 当たり前だけど。 nuxt 起動し直しが必要

## nuxt.config.js

[build - extend](https://nuxtjs.org/api/configuration-build/#extend) で webpack の設定を拡張してやる必要がある。

オレオレ hoge-loader を loaders において、下記のような設定を書く

```js
module.exports = {
  build: {
    extend(config) {
      config.resolveLoader.modules.push(path.resolve(__dirname, "loaders"));
    },
  },
};
```

あとは利用側で `import fuga from 'hoge-loader!fuga.js'` という形で利用できる。

---

メンテされてない loader 使うくらいならサクッと作ったほうがいい説ある。
ってそれ gulp でも通った道や……。
