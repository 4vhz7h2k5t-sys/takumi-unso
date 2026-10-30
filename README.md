# たくみ運送株式会社 — Independent Concept Website

RENTA STUDIOによる自主制作の非公式デモ。既存Wixサイトとは独立したWebサイトです。

- 公開: https://takumi-unso.ur24-jp.workers.dev/
- TOP / COMPANY / RECRUIT
- CMS: `/admin/`
- Vite / GSAP ScrollTrigger / Cloudflare Workers + D1

## 開発

```sh
npm ci
npm run dev
npm run build
npm run check
npx wrangler d1 migrations apply takumi-unso-cms --local
npm run preview
node scripts/test-cms.mjs
```

`dev` は静的Viteサーバー。CMSを含めた確認は `preview`（127.0.0.1:8793）を使用。API未接続時にも職種紹介を表示します。管理用キーは未追跡の `.dev.vars` にあります。

## デプロイ

```sh
npm run build
npm run check
npx wrangler d1 migrations apply takumi-unso-cms --remote
npx wrangler secret put ADMIN_KEY
npx wrangler deploy
```

ADMIN_KEYは推測できない十分な長さのランダムな値を設定。キー変更で既存セッションは無効になります。秘密情報をGitに含めないでください。

## 採用CMS

管理画面へ管理キーでログイン（8時間のHttpOnly / Secure / SameSite=Strictセッション）。2職種の募集状況・紹介・仕事内容・勤務地・資格・給与・勤務時間・休日・待遇・研修を更新できます。D1保存後、採用ページに反映されます。別画面との更新衝突を検出。ログイン試行はIPのHMAC値をキーに15分あたり5回まで。

条件が不明な初期項目は「採用窓口にご確認ください」。採用情報の現時点での正しさを公式窓口へ確認したうえで更新してください。応募フォームや個人情報収集は設けず、公式求人ページに案内します。

## ページ生成と演出

- `scripts/pages.mjs`: 共通ヘッダー・フッターを含むHTMLの生成元
- `src/scene.svg`: 実車写真に基づく独自イラスト
- `scripts/create-scene.py`: SVGの再生成元
- `src/main.js`: 4工程のスクロール連動、モバイルメニュー
- `src/content.js`: 確認済み資料に基づく初期職種紹介
- `src/render-jobs.js`: JavaScript無効時にも読める職種表示
- `worker/index.js`: 公開API・管理認証・更新API・配信ヘッダー
- `docs/RESEARCH.md`: 情報源と仮素材の出典
- `docs/QA.md`: 検証記録

スクロールはブラウザー標準を維持。工程ボタンで移動でき、本文へのスキップも可能。OSの「視差効果を減らす」設定では固定スクロールを解除し、工程をボタンで選ぶ静止表示に切り替えます。

全ページのmeta robots、X-Robots-Tag、robots.txtでインデックスを拒否。これはアクセス制限ではありません。非公式デモ表記をヘッダーとフッターに常時掲載。写真等の正式利用は権利者の確認が前提です。
