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

ビルドは不要です。`index.html` をブラウザで開けば動きます。

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
- 画面の拡大を禁止しない（viewport に `maximum-scale` を書かない）。

### 画像

- WebP。`<picture>` + `media` で PC / SP の画像を出し分け、不要な方はダウンロードされません。
- `width` / `height` 属性を必ず書く（表示崩れ＝CLS 防止）。ファーストビュー以外は `loading="lazy"`。

## 今後の TODO

- リンク先が未定のもの（`href="#"`：オンラインショップ、SNS、お問い合わせ各種、海外サイト）を実際の URL に差し替える
- 英語ページ（`hreflang="en"`）の作成
- 公開時：サーバー側でキャッシュ（`Cache-Control`）設定と、CSS/JS の圧縮（minify）
- NEWS の内容が 2022 年のままなので更新

## 改修履歴

- 2026-11: Sass → 素の CSS へ移行、jQuery 撤廃、画像 WebP 化（約 20MB → 約 1.2MB）、HTML 構文エラー 60件 → 0件、
  アクセシビリティ対応。改修前の状態はブランチ `backup/original-sass` とタグ `v1-original-sass` に残しています。
