---
title: Wi-Fi ルーターを買い替えて tailscale 最高！ってなった話
createdAt: 2021-06-07 22:00:00 +0900
layout: "@/layouts/BlogPostLayout.astro"
---

Wi-Fi ルーターを [TP-Link Archer AX73](https://www.tp-link.com/jp/home-networking/wifi-router/archer-ax73/) に買い替えた。
前のルーターは PPPoE しか対応してなかったが、AX73 は IPoE に対応しているので、接続方式を IPoE に切り替えたところ、夜間の通信速度がとても安定するようになった。

と、ここまでは良かったのだが、IPoE 接続にすると、AX73 の持つ VPN や DDNS などの機能が使えなくなることを知った。
調べてみると、この価格帯のルーターでは結構ありがちな話らしい。。
以前は、ルーターの DDNS 機能とルーティング設定、ポート開放などを行って、自宅デスクトップに SSH 接続できるようにしていた。
自分は macbook pro を持っているが、docker for mac が遅すぎるので、外出先では自宅デスクトップに VSCode Remote で接続して作業していて、これができないとなるとかなり厳しい。
さらに、デスクトップの電源を入れっぱなしにしておくのは電気代がもったいないので、外出先から電源を入れる必要もある。

「どうしたものか……」と考えてたら、ふと [tailscale](https://tailscale.com/) のことを思い出した。
ゼロコンフィグで、ファイアーウォールの設定など一切なしに、メッシュ VPN を構築できるという素晴らしいサービス。
早速 SNS 認証して macbook とデスクトップに tailscale をインストールしたら、いとも簡単に ssh できた。
正直、ルーターを買い換えなくてもこっちのほうが楽だ。もっと早く試せばよかった。ひとまず第一の問題は解決。

第二の問題、電源を外出先から入れるのは、tailscale 単体ではできない。
[Wake-on-LAN packet support](https://github.com/tailscale/tailscale/issues/306) という Issue はあって議論もされているんだけど、いや普通に考えて同一ネットワークの別クライアントから Magic Packet 送るしかなくない？　と思ってて、実現するんなら一体どうやって……？というところが気になっている。

これの実現を待っててもしょうがないので、寝かせてた Raspberry PI 3 に ubuntu をインストールし、tailscale をインストールし、以下のサーバを稼働させておくことにした。

https://github.com/macoshita/wakeonlan-server

これは python(flask) で書いた web サーバで、任意の mac アドレスに magic packet を送信するだけのもの。magic packet を送る pip があったので flask の勉強込みでも一瞬で書けた。
デスクトップを起動したいときは、macbook を VPN に繋げばラズパイに立てた web サーバのページにアクセスできるので、そこで magic packet 送信ボタンを押せば OK。
第二の問題も解決し、無事以前のルーターとほぼ同等の環境を作ることができた。

色々勉強になったし、何よりネット環境  はあきらかに快適になったので、めでたしめでたし。
特に tailscale は、この手のサービスでこんな感動したのは久々だった。事あるごとに推していきたい。
