---
title: Flutter でシルエットクイズアプリを作ってアーキテクチャとか考えた
createdAt: 2024-01-09 19:50:00 +09:00
tags: [Flutter]
layout: "@/layouts/BlogPostLayout.astro"
---

## 作ったもの

https://github.com/macoshita/silhouette_game

- シルエットになっているものが何かをひらがな or カタカナで入力する、子どものひらがな・カタカナの練習用アプリ
- 1単語を1文字ずつ入力していき、1単語入力完了したらシルエットが解除される
- 5単語入力したらゲームクリア
- 透過 png を `{問題となる単語ひらがな}.png` という形式で assets/quiz 以下に置けば問題を追加できる
  - (多分)どんな画像でもよいので、例えばポケモンの画像を持ってくればポケモンシルエットクイズにもできる。GitHub には当然 CC0 の画像のみ置いてある

## 設計

### いくつかの原則を守る

https://medium.com/flutter-jp/architecture-240d3c56b597 にある下記を遵守する。

- Single Source of Truth(SSOT)原則に従った状態管理
- 状態の流れを単方向データフローで組む
- immutableプログラミングの徹底
- Unit/Widget Testが可能に（書いてないけど）
- 単一責任の原則を意識

記事では上 2 つが必須とあり、immutable は mutable のほうが分かりやすくなることも極稀にあるし、テストは常に書けるとも限らないのでわかるけど、単一責任の原則は必須として良いんじゃないかなーと思わなくはない。

### Feature(機能) で切る

`lib/features/` 以下に `digital_ink_recognizer/` などディレクトリを掘ってそこにその機能絡みのファイルをすべて置くようにした。

- lib
    - features
        - digital_ink_recognizer : 手書き文字を認識し、特定の文字との正誤判定の提供
        - finish : ゲーム終了画面
        - game : ゲーム中の画面や状態遷移
        - game_mode : ひらがな・カタカナモードの切り替え・現在のモード取得
        - handwritten_cell : 手書きできてストロークを取得できるウィジェットを提供
        - hint : ヒント機能の提供
        - quiz : 問題のリスト・出題中の単語・出題中の文字を提供
        - title : タイトル画面
- main.dart

最初は 1 ファイルで済むものはディレクトリを掘らないことにしていたが、むしろ見づらい気がしたので **必ずディレクトリを掘る** ようにした。途中で `.freezed.dart` や `.g.dart` が生えることになることも多く、これはそういうルールにしたほうが良いかも。

ディレクトリ内は **機能を提供するための riverpod provider とコンポーネントのセット** という構成になっていて、例えば `lib/features/game_mode` 以下には現在選択中のゲームモード（ひらがなモード・カタカナモード）を取得できる provider と、ゲームモードを切り替えるスイッチを提供している。

Feature の粒度は SSOT の原則を守れる形にする。
例えば問題を提供する機能は `lib/features/quiz` にまとめていて、他のところで問題を取得するには `quiz/` 以下の provider を使うようにしている。
逆に言えばそれを守れれば Feature 同士の依存関係は何も気にしてない。SSOT、単一責任の原則を守れていれば、そこの依存がゴチャついて困ることもないはず、という考え。

ただ、大人数で開発するときには「問題取得する provider まだ作られてないな、`lib/features/question/` 作ろう」となりそうなので、`lib/data/` に掘ることにするなどのルール決めが必要そうな気もするけど、じゃあ `gameModeProvider` みたいな StateProvider も `lib/data/` に置くのか？というとうーん。
「コンポーネントがないモノは機能としない」という分け方でも良いのかも？

### Provider を細かく分ける

単一責任の原則を意識して、しかも機能で切るとなると自然とそうなるけど、でかい Provider は危険信号と捉えることにしていた。
ただ、この粒度は割と悩ましく、特に悩んだのは `quizProvider` で、最終的には「問題セット」「今の問題文」「今の問題文字」をまとめた state を返すようにしたが、それぞれを別の Provider で提供しても良かったような気もしている。
まとめた理由は問題セット→今の問題文→今の問題文字と拾ってくるところがピタゴラスイッチ過ぎると感じたのと、次の問題文・次の問題文字に進むためのメソッドをまとめたいと思ったのとで、どっちも若干決め手には欠ける。

## ライブラリ

多分、今後しばらくは、新規アプリを作るとき、このセットを初手でいれることになりそうだと思った。

- go_router
    - [公式ドキュメント](https://docs.flutter.dev/ui/navigation) で Using the Navigator, Using named routes, Using the Router の 3 つが紹介されている
    - Using the Navigator は移動のたびに↓こんなのを書く必要があり、しかもホームまで戻るのに popUntil とか使うしかない。go_router なら context.go で済む。
        - ```dart
           Navigator.of(context).push(
             MaterialPageRoute(
               builder: (context) => const SongScreen(song: song),
             ),
          );
          ```
  - Using named routes はおすすめしないと書かれている。
  - 上記踏まえて、正直もう go_router を初手でいれて良いと思う。アプデはきついけど……。
- flutter_hooks
    - setState とかは別にいい気もするんだけど、initState と didChangeDependencies で書くのが辛い。
- riverpod
    - FutureProvider と (Async)Notifier がかなり便利。どのように状態を管理するかで悩むことはあっても、それをどう実装するかではあんまり悩まなくて済む。
- freezed
    - record 登場で多少機会は減らせてる。個人的にはもう copyWith を使うときにしか使う理由がない気はしているので、[スプレッド演算子対応](https://github.com/dart-lang/language/issues/2128)とかがもし来たら出番がなくなるかも。
- gap
    - 便利だしコードが見やすくなる

## 小ネタ

- 画像のシルエット化は下記のような感じでできるので、透過画像1枚で問題を作成できる。
    - ```dart
      ColorFiltered(
        colorFilter: const ColorFilter.mode(
          Colors.black,
          BlendMode.srcATop,
        ),
        child: imageWidget,
      )
      ```
- 手書き文字認識→ https://pub.dev/packages/google_mlkit_digital_ink_recognition
    - こいつが WEB で動けば Web アプリとして公開できそうだけど、ML Kit は WEB が無いのでのぞみ薄。
- Notifier が本当に便利
    - watch するだけで何かしらの値が返ってくるのが保証されるのが良い。useEffect と fetch メソッドコールの組み合わせをほぼ撲滅できる。
    - `ref.invalidate` で再 fetch もできるので、困ることはほぼ無いのでは

## まとめ

それなりに大規模開発に活かせそうな知見も得られたと思う。
次は体温・お薬記録アプリ（バックエンドに Firebase）を作ろうと思うので、もうちょい濃い知見が得られるといいなと思う。