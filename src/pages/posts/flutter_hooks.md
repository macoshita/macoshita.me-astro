---
title: Flutter Hooks useEffect の便利ポイントの整理
created_at: 2021-10-12 23:39:00 +09:00
layout: "@/layouts/BlogPost.astro"
---

https://pub.dev/packages/flutter_hooks

少なくとも Riverpod の Ver. 1.0 になるまでは、Flutter Hooks を使ったほうが楽に書けるので、結構な人が導入するんじゃないかと思う。
しかし、そこで `useEffect` に手を出したら最後、もう hooks を手放すことが出来なくなってしまった。
これは、なんでそんなに依存しちゃったのかを整理するためのエントリ。

## StatefulWidget / initState のしんどいポイント

Widget に初期化処理を仕込む場合、StatefulWidget にして initState を override することで使うのが定石だと思う。
これが結構に面倒で、結構にバグのもとになる。

まず、そもそも「StatefulWidget にする」というのが面倒。
記法が冗長で、コンストラクタのパラメータは `widget.` を付けないと引けなくなるし、initState 要らなくなって Stateless に戻したいときも面倒。

次に、initState が走るタイミング。
initState はあくまで widget ツリーに widget が挿入された時にしか走らない。
コンストラクタ引数が変わろうが、親がリビルドされようが走らない。

そこで今度は didUpdateWidget を override する必要があるが、これも面倒。
こいつは変更前の widget を引数に取り、どのパラメータが変わったかを地道に判定して、更新処理を書くのを想定している。ストイック。
もちろんコンストラクタ引数が増えたら処理を書き換えなきゃならない。

そうして didUpdateWidget を書き始めると、ビミョーに initState と同じようなことをやってるのに気づき、DRY にしましょうってことで private メソッドが増える。
本当に初期化のときにしか走ってほしくない処理もあるが、initState を 2 つ書いたりはできないので、1 つの initState に初期化処理を書いて最後に private メソッドを呼ぶような形になる。
が、そのメソッド呼び出しにたどり着くまでの例外をキャッチし忘れると共通処理まで届かないということになる。
たとえ、手前の初期化処理が失敗しても構わない処理だったとしても。

更に、initState で stream を listen したり、タイマーで何かする処理を書いたりしたなら、dispose 処理が必要になる。
subscription や timer をフィールド変数に保持して、override した dispose で cancel などすることになるけど、まずこのフィールド変数のせいでだいぶ見通しが悪くなる。
そして nullsafe が導入されていないコードの場合、 `timer?.cancel()` じゃなく `timer.cancel()` と書いてやらかしたりする。

……他にもありそうだが、とりあえずパッと思いつく範囲でこういうしんどいポイントがある。

## useEffect

この辺の問題を useEffect はバッチリ解決できる。
例えば、コンストラクタで受け取った stream を listen して print するウィジェットを StatefulWidget で作ると以下のようになる。

```dart
class MyCounter extends StatefulWidget {
  final Stream<int> counter;

  MyCounter({Key? key, required this.counter}) : super(key: key);

  @override
  _MyCounterState createState() => _MyCounterState();
}

class _MyCounterState extends State<MyCounter> {
  StreamSubscription<int>? subscription;

  @override
  void initState() {
    super.initState();
    _subscribeCounter();
  }

  @override
  void didUpdateWidget(covariant MyCounter oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.counter != oldWidget.counter) {
      _subscribeCounter();
    }
  }

  void _subscribeCounter() {
    subscription?.cancel();
    subscription = widget.counter.listen((count) {
      print(count);
    });
  }

  @override
  void dispose() {
    subscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Text('count');
  }
}
```

これを useEffect で書くと以下のようになる。

```dart
class MyCounter2 extends HookWidget {
  final Stream<int> counter;

  MyCounter2({Key? key, required this.counter}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    useEffect(() {
      final subscription = counter.listen((count) {
        print(count);
      });
      return subscription.cancel;
    }, [counter]);

    return Text('count');
  }
}
```

useEffect は最初の build でまず呼び出され、それ以降は第二引数の keys が変わったときのみ呼び出される。
そのため、initState と didUpdateWidget を同時に実装でき、また didUpdateWidget での「どのパラメータが変わったか」の判定を省略できる。
useEffect は build 内に何度も書けるので、初回しか動かない処理と、それ以降もパラメータが変わったら動いてほしい処理を明確に分けて書ける。
さらに、return で関数を返すことができて、その関数は dispose 時や useEffect が再度呼び出されたときに呼び出されるので、StatefulWidget で dispose & didUpdateWidget で行っている cancel 処理をまとめて記入することができる。

という具合に、最初に上げたしんどいポイントがほぼ解決するのである。

## まとめ

useEffect に的を絞って書いた。
なお、useMemorized & useFuture や、useStream, useAnimationController などもとても便利で、がっつりコード量が減る。

一つ言うなら、あまりに便利なので、StatefulWidget のことをある程度知ってから導入したほうが良いのかなと思う。
例えばライブラリ作るなら極力 zero dependency で行きたいし、hooks はアグレッシブすぎると判断する現場もあるだろう。
きちんと理解をした上で、便利な hooks を活用していきたいと改めて思った 😄
