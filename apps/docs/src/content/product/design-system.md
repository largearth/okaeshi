---
title: デザインルール
description: プロダクト UI に共通する配色、アイコン、形状のルール
order: 5
---

# デザインルール

画面ごとの表現にばらつきが出ないよう、すべてのフロントエンド UI は以下のルールに従う。

<div class="design-preview" aria-label="配色のプレビュー">
  <div class="swatch swatch-main"><strong>Main</strong><span>White<br>#FFFFFF</span></div>
  <div class="swatch swatch-sub"><strong>Sub</strong><span>Black<br>#000000</span></div>
  <div class="swatch swatch-accent"><strong>Accent</strong><span>Green<br>#00B957</span></div>
</div>

## カラー

| 役割       | カラー       | 使用箇所                                       |
| ---------- | ------------ | ---------------------------------------------- |
| メイン     | 白 `#FFFFFF` | 画面背景、カード、入力欄                       |
| サブ       | 黒 `#000000` | 文字、罫線、主要 CTA、アイコン                 |
| アクセント | 緑 `#00B957` | 選択状態、通知ドット、強調が必要な最小限の箇所 |

緑を背景や本文に多用せず、ユーザーの注意を向ける状態だけに使用する。

## アイコン

**アイコンは必ず [Hugeicons](https://hugeicons.com/) を使用する。**

- 独自 SVG、絵文字、別アイコンライブラリを新規に追加しない。
- 原則として outline スタイルを使い、線幅とサイズを画面内で統一する。
- アイコン単体の操作には、必要に応じて `aria-label` を設定する。
- フロントエンドでは `@hugeicons/react` と `@hugeicons/core-free-icons` を使用する。

## 形状と罫線

角丸は中途半端に使わず、次の二択に限定する。

<div class="shape-preview" aria-label="形状のルール">
  <div><span class="shape-square"></span><strong>四角</strong><small>カード、入力欄、CTA</small></div>
  <div><span class="shape-pill">状態</span><strong>完全な丸</strong><small>バッジ、通知、アバター</small></div>
  <div class="shape-avoid"><span></span><strong>使用しない</strong><small>中途半端な角丸</small></div>
</div>

- 情報を区切る要素は `border-radius: 0` の四角を使う。
- 状態や小さなラベルは `50%` または `9999px` の完全な丸を使う。
- 罫線は原則 1px の黒を使う。影・グラデーションは使わない。

## コンポーネントの見本

<div class="component-preview">
  <button type="button" class="preview-button">支払いを記録する</button>
  <span class="preview-badge">未精算</span>
  <div class="preview-field">金額を入力</div>
</div>

| コンポーネント  | ルール                             |
| --------------- | ---------------------------------- |
| 主要 CTA        | 黒背景・白文字・角丸なし           |
| 入力欄 / カード | 白背景・黒 1px 罫線・角丸なし      |
| バッジ          | 白背景・黒 1px 罫線・完全な丸      |
| 選択状態        | 緑を小さなドットや補助線として使用 |

## 実装チェック

- Tailwind CSS のユーティリティクラスでスタイルを記述する。
- 画面を追加・変更するときは、本ページの色・形状・アイコン規則を確認する。
- 規則の例外が必要な場合は、実装前に理由と対象範囲を明確にする。
