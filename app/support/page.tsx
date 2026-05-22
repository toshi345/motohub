"use client";

import { useState } from "react";
import { toast } from "@/components/Toast";

const AFFILIATE_ITEMS = [
  {
    id: 1,
    category: "ヘルメット",
    name: "Shoei Z-8",
    desc: "軽量・高剛性シェル。ツーリングからスポーツ走行まで対応",
    price: "¥68,200〜",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80",
    tag: "人気No.1",
    tagColor: "#ff6b00",
    url: "#",
  },
  {
    id: 2,
    category: "グローブ",
    name: "RSタイチ レザーグローブ",
    desc: "プロテクター付き本革グローブ。操作性と安全性を両立",
    price: "¥12,800〜",
    img: "https://images.unsplash.com/photo-1558618047-f4e80a5d7f6c?w=300&q=80",
    tag: "おすすめ",
    tagColor: "#10b981",
    url: "#",
  },
  {
    id: 3,
    category: "ドライブレコーダー",
    name: "デイトナ バイク用ドラレコ",
    desc: "前後カメラ対応。万が一の事故時に安心の証拠映像を記録",
    price: "¥24,800〜",
    img: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=300&q=80",
    tag: "安全装備",
    tagColor: "#3b82f6",
    url: "#",
  },
  {
    id: 4,
    category: "スマホホルダー",
    name: "クアッドロック バイクマウント",
    desc: "振動・脱落に強い。MotoHubをハンドルで確認できる",
    price: "¥6,980〜",
    img: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300&q=80",
    tag: "MotoHub対応",
    tagColor: "#ff6b00",
    url: "#",
  },
  {
    id: 5,
    category: "インカム",
    name: "SENA 50S",
    desc: "グループツーリングに最適。最大8名同時通話可能",
    price: "¥42,000〜",
    img: "https://images.unsplash.com/photo-1580979563019-9f3b07df9cf4?w=300&q=80",
    tag: "ツーリング向け",
    tagColor: "#8b5cf6",
    url: "#",
  },
  {
    id: 6,
    category: "タイヤ",
    name: "ミシュラン パイロットロード5",
    desc: "雨天時の安定性と乾燥路のグリップを両立したツーリングタイヤ",
    price: "¥22,000〜",
    img: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&q=80",
    tag: "ロングライフ",
    tagColor: "#f59e0b",
    url: "#",
  },
];

const DONATION_AMOUNTS = [300, 500, 1000, 3000];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<"donate" | "affiliate">("donate");
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleDonate = () => {
    const amount = customAmount ? parseInt(customAmount) : selectedAmount;
    toast(`❤️ ¥${amount.toLocaleString()} のサポートありがとうございます！（デモ）`, "info");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-4">
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-1">❤️ サポート & アイテム</h1>
        <p className="text-gray-400 text-sm">MotoHubの開発を応援する・おすすめバイク用品を探す</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {([
          { key: "donate", label: "❤️ 寄付・サポート" },
          { key: "affiliate", label: "🛒 おすすめ用品" },
        ] as { key: typeof activeTab; label: string }[]).map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={activeTab === t.key
              ? { background: "#ff6b00", color: "white", border: "none", padding: "12px 0", borderRadius: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer", flex: 1, textAlign: "center" }
              : { background: "#13131a", color: "#9ca3af", border: "1px solid #252535", padding: "12px 0", borderRadius: "10px", fontWeight: 600, fontSize: "14px", cursor: "pointer", flex: 1, textAlign: "center" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 寄付タブ */}
      {activeTab === "donate" && (
        <div className="space-y-5">
          {/* メッセージ */}
          <div className="card p-6 text-center" style={{ background: "linear-gradient(135deg, rgba(255,107,0,0.1), rgba(204,85,0,0.05))", borderColor: "rgba(255,107,0,0.3)" }}>
            <div className="text-5xl mb-3">🏍️</div>
            <h2 className="text-xl font-black mb-2">MotoHubの開発を応援してください</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              MotoHubはバイク乗りのために作った完全無料のアプリです。<br />
              サーバー費用・開発継続のため、ご支援いただけると大変助かります。<br />
              100円からでも嬉しいです！
            </p>
          </div>

          {/* 使途 */}
          <div className="card p-5">
            <h3 className="font-bold mb-4">💰 いただいたサポートの使い道</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: "🖥️", label: "サーバー費用", desc: "アプリの安定稼働" },
                { icon: "🤖", label: "AI機能強化", desc: "イラスト変換の改善" },
                { icon: "🗺️", label: "新機能開発", desc: "地図・コミュニティ機能" },
              ].map((item) => (
                <div key={item.label} className="bg-[#1a1a25] rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-sm font-bold">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 金額選択 */}
          <div className="card p-5 space-y-4">
            <h3 className="font-bold">❤️ サポート金額を選択</h3>
            <div className="grid grid-cols-4 gap-2">
              {DONATION_AMOUNTS.map((amount) => (
                <button key={amount} onClick={() => { setSelectedAmount(amount); setCustomAmount(""); }}
                  className="py-3 rounded-xl font-bold text-sm transition-all"
                  style={selectedAmount === amount && !customAmount
                    ? { background: "#ff6b00", color: "white", border: "none" }
                    : { background: "#1a1a25", color: "#9ca3af", border: "1px solid #252535" }}>
                  ¥{amount.toLocaleString()}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">金額を入力（任意）</label>
              <input type="number" value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="例: 2000" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">応援メッセージ（任意）</label>
              <textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="開発者へのメッセージをどうぞ..."
                style={{ resize: "none" }} />
            </div>
            <button onClick={handleDonate} className="btn-primary w-full py-4 text-base">
              ❤️ ¥{(customAmount ? parseInt(customAmount) || 0 : selectedAmount).toLocaleString()} サポートする
            </button>
            <p className="text-xs text-gray-500 text-center">
              ※ 現在はデモ表示です。近日中に決済機能を実装予定です。
            </p>
          </div>

          {/* 他の支援方法 */}
          <div className="card p-5">
            <h3 className="font-bold mb-4">📢 無料でできる応援方法</h3>
            <div className="space-y-3">
              {[
                { icon: "🔗", label: "友人にシェアする", desc: "SNSやLINEで紹介してください", action: () => toast("プロフィールの「アプリを共有」からシェアできます！", "info") },
                { icon: "⭐", label: "口コミを広める", desc: "バイク仲間に教えてください", action: () => toast("ありがとうございます！", "info") },
                { icon: "💬", label: "フィードバックをくれる", desc: "改善点・要望を教えてください", action: () => toast("フィードバックは大歓迎です！", "info") },
              ].map((item) => (
                <button key={item.label} onClick={item.action}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-[#1a1a25]">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="text-sm font-bold">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* アフィリエイトタブ */}
      {activeTab === "affiliate" && (
        <div className="space-y-4">
          <div className="card p-4" style={{ background: "rgba(59,130,246,0.08)", borderColor: "rgba(59,130,246,0.2)" }}>
            <p className="text-sm text-blue-400">
              🛒 MotoHubがおすすめするバイク用品です。購入いただくとアプリの開発費に一部充てられます。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AFFILIATE_ITEMS.map((item) => (
              <div key={item.id} className="card overflow-hidden hover:border-[#3a3a4a] transition-all hover:-translate-y-0.5 group">
                <div className="relative overflow-hidden h-40">
                  <img src={item.img} alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: item.tagColor, color: "white" }}>
                    {item.tag}
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {item.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm mb-1">{item.name}</h3>
                  <p className="text-xs text-gray-400 mb-3 leading-relaxed">{item.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-black" style={{ color: "#ff6b00" }}>{item.price}</span>
                    <button onClick={() => toast("🛒 商品ページに移動します（デモ）", "info")}
                      className="text-xs btn-primary py-2 px-4">
                      詳細を見る →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-600 text-center pb-4">
            ※ 価格は参考価格です。実際の価格は販売サイトをご確認ください。
            <br />アフィリエイトリンクからの購入がMotoHubの運営を支えます。
          </p>
        </div>
      )}
    </div>
  );
}
