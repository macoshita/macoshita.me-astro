---
title: "gitconfig の includeIf を使って git のユーザーを切り替える"
category: switch-git-user-by-includeif
tags:
createdAt: 2020-11-20 11:20:33 +0900
updated_at: 2020-11-24 00:59:28 +0900
published: true
number: 23
layout: "@/layouts/BlogPost.astro"
---

## やりたいこと

- [x] 会社の GitLab に push するユーザーと、GitHub に push するユーザーを分けたい
- [x] .gitconfig は会社 PC と私物とで同じものを使いたい
- [x] .gitconfig は github で公開した状態にしたいので、会社情報が含まれないようにしたい

## 環境

↑ をやろうと思うとディレクトリをスパッと分けてくれる [GHQ](https://github.com/x-motemen/ghq) が都合良かったので導入。
GHQ のデフォルト設定は、github からクローンしたら `~/ghq/github.com` に、会社の GitLab からクローンしたら `~/ghq/{会社の GitLab の URL}` に置かれるようになっている。
以下の方法は **会社のリポジトリ群と、個人のリポジトリ群が、それぞれ別ディレクトリにまとまっているいる場合** に適用可能。

## やったこと

`.gitconfig` にこういうものを書く。
includeif の仕様は[こちら](https://git-scm.com/docs/git-config/2.15.4#_includes)。要は特定のディレクトリ以下にいるときに特定の config を include できる。

```ini
[include]
	path = .gitconfig.default
[includeif "gitdir:~/ghq/github.com"]
	path = .gitconfig.github
```

同じディレクトリにこういうものを置く。
以下のファイルはコミットはしない。

```ini
# .gitconfig.default
[user]
	name = 会社PCなら会社のアカウント、自宅PCなら .gitconfig.github と同じもの
	email = こちらも同様
```

```ini
# .gitconfig.github
[user]
	name = github用
	email = github用
```

git のバージョンが極端に古いとか無い限りは動くはず。
