"use client";

import { useState } from "react";

const APP_URL = "https://motohub-psi.vercel.app";
const APP_NAME = "MotoHub";
const SHARE_TEXT = "バイク乗りの総合コミュニティ「MotoHub」。GPS走行記録・ルート共有・燃費管理・スポットクチコミが無料で使えます！";

const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&color=ff6b00&bgcolor=111120&data=${encodeURIComponent(APP_URL)}`;

const shareTargets = [
  {
    name: "LINE",
    icon: "💬",
    color: "#06C755",
    bg: "rgba(6,199,85,0.12)",
    border: "rgba(6,199,85,0.3)",
    url: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(APP_URL)}`,
  },
  {
    name: "X (Twitter)",
    icon: "𝕏",
    color: "#ffffff",
    bg: "rgba(255,255,255,0.08)",
    border: "rgba(255,255,255,0.2)",
    url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(APP_URL)}&text=${encodeURIComponent(SHARE_TEXT)}`,
  },
  {
    name: "Facebook",
    icon: "f",
    color: "#1877F2",
    bg: "rgba(24,119,242,0.12)",
    border: "rgba(24,119,242,0.3)",
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_URL)}`,
  },
  {
    name: "Instagram",
    icon: "📷",
    color: "#E1306C",
    bg: "rgba(225,48,108,0.12)",
    border: "rgba(225,48,108,0.3)",
    url: null, // コピー促す
    note: "URLをコピーしてストーリーズに貼付",
  },
];

export default function ShareModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(APP_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // スマホのネイティブ共有シート（Web Share API）
  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: APP_NAME,
        text: SHARE_TEXT,
        url: APP_URL,
      });
    }
  };

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={onClose}
    >
      <div
        className="card w-full max-w-sm"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#252535]">
          <h2 className="font-black text-lg">🔗 MotoHubを共有</h2>
          <button
            onClick={onClose}
            style={{
              width: "32px", height: "32px", borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#a0a0c0", fontSize: "16px", cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* QR Code */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-3">スマホで読み取り</p>
            <div
              className="inline-block p-3 rounded-2xl"
              style={{ background: "#111120", border: "1px solid #252535" }}
            >
              <img
                src={QR_URL}
                alt="QRコード"
                width={180}
                height={180}
                className="rounded-lg"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">カメラで読み取るとMotoHubが開きます</p>
          </div>

          {/* URL コピー */}
          <div>
            <p className="text-sm text-gray-400 mb-2">URLをコピー</p>
            <div className="flex gap-2">
              <div
                className="flex-1 text-sm text-gray-300 px-3 py-2.5 rounded-lg truncate"
                style={{ background: "#0d0d18", border: "1px solid #252535" }}
              >
                {APP_URL}
              </div>
              <button
                onClick={copyUrl}
                className="px-4 py-2.5 rounded-lg text-sm font-bold transition-all shrink-0"
                style={copied
                  ? { background: "rgba(16,185,129,0.2)", color: "#10b981", border: "1px solid rgba(16,185,129,0.4)" }
                  : { background: "rgba(255,107,0,0.15)", color: "#ff6b00", border: "1px solid rgba(255,107,0,0.4)" }}
              >
                {copied ? "✓ コピー済" : "コピー"}
              </button>
            </div>
          </div>

          {/* SNS シェアボタン */}
          <div>
            <p className="text-sm text-gray-400 mb-3">SNSでシェア</p>
            <div className="grid grid-cols-2 gap-3">
              {shareTargets.map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    if (t.url) {
                      window.open(t.url, "_blank", "noopener,noreferrer");
                    } else {
                      copyUrl();
                    }
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl transition-all hover:opacity-80 text-left"
                  style={{
                    background: t.bg,
                    border: `1px solid ${t.border}`,
                    color: t.color,
                  }}
                >
                  <span className="text-xl font-bold w-7 text-center shrink-0">{t.icon}</span>
                  <div>
                    <div className="text-sm font-bold">{t.name}</div>
                    {t.note && <div className="text-xs opacity-70">{t.note}</div>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* スマホのネイティブ共有（iOS/Android） */}
          {canNativeShare && (
            <button
              onClick={nativeShare}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all"
              style={{
                background: "linear-gradient(135deg, #ff6b00, #ff8c38)",
                color: "white",
                boxShadow: "0 4px 16px rgba(255,107,0,0.35)",
              }}
            >
              📤 その他のアプリで共有
            </button>
          )}

          {/* メッセージ例 */}
          <div
            className="rounded-xl p-4"
            style={{ background: "#0d0d18", border: "1px solid #252535" }}
          >
            <p className="text-xs text-gray-500 mb-2">📝 シェア用メッセージ（コピーして使えます）</p>
            <p className="text-sm text-gray-300 leading-relaxed">{SHARE_TEXT}</p>
            <button
              onClick={() => { navigator.clipboard.writeText(SHARE_TEXT); }}
              className="text-xs mt-2 transition-colors"
              style={{ color: "#ff6b00" }}
            >
              メッセージをコピー
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
