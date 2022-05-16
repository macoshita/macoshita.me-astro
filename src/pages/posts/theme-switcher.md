---
title: Astro で作ったブログに Svelte 製のダークモード切り替えボタンをつけた
created_at: 2022-05-07
tags: [Astro, Svelte]
layout: "@/layouts/BlogPost.astro"
---

## 成果物

|                     Light                     |                          Dark                           |
| :-------------------------------------------: | :-----------------------------------------------------: |
| ![theme switcher](/images/theme-switcher.png) | ![theme switcher dark](/images/theme-switcher-dark.png) |

https://github.com/macoshita/macoshita.me-astro/blob/fdd629c81662eb0383ab483898dd3d99e2a5eec0/src/components/ThemeSwitcher.svelte

## やったこと

Astro の真骨頂、好きなフレームワークでコンポーネントを書けるのを利用して、Svelte でダークモード切り替えボタンを作った。

### dark クラスがついていたらダークモードにする

このブログは `new.css` をカスタムして使っているので、もともとダークモード対応はできている。
今回これをスイッチで切り替えられるように、 `:root` 要素に dark クラスがついていたら色が変わるようにした。

```css
/* for dark mode */
:root.dark {
  --nc-tx-1: var(--nc-d-tx-1);
  --nc-tx-2: var(--nc-d-tx-2);
  --nc-bg-1: var(--nc-d-bg-1);
  --nc-bg-2: var(--nc-d-bg-2);
  --nc-bg-3: var(--nc-d-bg-3);
  --nc-lk-1: var(--nc-d-lk-1);
  --nc-lk-2: var(--nc-d-lk-2);
  --nc-lk-tx: var(--nc-d-lk-tx);
  --nc-ac-1: var(--nc-d-ac-1);
  --nc-ac-tx: var(--nc--dac-tx);
}
```

### is:inline スクリプトで :root に dark クラスを付与

```html
<!-- Dark mode (Inline script to prevent flushing immediately after loading) -->
<script is:inline>
  const isDarkTheme = () => {
    const theme = localStorage.getItem("theme");
    if (theme) {
      return theme === "dark";
    } else {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
  };
  if (isDarkTheme()) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
</script>
```

localStorage, ブラウザ設定を確認して、ダークモードの初期値を取得し、 `:root` に dark クラスを付与する。
localStorage に theme というキーでユーザーが dark, light どちらを選んだかを覚えておく。
もしキーがなかったら `window.matchMedia("(prefers-color-scheme: dark)").matches` でブラウザの設定をとってくる。

これを [各種ヘッダをつけるコンポーネント](https://github.com/macoshita/macoshita.me-astro/blob/fdd629c81662eb0383ab483898dd3d99e2a5eec0/src/components/BaseHead.astro#L43-L59) に書いている。
Astro コンポーネントで `is:inline` をつけると、なんの加工もされずそのまま HTML に出力される。

body をレンダリングし始める前に dark クラスをつけておかないと、ページをロードしたときにいったん light でレンダリングされてから dark でレンダリングし直すことになるので、画面がフラッシュするし、パフォーマンスも良くない。
`<head>` の中ですぐさま実行されるスクリプトとして上記のコードを置くことで、それを回避している。

### ThemeSwitcher.svelte

お膳立てが済んだので切り替えスイッチを作る。

```svelte
<script lang="ts">
  import LightIcon from "@/icons/light.svelte";
  import DarkIcon from "@/icons/dark.svelte";

  let isDark = import.meta.env.SSR
    ? undefined
    : document.documentElement.classList.contains("dark");

  const toggle = () => {
    isDark = !isDark;
    if (isDark) {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    }
  };
</script>

<button type="button" aria-label="switch theme" class="icons" on:click={toggle}>
  <span class="icon light"><LightIcon /></span>
  <span class="icon dark"><DarkIcon /></span>
</button>

<style>
  .icons {
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 8px;
    padding: 8px;
    margin: 0;
    background-color: var(--nc-bg-3);
    border: 0;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .icon {
    width: 24px;
    height: 24px;
    color: var(--nc-tx-1);
    transition: color 0.3s ease-in-out;
  }
  :global(:root:not(.dark)) .icon.light {
    color: orangered;
  }
  :global(:root.dark) .icon.dark {
    color: yellow;
  }
</style>

```

クリックすれば切り替わる、単純なスイッチを作った。
中のアイコンの色が切り替わったりするのは `:root.dark` を祖先に持つかどうかで CSS を切り替えることで実装している。

このコンポーネントを Astro の `client:load` を使って読み込むと、ローカルの node.js サイドとクライアントサイド、両方で呼ばれることになる。
要するに `npm run build` 時にちゃんとレンダリングできる必要がある。

クライアントサイドでは、 `document.documentElement.classList.contains("dark")` で `is:inline` で付与したクラスを確認して初期値をセットし、node.js サイドでは document へのアクセスができないので、 `import.meta.env.SSR` を見て undefined をセットしている。

なお icon として読み込んでる svelte は [iconify](https://iconify.design/) から SVG をコピーして `.svelte` ファイルとして保存しただけのもの。
`npm i @iconify/svelte` とかしたんだけど、うまく動かなかった記憶があるが、そもそもこのやり方のほうが効率的な気もする。

## まとめ

ずっとつけたかったスイッチをつけられて満足した。
これで今回のブログ置き換えにともなう見直しはいったん完了ということにする。
