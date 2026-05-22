"use client";

import { useState } from "react";

type Section = "gps" | "faq" | "start";

const FAQ_ITEMS = [
  {
    q: "GPS記録が始まらない",
    a: "ブラウザの位置情報許可が必要です。このページの「GPS許可の設定方法」を確認してください。iPhoneはSafari設定から、AndroidはChromeの設定から許可できます。",
  },
  {
    q: "画面を閉じるとGPS記録が止まる",
    a: "Webアプリの仕様上、画面をオフにすると記録が止まる場合があります。端末の「画面自動ロック」をOFFに設定してください。また、記録中は画面オフ防止機能が自動でONになります（対応ブラウザのみ）。",
  },
  {
    q: "プロフィールの変更が保存されない",
    a: "「保存する」ボタンをタップしてから緑色の「✓ 保存しました」メッセージが表示されれば保存完了です。端末のストレージがいっぱいの場合は保存できないことがあります。",
  },
  {
    q: "下書きがどこにあるかわからない",
    a: "投稿ページ右上の「📂 下書き一覧」ボタンから確認できます。件数バッジが表示されていれば保存済みです。",
  },
  {
    q: "アバターを変更したい",
    a: "マイページ → プロフィール編集 → 「🎨 アバターを変更」ボタンをタップしてください。ライダーシルエット8種・カラーアイコン8種の計16種類から選べます。",
  },
  {
    q: "ルートや走行記録がどこに保存されるか",
    a: "現在はお使いの端末のブラウザ内（localStorage）に保存されています。ブラウザのデータをクリアすると削除されます。大切なルートは「ライブラリに保存」してください。",
  },
  {
    q: "アプリをホーム画面に追加したい",
    a: "iPhoneのSafariで開いた状態で、画面下の共有ボタン(□↑)→「ホーム画面に追加」をタップ。Androidはブラウザのメニュー→「ホーム画面に追加」です。",
  },
  {
    q: "GPS記録の精度が低い・ずれる",
    a: "屋外で使用してください。建物の中や地下ではGPS信号が弱くなります。端末の「高精度モード」をONにすると精度が上がります（設定→位置情報→精度の改善）。",
  },
];

export default function HelpPage() {
  const [section, setSection] = useState<Section>("gps");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-4">
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-1">❓ ヘルプ / よくある質問</h1>
        <p className="text-gray-400 text-sm">お困りの際はこちらをご確認ください</p>
      </div>

      {/* Section tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {([
          { key: "gps",   label: "GPS設定" },
          { key: "start", label: "はじめかた" },
          { key: "faq",   label: "よくある質問" },
        ] as { key: Section; label: string }[]).map((t) => (
          <button key={t.key} onClick={() => setSection(t.key)}
            style={section === t.key
              ? { background: "#ff6b00", color: "white", border: "none", padding: "10px 0", borderRadius: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer", flex: 1, textAlign: "center" }
              : { background: "#13131a", color: "#9ca3af", border: "1px solid #252535", padding: "10px 0", borderRadius: "10px", fontWeight: 600, fontSize: "14px", cursor: "pointer", flex: 1, textAlign: "center" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── GPS設定 ── */}
      {section === "gps" && (
        <div className="space-y-5">
          <div className="card p-4" style={{background:"rgba(255,107,0,0.08)", borderColor:"rgba(255,107,0,0.3)"}}>
            <p className="text-sm font-bold text-[#ff6b00] mb-1">📍 GPS（位置情報）を許可してください</p>
            <p className="text-sm text-gray-400">走行記録機能を使うには、ブラウザの位置情報許可が必要です。</p>
          </div>

          {/* iPhone Safari */}
          <div className="card p-5 space-y-4">
            <h2 className="font-black text-lg flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18" strokeWidth="3"/></svg>
              iPhone — Safari
            </h2>

            <div className="space-y-3">
              {[
                { step: 1, title: "iPhoneの「設定」を開く", desc: "ホーム画面の⚙️設定アプリをタップ" },
                { step: 2, title: "「Safari」をタップ", desc: "設定一覧をスクロールして「Safari」を選択" },
                { step: 3, title: "「位置情報」をタップ", desc: "" },
                { step: 4, title: "「確認」を選択", desc: "「許可しない」になっている場合は「確認」または「このAppの使用中」に変更" },
              ].map((s) => (
                <div key={s.step} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-black"
                    style={{background:"rgba(255,107,0,0.2)", color:"#ff6b00"}}>{s.step}</div>
                  <div>
                    <p className="text-sm font-semibold">{s.title}</p>
                    {s.desc && <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#1a1a25] rounded-xl p-4 text-sm">
              <p className="font-bold text-yellow-400 mb-2">⚠️ Safari特有の注意点</p>
              <ul className="space-y-1.5 text-gray-400 text-xs">
                <li>• 画面をオフにすると記録が止まる場合があります</li>
                <li>• 「設定 → 画面表示と明るさ → 自動ロック → しない」で画面を常時オンに</li>
                <li>• 充電しながら走行することをおすすめします</li>
              </ul>
            </div>

            <div className="bg-[#1a1a25] rounded-xl p-4">
              <p className="font-bold text-sm mb-2">📱 ホーム画面に追加する方法</p>
              <ol className="space-y-1 text-xs text-gray-400">
                <li>1. Safariで <span className="text-[#ff6b00]">motohub-psi.vercel.app</span> を開く</li>
                <li>2. 画面下の「共有」ボタン（□↑）をタップ</li>
                <li>3. 「ホーム画面に追加」をタップ</li>
                <li>4. アイコンがホーム画面に表示されます</li>
              </ol>
            </div>
          </div>

          {/* Android Chrome */}
          <div className="card p-5 space-y-4">
            <h2 className="font-black text-lg flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
              Android — Chrome
            </h2>

            <div className="space-y-3">
              {[
                { step: 1, title: "Chromeでサイトを開く", desc: "motohub-psi.vercel.app をChromeで開く" },
                { step: 2, title: "GPS記録ボタンをタップ", desc: "画面右下の🛣️アイコン → 記録開始" },
                { step: 3, title: "許可ダイアログが出たら「許可」", desc: "「位置情報へのアクセスを許可しますか？」→「許可」をタップ" },
                { step: 4, title: "許可されない場合は設定から", desc: "Chromeのアドレスバー左のアイコン → 「位置情報」→「許可」" },
              ].map((s) => (
                <div key={s.step} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-black"
                    style={{background:"rgba(74,222,128,0.2)", color:"#4ade80"}}>{s.step}</div>
                  <div>
                    <p className="text-sm font-semibold">{s.title}</p>
                    {s.desc && <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#1a1a25] rounded-xl p-4 text-sm">
              <p className="font-bold text-green-400 mb-2">✅ Chromeのメリット</p>
              <ul className="space-y-1.5 text-gray-400 text-xs">
                <li>• Wake Lock API（画面オフ防止）に対応</li>
                <li>• Safari より GPS の精度が高い場合がある</li>
                <li>• バックグラウンド動作が比較的安定</li>
              </ul>
            </div>
          </div>

          {/* PC Chrome */}
          <div className="card p-5 space-y-3">
            <h2 className="font-black text-lg flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              PC — Chrome / Edge
            </h2>
            <div className="space-y-2 text-sm text-gray-400">
              <p>1. Chromeアドレスバー左の 🔒 または ℹ️ をクリック</p>
              <p>2. 「位置情報」→「許可」を選択</p>
              <p>3. ページをリロードして再試行</p>
            </div>
            <div className="bg-[#1a1a25] rounded-xl p-3">
              <p className="text-xs text-gray-500">※ PCのGPSはWi-Fiや電波塔の位置情報を使うため精度が低い場合があります。走行記録にはスマホ使用を推奨します。</p>
            </div>
          </div>

          {/* Wake Lock説明 */}
          <div className="card p-5" style={{borderColor:"rgba(16,185,129,0.3)", background:"rgba(16,185,129,0.04)"}}>
            <h3 className="font-bold mb-3 text-green-400">🔆 画面オフ防止機能について</h3>
            <p className="text-sm text-gray-400 mb-3">
              GPS記録を開始すると「画面オフ防止 ON」が有効になります。
              これにより画面が消えずGPS記録が継続します。
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <p>✅ <span className="text-gray-300">対応：</span> Chrome（Android/PC）, Safari 16.4以上（iPhone）</p>
              <p>⚠️ <span className="text-gray-300">非対応時：</span> 端末の自動ロックを「しない」に設定してください</p>
              <p>🔋 <span className="text-gray-300">注意：</span> 画面が常時ONになりバッテリーを消費します。USB給電を推奨します</p>
            </div>
          </div>
        </div>
      )}

      {/* ── はじめかた ── */}
      {section === "start" && (
        <div className="space-y-4">
          <div className="card p-5" style={{background:"linear-gradient(135deg, rgba(255,107,0,0.1), rgba(204,85,0,0.05))", borderColor:"rgba(255,107,0,0.3)"}}>
            <h2 className="font-black text-xl mb-1">MotoHubへようこそ！</h2>
            <p className="text-sm text-gray-400">バイク乗りのための総合アプリです。まずはこの順番で設定しましょう。</p>
          </div>

          {[
            {
              step: 1, icon: "👤", title: "プロフィールを設定",
              desc: "マイページ → プロフィール編集 から名前・愛車・アバターを設定しましょう。",
              link: "/profile",
            },
            {
              step: 2, icon: "🏍️", title: "愛車をガレージに登録",
              desc: "マイガレージ → バイクを追加 からメーカー・モデル・走行距離を登録します。",
              link: "/garage",
            },
            {
              step: 3, icon: "📍", title: "GPS走行記録を試す",
              desc: "画面右下の🛣️ボタンをタップ → 記録開始。ツーリングの距離・速度を自動記録します。",
              link: null,
            },
            {
              step: 4, icon: "⛽", title: "給油を記録する",
              desc: "燃費管理ページから給油量・金額を記録すると燃費が自動計算されます。",
              link: "/fuel",
            },
            {
              step: 5, icon: "🏆", title: "実績・バッジを確認",
              desc: "走行記録が増えると自動でバッジが解除されます。16種類のバッジを集めましょう！",
              link: "/achievements",
            },
          ].map((item) => (
            <div key={item.step} className="card p-5 flex gap-4 items-start hover:border-[#3a3a4a] transition-colors">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
                style={{background:"rgba(255,107,0,0.15)"}}>
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:"rgba(255,107,0,0.15)", color:"#ff6b00"}}>
                    STEP {item.step}
                  </span>
                  <span className="font-bold text-sm">{item.title}</span>
                </div>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              {item.link && (
                <a href={item.link} className="btn-primary text-xs px-3 py-1.5 shrink-0">開く</a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── よくある質問 ── */}
      {section === "faq" && (
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="card overflow-hidden transition-all">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-semibold text-sm pr-4">{item.q}</span>
                <span style={{ fontSize: "18px", color: "#ff6b00", flexShrink: 0, transition: "transform 0.2s",
                  transform: openFaq === i ? "rotate(45deg)" : "none" }}>＋</span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 border-t border-[#252535]">
                  <p className="text-sm text-gray-400 leading-relaxed pt-3">{item.a}</p>
                </div>
              )}
            </div>
          ))}

          <div className="card p-5 mt-4" style={{borderColor:"rgba(255,107,0,0.3)", background:"rgba(255,107,0,0.05)"}}>
            <p className="font-bold mb-2">🙋 解決しない場合は</p>
            <p className="text-sm text-gray-400">アプリを更新（ブラウザをリロード）してお試しください。それでも解決しない場合は、ブラウザのキャッシュをクリアしてみてください。</p>
          </div>
        </div>
      )}
    </div>
  );
}
