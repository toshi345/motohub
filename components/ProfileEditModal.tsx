"use client";

import { useState } from "react";
import { toast } from "@/components/Toast";

export interface ProfileData {
  name: string;
  bio: string;
  bike: string;
  bikeYear: string;
  bikeType: string;
  location: string;
  avatarSeed: string;
  avatarBg: string;
}

const KEY = "motohub_profile";

export function loadProfile(): ProfileData {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) return { ...DEFAULT_PROFILE, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_PROFILE;
}

const DEFAULT_PROFILE: ProfileData = {
  name: "ライダー山田",
  bio: "全国ツーリング中🏍️ | 関東在住 | ソロツーリング大好き",
  bike: "Honda CB650R",
  bikeYear: "2022",
  bikeType: "ネイキッド",
  location: "東京都",
  avatarSeed: "c_orange",  // デフォルト：オレンジのカラーアバター
  avatarBg: "",
};

export function saveProfile(data: ProfileData) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

export function isHelmet(seed: string) { return seed.startsWith("helmet_"); }

// ── シンプルカラーアバター（幾何学デザイン）──────────────────────────────────
// colorAvatar_ prefix で識別
type ColorAvatarDef = { id: string; bg: string; fg: string; shape: string; label: string };
const COLOR_AVATARS: ColorAvatarDef[] = [
  { id: "c_orange", bg: "#ff6b00", fg: "#fff",    shape: "circle",   label: "オレンジ" },
  { id: "c_blue",   bg: "#1a4fa0", fg: "#7dd3fc",  shape: "triangle", label: "ブルー" },
  { id: "c_red",    bg: "#cc2200", fg: "#fca5a5",  shape: "diamond",  label: "レッド" },
  { id: "c_green",  bg: "#166534", fg: "#86efac",  shape: "circle",   label: "グリーン" },
  { id: "c_purple", bg: "#6d28d9", fg: "#c4b5fd",  shape: "triangle", label: "パープル" },
  { id: "c_teal",   bg: "#0e7490", fg: "#67e8f9",  shape: "diamond",  label: "ティール" },
  { id: "c_pink",   bg: "#9d174d", fg: "#f9a8d4",  shape: "circle",   label: "ピンク" },
  { id: "c_gray",   bg: "#374151", fg: "#d1d5db",  shape: "triangle", label: "グレー" },
];

function makeColorAvatarSvg(def: ColorAvatarDef): string {
  const shapeEl =
    def.shape === "circle"
      ? `<circle cx="50" cy="55" r="22" fill="${def.fg}" opacity="0.9"/>`
      : def.shape === "triangle"
      ? `<polygon points="50,30 72,72 28,72" fill="${def.fg}" opacity="0.9"/>`
      : /* diamond */ `<polygon points="50,28 72,55 50,80 28,55" fill="${def.fg}" opacity="0.9"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="50" fill="${def.bg}"/>
    ${shapeEl}
    <circle cx="50" cy="55" r="22" fill="none" stroke="${def.fg}" stroke-width="2" opacity="0.3"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// ── ヘルメットSVGアバター 3タイプ × 4色 ────────────────────────────────────
type HelmetType = "full" | "open" | "moto";
type HelmetDef = { id: string; type: HelmetType; shell: string; visor: string; label: string };
const HELMET_DEFS: HelmetDef[] = [
  // フルフェイス（ドーム型 + 横長バイザー）
  { id: "h_full_red",    type: "full", shell: "#cc2200", visor: "#0a1a40", label: "フル レッド" },
  { id: "h_full_blue",   type: "full", shell: "#1a4fa0", visor: "#0a2040", label: "フル ブルー" },
  { id: "h_full_black",  type: "full", shell: "#1a1a1a", visor: "#ff6b00", label: "フル ブラック" },
  { id: "h_full_white",  type: "full", shell: "#e0e0e0", visor: "#1a3060", label: "フル ホワイト" },
  // モトクロス（角型バイザー + チンガード）
  { id: "h_moto_red",    type: "moto", shell: "#cc2200", visor: "#222",    label: "クロス レッド" },
  { id: "h_moto_blue",   type: "moto", shell: "#1a4fa0", visor: "#222",    label: "クロス ブルー" },
  { id: "h_moto_green",  type: "moto", shell: "#166534", visor: "#222",    label: "クロス グリーン" },
  { id: "h_moto_yellow", type: "moto", shell: "#b45309", visor: "#222",    label: "クロス イエロー" },
];

function makeHelmetSvg(def: HelmetDef): string {
  let body = "";
  if (def.type === "full") {
    // フルフェイス
    body = `
      <ellipse cx="50" cy="50" rx="32" ry="36" fill="${def.shell}"/>
      <ellipse cx="42" cy="32" rx="10" ry="7" fill="rgba(255,255,255,0.2)" transform="rotate(-25 42 32)"/>
      <path d="M20 56 Q20 76 50 78 Q80 76 80 56 Q80 46 70 43 Q60 40 50 40 Q40 40 30 43 Q20 46 20 56Z" fill="${def.visor}"/>
      <path d="M26 53 Q34 50 44 49" stroke="rgba(255,255,255,0.3)" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <rect x="43" y="37" width="14" height="4" rx="2" fill="rgba(0,0,0,0.3)"/>
    `;
  } else {
    // モトクロス
    body = `
      <ellipse cx="50" cy="46" rx="30" ry="28" fill="${def.shell}"/>
      <rect x="22" y="28" width="56" height="12" rx="4" fill="rgba(0,0,0,0.5)"/>
      <rect x="24" y="30" width="52" height="8" rx="3" fill="${def.visor}"/>
      <path d="M22 58 Q28 72 50 74 Q72 72 78 58 L74 52 Q62 56 50 56 Q38 56 26 52 Z" fill="${def.shell}" stroke="rgba(0,0,0,0.2)" stroke-width="1"/>
      <line x1="42" y1="57" x2="58" y2="57" stroke="rgba(255,255,255,0.2)" stroke-width="3"/>
      <ellipse cx="38" cy="34" rx="6" ry="4" fill="rgba(255,255,255,0.25)" transform="rotate(-10 38 34)"/>
    `;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="50" fill="#111120"/>
    ${body}
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getAvatarUrl(seed: string, bg: string): string {
  if (seed.startsWith("c_")) {
    const def = COLOR_AVATARS.find((a) => a.id === seed);
    return def ? makeColorAvatarSvg(def) : makeColorAvatarSvg(COLOR_AVATARS[0]);
  }
  if (seed.startsWith("h_")) {
    const def = HELMET_DEFS.find((h) => h.id === seed);
    return def ? makeHelmetSvg(def) : makeHelmetSvg(HELMET_DEFS[0]);
  }
  // DiceBear fallback（既存ユーザー互換）
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=${bg}`;
}

const BIKE_TYPES = ["ネイキッド", "スポーツ", "ツアラー", "アドベンチャー", "オフロード", "スクーター", "クルーザー", "その他"];

// 旧コード互換（削除可能）
const _legacy = [
  { seed: "Yamada", bg: "b6e3f4", label: "旧ブルー" },
  { seed: "Rider5",  bg: "fef3c7", label: "イエロー" },
  { seed: "Rider6",  bg: "dbeafe", label: "スカイ" },
  { seed: "Rider7",  bg: "d1fae5", label: "ミント" },
];

export default function ProfileEditModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: ProfileData) => void;
}) {
  const [form, setForm] = useState<ProfileData>(loadProfile());
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveProfile(form);
    onSave(form);
    setSaved(true);
    toast("✅ プロフィールを保存しました", "info");
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  const selectAvatar = (seed: string, bg: string) => {
    setForm({ ...form, avatarSeed: seed, avatarBg: bg });
    setShowAvatarPicker(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md"
        style={{ maxHeight: "92vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#252535]">
          <h2 className="font-black text-lg">✏️ プロフィール編集</h2>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#a0a0c0", fontSize: "16px", cursor: "pointer" }}>✕</button>
        </div>

        <div className="p-5 space-y-5">
          {/* アバター選択 */}
          <div>
            <label className="block text-sm font-medium mb-3">👤 アバター・アイコン</label>
            <div className="flex items-center gap-4">
              {/* 現在のアバター */}
              <div className="relative shrink-0">
                <img
                  src={getAvatarUrl(form.avatarSeed, form.avatarBg)}
                  alt="avatar"
                  className="w-20 h-20 rounded-full"
                  style={{ border: "3px solid #ff6b00" }}
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{ background: "#ff6b00", color: "white" }}>
                  ✓
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">カラー 8種 + ヘルメット 8種 計16種</p>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  style={{
                    padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700,
                    background: showAvatarPicker ? "rgba(255,107,0,0.15)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${showAvatarPicker ? "rgba(255,107,0,0.5)" : "rgba(255,255,255,0.1)"}`,
                    color: showAvatarPicker ? "#ff6b00" : "#a0a0c0",
                    cursor: "pointer",
                  }}
                >
                  {showAvatarPicker ? "▲ 閉じる" : "🎨 アバターを変更"}
                </button>
              </div>
            </div>

            {/* アバター選択グリッド */}
            {showAvatarPicker && (
              <div style={{ marginTop: "12px", padding: "16px", borderRadius: "12px", background: "#0d0d18", border: "1px solid #252535" }}>
                {/* カラーアバター */}
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#5a5a7a", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  カラーアイコン
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "16px" }}>
                  {COLOR_AVATARS.map((preset) => {
                    const isSelected = form.avatarSeed === preset.id;
                    return (
                      <button key={preset.id} type="button" onClick={() => selectAvatar(preset.id, "")}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px", borderRadius: "10px", cursor: "pointer",
                          background: isSelected ? "rgba(255,107,0,0.15)" : "transparent",
                          border: isSelected ? "2px solid #ff6b00" : "2px solid transparent", transition: "all 0.15s" }}>
                        <img src={getAvatarUrl(preset.id, "")} alt={preset.label} width={48} height={48} className="rounded-full" />
                        <span style={{ fontSize: "10px", color: isSelected ? "#ff6b00" : "#6b7280" }}>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
                {/* ヘルメットアバター */}
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#5a5a7a", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  ヘルメット（フルフェイス / モトクロス）
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                  {HELMET_DEFS.map((helmet) => {
                    const isSelected = form.avatarSeed === helmet.id;
                    return (
                      <button key={helmet.id} type="button" onClick={() => selectAvatar(helmet.id, "")}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px", borderRadius: "10px", cursor: "pointer",
                          background: isSelected ? "rgba(255,107,0,0.15)" : "transparent",
                          border: isSelected ? "2px solid #ff6b00" : "2px solid transparent", transition: "all 0.15s" }}>
                        <img src={getAvatarUrl(helmet.id, "")} alt={helmet.label} width={48} height={48} className="rounded-full" />
                        <span style={{ fontSize: "9px", color: isSelected ? "#ff6b00" : "#6b7280", textAlign: "center", lineHeight: 1.3 }}>{helmet.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ライダー名 */}
          <div>
            <label className="block text-sm font-medium mb-1.5">ライダー名</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ライダー山田" />
          </div>

          {/* 自己紹介 */}
          <div>
            <label className="block text-sm font-medium mb-1.5">自己紹介</label>
            <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="ツーリング好き・関東在住など" style={{ resize: "none" }} />
          </div>

          {/* 愛車 */}
          <div>
            <label className="block text-sm font-medium mb-1.5">愛車</label>
            <input value={form.bike} onChange={(e) => setForm({ ...form, bike: e.target.value })} placeholder="例: Honda CB650R" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">年式</label>
              <input value={form.bikeYear} onChange={(e) => setForm({ ...form, bikeYear: e.target.value })} placeholder="2022" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">バイクの種類</label>
              <select value={form.bikeType} onChange={(e) => setForm({ ...form, bikeType: e.target.value })}>
                {BIKE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* 活動エリア */}
          <div>
            <label className="block text-sm font-medium mb-1.5">活動エリア</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="例: 東京都・関東" />
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-ghost flex-1">キャンセル</button>
            <button onClick={handleSave} className="btn-primary flex-1"
              style={saved ? { background: "#10b981" } : {}}>
              {saved ? "✓ 保存しました" : "保存する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
