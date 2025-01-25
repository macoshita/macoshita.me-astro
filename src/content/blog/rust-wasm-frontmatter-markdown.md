---
title: "Rust で frontmatter と markdown を処理する WASM を書いた"
category: 2020-12-01-rust-wasm-frontmatter-markdown
tags: [Rust]
createdAt: 2020-11-05 02:04:11 +0900
updated_at: 2020-12-04 02:03:47 +0900
published: true
number: 17
layout: "@/layouts/BlogPostLayout.astro"
---

## やったこと

frontmatter 付きの markdown を渡したら、frontmatter 部分を json に、本文を html に変換する wasm を書いた。
GitHub は[こちら](https://github.com/macoshita/wasm-frontmatter-markdown)で、[npm で公開](https://www.npmjs.com/package/@macoshita/wasm-frontmatter-markdown)している。
この WASM は node.js で動かす用になっているが、やろうと思えば browser でも動作する。

### 何に使ったか

このブログが next.js 製なんだけど、それの markdown パースに使ってる。
↓ の気になる点はあるものの、記事のパース自体はやっぱそこそこ高速。
記事の更新エディタに esa を使っているので、そっちもいずれ記事にしたい。

## Rust で WASM を作る勉強の流れ

Rust の経験も薄いし WASM は初体験だったので勉強した。

### ドキュメントのたどり方

[Rust の公式ページ](https://www.rust-lang.org/ja/what/wasm) から辿れるところが基本。
まずは https://rustwasm.github.io/docs/book/ の Hello World までやると大体感触がつかめる。
大体わかってきたら [wasm-bindgen](https://rustwasm.github.io/docs/wasm-bindgen/) の方を見て、Rust のどの型が JS のどれに変換されるのか確認しながら書いた。

### 必要なツール

- wasm-pack
  - build サブコマンドで node.js, browser で実行できる wasm を js 付きで吐き出してくれて、さらに login, publish サブコマンドで npm に publish まで出来る
- cargo generate
  - 雛形作る以外には使わなかった

## 実装ポイント

### pulldown_cmark と syntect, gh-emoji の組み合わせ

[pulldown-cmark](https://github.com/raphlinus/pulldown-cmark) は Rust 製の markdown パーサー。プル方式のパーサーで、AST に手を入れるのが簡単で、かつ速いという特徴がある。
[このあたりのコード](https://github.com/macoshita/wasm-frontmatter-markdown/blob/660e8186199dc997d7489714124d0306e8b4ca6c/src/utils.rs#L42) が Syntect でコードブロックを処理する AST を作っているところ。
大体こんな流れで処理している ↓

1. コードブロックが始まったらフラグを立てる
1. その間に差し込まれるテキストは一旦別変数に保持
1. コードブロックが終わったら Syntect でテキストをハイライト済みの HTML に変換して HTML イベントとして流し直す

`:innocent:` → 😇 という絵文字変換もやりたかったので、コードブロック内でない絵文字を変換するという処理もやっている。
絵文字変換には [gh-emoji](https://github.com/kornelski/gh-emoji) という crate を使っている。

なお、このあたりで [zola](https://github.com/getzola/zola) という SSG の実装を見つけて、上記の処理をだいたい似たような感じでやっているので、大いに参考にさせてもらった。

### lazy_static! -> once_cell

syntect の SyntaxSet, ThemeSet、絵文字の replacer など、一回初期化してあとはそれを再利用したいものがちょこちょこあった。
まず例として出てきたのは [lazy_static](https://crates.io/crates/lazy_static) だったのだけど、これは結構書き方が覚えにくいと感じたので、[once_cell](https://crates.io/crates/once_cell) に移行した。
が、これはこれで `Lazy::new(|| {` の `||` 意味がまだわかっていない。。

追記: 単に引数が空の Closure だった 😂

### yaml -> json

serde_json, serde_yaml を入れて、下記のように書けば serde_json::Value が取得できるので、あとは to_string なり何なりで JSON 文字列にできる。

```rust
serde_yaml::from_str::<serde_json::Value>(text)
```

## ハマった点

### cargo-generate のインストールに失敗

```bash
# 最初に入れたときは、WSL2 環境だと vendored-openssl オプションつけないとだめだった
cargo install cargo-generate --features vendored-openssl

# 今はオプションつけなくてもインストールできるので、もしかしたら、別件で下記のインストールをした結果直ったかも
sudo apt install libssl-dev
```

### wasm-bindgen で String を返す関数を書くとエラー

[そういう Issue](https://github.com/rustwasm/wasm-pack/issues/886) がある。詳しく追ってないけど Cargo.toml に下記を書けば動いた。

```toml
[package.metadata.wasm-pack.profile.release]
wasm-opt = ["-Oz", "--enable-mutable-globals"]
```

### syntect のビルドエラー

[syntect](https://github.com/trishume/syntect) とは Rust 製の Syntax Highlighter.

ビルドエラーは [この Issue](https://github.com/trishume/syntect/issues/135) に詳細があり、ざっくりいうと内部で [rust-onig](https://github.com/rust-onig/rust-onig) という正規表現のライブラリを使っていて、それが WASM に対応してないという状況。oniguruma という C のライブラリに聞き覚えがある人も多そう。
代わりに pure rust な [fancy-regex](https://github.com/fancy-regex/fancy-regex) を有効にすることができるので、そっちを使えばビルドができる。

```toml
syntect = { version = "4.4.0", default-features = false, features = ["default-fancy"] }
```

## 気になる点

- [ ] WASM がでかい(1.8MB)。ブラウザで使うなら、Syntax Highlight の設定を別途読み込めるようにしないときつそう
- [ ] TypeScript のパースが初回だけ遅い（Ryzen 5 3600 環境で 700ms くらいかかる）。Syntect 側に手が入らないと直せないかも
