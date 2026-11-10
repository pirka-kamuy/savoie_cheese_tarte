# SAVOIA TIRAMISÙ

ティラミス専門店の1ページサイト（コーディング練習用）。
※ チーズタルト店「SAVOIE CHEESE TART」から作り替え中。写真・本文・ロゴは素材がそろい次第差し替え予定。

## 構成

```
index.html
favicon.svg
css/
  foundation.css  … レイヤー順の宣言・デザイントークン（CSS変数）・リセット・要素の基本スタイル
  layout.css      … l-  ヘッダー / メイン / フッターの大枠
  project.css     … p-  各セクション、c- コンポーネント
  utility.css     … u-  汎用クラス
  animation.css   … JS で付け外しする状態クラスとキーフレーム
js/
  main.js         … スクロールアニメーション・メニュー（jQuery なし）
images/           … WebP（pc/ sp/ はファーストビュー等の出し分け用）
```

ビルドは不要です。`index.html` をブラウザで開けば動きます（PRICE の水玉模様だけはサーバー経由で表示。下の「色面・背景の色」を参照）。

## コーディング方針

- **Sass は使わず素の CSS**。変数は CSS カスタムプロパティ（`--color-accent` など）、
  ファイル同士の優先順位は `@layer`（cascade layers）で管理しています。
- クラス命名は **FLOCSS + BEM**（`l-` / `p-` / `c-` / `u-`、`block__element`）。
- メディアクエリは範囲構文で統一：`@media (width < 768px)` がスマホ用。
- 文字サイズは、本文・小さい文字は `rem` の固定値、見出しは `clamp(最小rem, ○vw, 最大rem)` で指定しています。
  ブラウザや OS の文字サイズ設定に反応し、12px 未満にはなりません。
- 色・フォントは直接書かず、`foundation.css` の変数を使ってください。
  配色は役割ごとの名前（`--color-main` ココア／`--color-sub` マスカルポーネ／`--color-accent` マルサラ／
  `--color-dark` エスプレッソ）になっているので、色を変えるときは値だけ書き換えます。

### JavaScript

- スクロールアニメーションは `IntersectionObserver` で実装。
  `js/main.js` の `SCROLL_ANIMATIONS` の表に「セレクタ・付けるクラス・遅延」を1行足せば追加できます。
- `prefers-reduced-motion`（OS の「動きを減らす」設定）がオンのときは、アニメーションせずに最初から全部表示します。
- JS が無効な環境でも内容が隠れたままにならないよう、`animation.css` に `@media (scripting: none)` の代替スタイルがあります。

### アクセシビリティ

- すべての `<img>` に `alt`（装飾目的の画像は `alt=""`）。
- メニューは `<button aria-expanded>`。Esc で閉じます。
- キーボード操作用の「本文へスキップ」リンク、`:focus-visible` のフォーカス表示あり。
- ホバー演出は `opacity` で薄くせず、背景色を少し変える（色は `foundation.css` の `--color-*-hover` / `--color-hover-veil-*`）。
- 画面の拡大を禁止しない（viewport に `maximum-scale` を書かない）。

### 画像

- WebP。`<picture>` + `media` で PC / SP の画像を出し分け、不要な方はダウンロードされません。
- `width` / `height` 属性を必ず書く（表示崩れ＝CLS 防止）。ファーストビュー以外は `loading="lazy"`。

### 色面・背景の色（CSS で色を付けている）

**写真の色面と PRICE の背景は CSS で色を付けている。写真を差し替えるときは元の写真だけ、色を変えるときは `foundation.css` の変数だけ変えればいい。**

- 写真の色面（TOP の2枚・SHOPS・フッター）：色付きの別画像は使わず、元の写真と同じ画像に色を重ねる（`.c-tint`）。
  写真の彩度・明るさを `filter` で整え、色を2枚（`overlay` → `multiply`）重ねている。
  同じ画像を使うので、追加のダウンロードは発生しない。
  色は `--photo-tint-overlay` / `--photo-tint-multiply` / `--photo-tint-saturate` / `--photo-tint-brightness` / `--photo-tint-contrast`。
- PRICE の背景：
  - 塗りつぶしの図形は HTML 内の SVG（色は `--price-shape-main` / `--price-shape-sub` / `--price-base`）
  - 水玉模様は形だけの白黒画像（`images/pc/price_dots.webp` / `images/sp/price_dots.webp`、白＝濃い水玉）を `mask-image` で型抜きし、色は `--price-dots`
- 3年前の黄色の見た目を再現する値は、`foundation.css` のコメントに残してある。
- 注意：`mask-image` の画像はブラウザのセキュリティの仕様で、`index.html` をファイルとして直接開いた場合（`file://`）は読み込まれず、水玉模様だけ表示されない。
  GitHub Pages などのサーバー経由、またはローカルで `python3 -m http.server` などを使えば表示される。

## 今後の TODO

**トップページのみの制作。行き先のないリンクは作らず、mailto: とページ内のFAQで代替**

- リンクの方針：押せる見た目にするなら本当の行き先を用意する。行き先がないなら押せる見た目もやめる。`href="#"` は使わない
  - お問い合わせ：`mailto:info@example.com`（件名を `subject` で指定）。メールアドレスは例示用に予約された `example.com` を使用（実在のドメインを避けるため）
  - オンラインショップ・英語版（ENGLISH）：`href` のない `<a>` に「（準備中）」を添えて表示のみ（指カーソル・ホバー演出なし）
  - 海外サイトのリンク、NEWS PAGE ボタン、SNS アイコンは削除済み
  - FAQ はページ内（CONTACT - FAQ セクションの `#faq`、`<details>` / `<summary>` で開閉、JavaScript なし）に作成済み。
    これで `href="#"` はなくなった
- 文章のティラミス版への差し替え：「記憶に残る、ひとくち」（p-memory）、HOW TO EAT（p-eat）、
  PHILOSOPHY / DESIGN（p-passion。各項目に説明文 `.p-passion__itemText` を追加）は差し替え済み。
  ACCESS（旧 SHOPS。`#access`、お店の情報を追加）と NEWS（4件）も差し替え済み。
  CONTACT の会社情報（1店舗のお店の内容、5項目）も差し替え済み。
  ESSENCE（`#essence`）もティラミスの3素材（ESPRESSO / MASCARPONE / SAVOIARDI）に組み替え済み。
  2種類のレイアウトを `p-material__item--a` / `--b` で交互に使う（a → b → a）。
  残り：写真の差し替えと写真の説明（alt）。ESSENCE の3つ目（SAVOIARDI）の写真は仮
- 写真・ロゴ・HOW TO EAT のアイコン画像をティラミスの素材に差し替え（画像はまとめて差し替える予定）
- 公開時：サーバー側でキャッシュ（`Cache-Control`）設定と、CSS/JS の圧縮（minify）

## 改修履歴

- 2026-11: Sass → 素の CSS へ移行、jQuery 撤廃、画像 WebP 化（約 20MB → 約 1.2MB）、HTML 構文エラー 60件 → 0件、
  アクセシビリティ対応。改修前の状態はブランチ `backup/original-sass` とタグ `v1-original-sass` に残しています。
