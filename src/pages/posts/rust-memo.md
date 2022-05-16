---
title: rust memo
category: rust-memo
tags:
createdAt: 2018-07-31 00:00:00 +0900
updated_at: 2018-07-31 00:00:00 +0900
published: true
layout: "@/layouts/BlogPostLayout.astro"
---

<https://doc.rust-lang.org/book/second-edition/>

## 3.1

let で変数定義 immutable
let mut で mutable
const で定数定義。実行時に計算するような値は入れられない。コードのあちこちで使うような値を入れる

```rust
let x = 5;
let x = x + 1;
```

↑ シャドーイング。仮に let x = 5; x = x + 1; と書いたらイミュータブルだから怒られる

## 3.2

i8, i16, i32, i64 で signed な数
u8 - 64 で unsigned
isize, usize はアーキテクチャ任せ
tuple は let x: (i32, f64, u8) = (50, 3.2, 8); みたいに定義
x.0, x.1, x.2 でアクセス
let (a, b, c) = x; でスプレッド
配列は let a = [1,2,3];

## 4.1

```rust
let x = String::from("hoge");
let y = x;
println!("{}", x);
```

このコードはエラーになる。
shallow とか deep とかとも違い move といって、所有権が移動する
単純に let y = x.clone(); とすればうごく

```rust
let x = 1;
let y = x;
println!("{}", x);
```

このコードは動く。
Copy trait を持ってる型なら勝手にコピーしてくれる。
「なんとなく shallow copy とか deep copy にはならなそうだな」と思ったらでいけそう

```rust
fn main() {
    let s = String::from("hello");
    takes_ownership(s);             // 以降、このスコープで s は使えない
    let x = 5;
    makes_copy(x);                  // x は Copy できるので所有権が移動しない
}
```

```rust
fn main() {
    let s1 = gives_ownership();         // 戻り値の所有権をもらう
    let s2 = String::from("hello");
    let s3 = takes_and_gives_back(s2);  // s2 の所有権を渡して戻り値の所有権をもらう
}
fn gives_ownership() -> String {
    let some_string = String::from("hello");
    some_string
}
fn takes_and_gives_back(a_string: String) -> String {
    a_string
}
```

まぁまぁ普通にかける感じはするけど、流石に「一度渡したら以降使えない」だけだとつらいので、 4.2 の参照がある

## 4.2

```rust
let s1 = String::from("hello")
len = calc(s1)
println!("{}", s1) // コンパイルエラー
fn calc(s: String) -> usize {
  s.len()
}
```

こうしちゃうと println でエラー。
所有権が calc にうつっちゃうのでもとのところでは使えない。
rust では & つけて参照渡しをすると、所有権は渡さずに値を借りる (borrowing) ことができて、 function を抜けたときに自動で返す挙動になる。

ただし、借りてきた値が immutable だと、破壊的な操作は実行できない
mutable な操作をしたいならこう。

```rust
fn main() {
    let mut s = String::from("hello");
    change(&mut s);
}
fn change(some_string: &mut String) {
    some_string.push_str(", world");
}
```

ちゃんと最初の定義から let mut でやって、 mutable な reference で書いていく

mutable reference には大きな制約があり、同じスコープ内に別の mutable/immutable reference を持つことができない。

```rust
let mut s = String::from("hello");

let r1 = &mut s;
let r2 = &mut s; // コンパイルエラーになる
```

```rust
let mut s = String::from("hello");

let r1 = &s;
let r2 = &s; // 問題なし
let r3 = &mut s; // コンパイルエラーになる
```

なぜ: r1 で読んで r2 で書いてをマルチスレッドでやったら data race 起きるじゃん
中括弧でスコープ分けてやればエラーにならない

rust は Dangling References (宙ぶらりんな参照) は作れないようになっている

```rust
fn main() {
    let reference_to_nothing = dangle();
}
fn dangle() -> &String {
    let s = String::from("hello");
    &s // コンパイルエラー
}
```

s は dangle を抜けたらメモリ上から開放されるので、 &s は dangling reference になってしまう。が、 rust はこれがコンパイルエラーになる。
この例だと参照渡しせずに直接渡すのが正解。所有権が移動するので、 s が開放されずにすむ

まぁでも rust の旨味として、 mutable はあんまり使わないほうがいいんだろうなと思う

## 4.3

文字列の一部を切り出すのに slice 使う例が書かれてるんだけど、これ 2 バイト文字とかどうなるのって思ったら案の定使えないらしい。
いろいろ調べてたら下記の記事が参考になりそうだった。ともかく文字列操作は一筋縄ではいかないもよう

<https://qiita.com/aflc/items/f2be832f9612064b12c6>

ここでは immutable 保ったまま配列の一部を切り出すには slice つかうといいよくらいでよさそう

```rust
#![allow(unused_variables)]
fn main() {
let a = [1, 2, 3, 4, 5];

let slice = &a[1..3];
}
```

## 5

構造体

## 5.1

普通な感じ

```rust
struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}
```

こんなふうに作る ↓

```rust
let user1 = User {
    email: String::from("someone@example.com"),
    username: String::from("someusername123"),
    active: true,
    sign_in_count: 1,
};
```

mutable にすれば再代入もできる ↓
特定のフィールドだけを mutable にしたりはできない。
これやるよりはあとから出てくる `..` 使って新しいインスタンス作ったほうがよさそう。

```rust
let mut user1 = User {
    email: String::from("someone@example.com"),
    username: String::from("someusername123"),
    active: true,
    sign_in_count: 1,
};

user1.email = String::from("anotheremail@example.com");
```

構造体を作る関数 ↓
ES6 みたいに同じフィールドに同じ変数名で値をセットするときは省略できる

```rust
fn build_user(email: String, username: String) -> User {
    User {
        email: email,
        username: username,
        active: true,
        sign_in_count: 1,
    }
}

fn build_user(email: String, username: String) -> User {
    User {
        email,
        username,
        active: true,
        sign_in_count: 1,
    }
}
```

struct update syntax というので、別のインスタンスのフィールドを使って新しいインスタンスをつくれる。これまた ES6 っぽい。挙動も一緒で、下記だと email, username 以外は user1 の値が使われる

```rust
let user2 = User {
    email: String::from("another@example.com"),
    username: String::from("anotherusername567"),
    ..user1
};
```

tuple も名前をつけられる (Tuple structs) ↓

```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

let black = Color(0, 0, 0);
let origin = Point(0, 0, 0);
```

## 5.2 An Example Program Using Struct

ここは一通り読んで書いてみたほうが良さそう。
構造体の具体的な使い方と、アノテーションとかが出てくる

## 5.3 Method Syntax

構造体へのメソッド追加

```rust
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}
```

&self を書かなければ static メソッド（static という言い方はしてないので、誤解あるかも）

```rust
impl Rectangle {
    fn square(size: u32) -> Rectangle {
        Rectangle { width: size, height: size }
    }
}
```

impl は分けてかける

```rust
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}
impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}
```

## 6.1 Defining an Enum

定義は普通

```rust
enum IpAddrKind {
    V4,
    V6,
}
```

引数にとったり呼び出しも普通

```rust
fn route(ip_type: IpAddrKind) {}

let four = IpAddrKind::V4;
let six = IpAddrKind::V6;
```

それぞれに違う struct にすることが可能

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}
```

インスタンスメソッドをもたせたりもできる

```rust
impl Message {
    fn call(&self) {
    }
}
m.call();
```

### The Option Enum and Its Advantages Over Null Values

他の言語でもよくある Optional だけど、 rust の場合は下記のような enum で実装されてる。

```rust
enum Option<T> {
    Some(T),
    None,
}
```

先の enum の例を踏まえると下記のようにかける

```rust
let some_number = Some(5);
let absent_number: Option<i32> = None;
```

なるほど

## 6.2 The match Control Flow Operator

パターンマッチはこんな感じ。単に値を返すだけじゃなくて処理を書いたり、値を扱ったり

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(UsState),
}

#[derive(Debug)]
enum UsState {
    Alabama,
    Alaska,
}

fn value_in_cents(coin: Coin) -> u32 {
    match coin {
        Coin::Penny => {
            println!("Lucky penny!");
            1
        },
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("{:?}", state);
            25
        }
    }
}

fn main() {
    println!("{}", value_in_cents(Coin::Penny));
    println!("{}", value_in_cents(Coin::Quarter(UsState::Alabama)));
}
```

Option を match であつかうとこんな感じ ↓

```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}
```

すべてのパターンを網羅してないとコンパイルエラーになる。
例えば上記の None => None を削るとエラー。

ほか全て、は \_ placeholder で受けることができる。 `()` は何もしない

```rust
match some_u8_value {
    1 => println!("one"),
    3 => println!("three"),
    5 => println!("five"),
    7 => println!("seven"),
    _ => (),
}
```

## 6.3 Concise Control Flow with if let

1 こだけマッチさせたいパターンだと match では冗長なときもあるので、そのときは if let も使う。
下記の例は else if も使っていて、これなら match を使ったほうが良いだろう

```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    if let Some(5) = x {
        Some(100)
    } else if let Some(i) = x {
        Some(i + 1)
    } else {
        None
    }
}
```

おそらく Option で使うことが多そう。

## 7.1 mod and the Filesystem

下記のように新しいプロジェクトを作ってからスタート。
lib についての詳しい説明はまたそのうち出てくるはず。

```bash
$ cargo new communicator --lib
$ cd communicator
```

ざっくりいうとディレクトリ構成の通りにモジュールのネームスペースが切られるよって話がメイン

```
└── src
    ├── client.rs
    ├── lib.rs
    └── network
        ├── mod.rs
        └── server.rs
```

```rust
// client.rs
fn connect() {
}

// network/mod.rs
fn connect() {
}
mod server;

// network/server.s
fn connect() {
}
```

こういう構成のディレクトリにすると、

```rust
// lib.rs
mod client;
mod network;
```

と、こんな具合に呼び出せる。これは実質下記と一緒

```rust
mod client {
    fn connect() {
    }
}

mod network {
    fn connect() {
    }

    mod server {
        fn connect() {
        }
    }
}
```

## 7.2 Controlling Visibility with pub

上記のコードを呼び出してみる

```rust
// src/main.rs
extern crate communicator;

fn main() {
    communicator::client::connect();
}
```

`extern crate` でクレートを呼び出す。
これは main.rs か lib.rs にしか書くことができない。
main.rs, lib.rs は root モジュールと呼ぶ。

この main.rs ファイルを作った時点で、 communicator パッケージは binary crate と library crate の 2 つのクレートを持つことになる。
これは実行可能なプロジェクトでは一般的な構成で、うまく関心を分離(separation of concerns)できる。

これを書いただけだと下記のようなエラーになる。

```
error[E0603]: module `client` is private
 --> src/main.rs:4:5
  |
4 |     communicator::client::connect();
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

要は client モジュールは private だから外部クレートから呼べないよというエラー。
rust はデフォルト private で、 pub をつけると public になる。

```rust
// lib.rs
pub mod client;
mod network;

// client.rs
pub fn connect() {
}
```

このようにモジュールと関数どちらにも pub をつけられる。
