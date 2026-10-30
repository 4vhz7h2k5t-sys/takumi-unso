# デモ問い合わせフォーム / Resend接続境界

現在は通信・メール送信・データベース保存・ブラウザー保存を行いません。画面内の確認表示のみです。JS無効時は入力フォームをinert、ボタンをdisabledにし、意図しない標準GET送信を防ぎます。

- UI: `scripts/pages.mjs` の `contactForm()`
- フィールド: `src/contact.js` の `inquiryFields`
- 正規化: `buildInquiry(form)`
- 接続境界: `submitInquiry(payload)`。現在は `{mode:'demo',sent:false,payload}` を返すだけです。

クライアント側のResendアカウント接続時は、この境界から同一オリジンのWorker APIを呼ぶよう変更します。Resendへの通信はWorker内で実施し、`RESEND_API_KEY` はCloudflare Secret、送信元はクライアントが認証したドメイン、宛先はサーバー設定で管理します。ブラウザーへAPIキーを渡さないでください。

本送信を実装する時は、Worker側で入力スキーマ・長さ・メール形式を再検証し、レート制限と迷惑送信対策を加え、メール本文の値を安全にエスケープしてください。クライアントに確認した個人情報の扱いをフォームに掲載し、成功・失敗表示、保存・削除方針を確定してください。現時点では本送信APIもメールプロバイダーの依存も追加していません。
