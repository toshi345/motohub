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
  avatarSeed: "r_sport",   // デフォルト：スポーツライダーシルエット
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

// ── バイク乗りシルエットアバター ─────────────────────────────────────────────
type RidePos = "sport" | "cruiser" | "scooter" | "adventure" | "offroad";
type RiderDef = { id: string; label: string; bg: string; fg: string; accent: string; pos: RidePos };

const RIDER_AVATARS: RiderDef[] = [
  { id: "r_sport",     label: "スポーツ",      bg: "#0d0818", fg: "#ffffff", accent: "#ff6b00", pos: "sport" },
  { id: "r_cruiser",   label: "クルーザー",    bg: "#0a1628", fg: "#e2e8f0", accent: "#60a5fa", pos: "cruiser" },
  { id: "r_scooter",   label: "スクーター",    bg: "#083344", fg: "#ffffff", accent: "#22d3ee", pos: "scooter" },
  { id: "r_adventure", label: "アドベンチャー", bg: "#052e16", fg: "#86efac", accent: "#4ade80", pos: "adventure" },
  { id: "r_naked",     label: "ネイキッド",    bg: "#2d0808", fg: "#ffffff", accent: "#f87171", pos: "sport" },
  { id: "r_offroad",   label: "オフロード",    bg: "#1a1200", fg: "#fbbf24", accent: "#f97316", pos: "offroad" },
  { id: "r_retro",     label: "レトロ",        bg: "#1c0e00", fg: "#fde68a", accent: "#d97706", pos: "cruiser" },
  { id: "r_touring",   label: "ツーリング",    bg: "#0f0a2a", fg: "#c7d2fe", accent: "#818cf8", pos: "adventure" },
];

function makeRiderSvg(def: RiderDef): string {
  const { bg, fg, accent, pos } = def;

  const sport = `
    <circle cx="22" cy="69" r="13" fill="none" stroke="${fg}" stroke-width="3.5"/>
    <circle cx="22" cy="69" r="4" fill="${fg}"/>
    <circle cx="74" cy="69" r="13" fill="none" stroke="${fg}" stroke-width="3.5"/>
    <circle cx="74" cy="69" r="4" fill="${fg}"/>
    <path d="M22 69 L34 51 L56 48 L69 59 L74 69" stroke="${fg}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M34 53 L54 49 L60 55 L38 58z" fill="${fg}"/>
    <path d="M22 68 L13 73" stroke="${fg}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M66 50 L74 65" stroke="${fg}" stroke-width="3" stroke-linecap="round"/>
    <path d="M62 47 L70 43 L74 47" stroke="${fg}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="62" cy="27" rx="10" ry="11" fill="${fg}"/>
    <path d="M54 31 Q62 25 70 31 Q70 37 62 38 Q54 37z" fill="${accent}" opacity="0.92"/>
    <path d="M56 31 Q59 29 62 29" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M57 38 L44 53" stroke="${fg}" stroke-width="9" stroke-linecap="round"/>
    <path d="M54 42 L70 50" stroke="${fg}" stroke-width="5.5" stroke-linecap="round"/>
    <path d="M45 54 L34 65 L24 67" stroke="${fg}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M46 55 L57 65 L70 65" stroke="${fg}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  `;

  const cruiser = `
    <circle cx="19" cy="70" r="14" fill="none" stroke="${fg}" stroke-width="3.5"/>
    <circle cx="19" cy="70" r="4" fill="${fg}"/>
    <circle cx="76" cy="70" r="14" fill="none" stroke="${fg}" stroke-width="3.5"/>
    <circle cx="76" cy="70" r="4" fill="${fg}"/>
    <path d="M19 70 L32 60 L62 58 L74 66 L76 70" stroke="${fg}" stroke-width="2.5" fill="none"/>
    <path d="M32 60 L40 53 L62 53 L68 60 L32 60z" fill="${fg}" opacity="0.5"/>
    <path d="M33 60 L58 56 L62 61 L37 64z" fill="${fg}"/>
    <path d="M62 50 L68 44 L74 48" stroke="${fg}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M64 50 L76 66" stroke="${fg}" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M19 70 L9 75" stroke="${fg}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="48" cy="27" r="11" fill="${fg}"/>
    <path d="M39 31 Q48 25 57 31 Q57 37 48 38 Q39 37z" fill="${accent}" opacity="0.92"/>
    <path d="M40 31 Q44 29 48 29" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M48 38 L45 57" stroke="${fg}" stroke-width="10" stroke-linecap="round"/>
    <path d="M46 43 L63 47" stroke="${fg}" stroke-width="5.5" stroke-linecap="round"/>
    <path d="M43 57 L34 68 L21 70" stroke="${fg}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M47 58 L58 68 L74 70" stroke="${fg}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  `;

  const scooter = `
    <circle cx="24" cy="72" r="11" fill="none" stroke="${fg}" stroke-width="3"/>
    <circle cx="24" cy="72" r="3.5" fill="${fg}"/>
    <circle cx="72" cy="72" r="11" fill="none" stroke="${fg}" stroke-width="3"/>
    <circle cx="72" cy="72" r="3.5" fill="${fg}"/>
    <rect x="30" y="64" width="40" height="5" rx="2.5" fill="${fg}" opacity="0.6"/>
    <path d="M30 64 L38 53 L62 51 L70 62 L30 64z" fill="${fg}" opacity="0.45"/>
    <path d="M60 50 L68 44 L72 48" stroke="${fg}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M62 50 L72 64" stroke="${fg}" stroke-width="3" stroke-linecap="round"/>
    <path d="M30 64 L24 68" stroke="${fg}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="47" cy="27" r="10" fill="${fg}"/>
    <path d="M39 31 Q47 25 55 31 Q55 36 47 37 Q39 36z" fill="${accent}" opacity="0.92"/>
    <path d="M47 37 L45 56" stroke="${fg}" stroke-width="10" stroke-linecap="round"/>
    <path d="M45 41 L62 45" stroke="${fg}" stroke-width="5" stroke-linecap="round"/>
    <path d="M43 57 L36 66" stroke="${fg}" stroke-width="5.5" stroke-linecap="round"/>
    <path d="M47 58 L55 66" stroke="${fg}" stroke-width="5.5" stroke-linecap="round"/>
  `;

  const adventure = `
    <circle cx="21" cy="69" r="14" fill="none" stroke="${fg}" stroke-width="3"/>
    <circle cx="21" cy="69" r="4" fill="${fg}"/>
    <circle cx="75" cy="69" r="15" fill="none" stroke="${fg}" stroke-width="3"/>
    <circle cx="75" cy="69" r="4" fill="${fg}"/>
    <path d="M21 69 L34 47 L56 45 L72 57 L75 69" stroke="${fg}" stroke-width="2.5" fill="none"/>
    <path d="M34 49 L55 45 L59 51 L38 55z" fill="${fg}"/>
    <rect x="26" y="56" width="8" height="11" rx="1.5" fill="${fg}" opacity="0.45"/>
    <path d="M65 49 L75 65" stroke="${fg}" stroke-width="3" stroke-linecap="round"/>
    <path d="M54 43 L62 38 L70 43" stroke="${fg}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="51" cy="25" rx="11" ry="12" fill="${fg}"/>
    <rect x="42" y="22" width="18" height="9" rx="3" fill="${accent}" opacity="0.92"/>
    <path d="M44 22 Q51 18 58 22" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" fill="none"/>
    <path d="M51 36 L47 54" stroke="${fg}" stroke-width="10" stroke-linecap="round"/>
    <path d="M49 41 L63 41" stroke="${fg}" stroke-width="5.5" stroke-linecap="round"/>
    <path d="M45 55 L35 65 L23 68" stroke="${fg}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M49 56 L60 65 L73 68" stroke="${fg}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  `;

  const offroad = `
    <circle cx="23" cy="70" r="13" fill="none" stroke="${fg}" stroke-width="3"/>
    <circle cx="23" cy="70" r="4" fill="${fg}"/>
    <circle cx="73" cy="70" r="13" fill="none" stroke="${fg}" stroke-width="3"/>
    <circle cx="73" cy="70" r="4" fill="${fg}"/>
    <path d="M23 70 L36 50 L55 47 L70 58 L73 70" stroke="${fg}" stroke-width="2.5" fill="none"/>
    <path d="M36 52 L54 48 L57 53 L39 57z" fill="${fg}"/>
    <path d="M54 45 L61 38 L70 43" stroke="${fg}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M64 47 L73 64" stroke="${fg}" stroke-width="3" stroke-linecap="round"/>
    <line x1="30" y1="64" x2="21" y2="64" stroke="${fg}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="65" y1="63" x2="73" y2="63" stroke="${fg}" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="51" cy="21" rx="10" ry="11" fill="${fg}"/>
    <rect x="43" y="18" width="16" height="10" rx="2" fill="${accent}" opacity="0.95"/>
    <path d="M51 32 L47 50" stroke="${fg}" stroke-width="9" stroke-linecap="round"/>
    <path d="M48 36 L62 40" stroke="${fg}" stroke-width="5" stroke-linecap="round"/>
    <path d="M45 51 L36 62 L25 64" stroke="${fg}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M49 52 L60 62 L70 63" stroke="${fg}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  `;

  const bodies: Record<RidePos, string> = { sport, cruiser, scooter, adventure, offroad };
  const body = bodies[pos];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><clipPath id="cc"><circle cx="50" cy="50" r="50"/></clipPath></defs>
    <circle cx="50" cy="50" r="50" fill="${bg}"/>
    <g clip-path="url(#cc)">${body}</g>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getAvatarUrl(seed: string, bg: string): string {
  if (seed.startsWith("r_")) {
    const def = RIDER_AVATARS.find((a) => a.id === seed);
    return def ? makeRiderSvg(def) : makeRiderSvg(RIDER_AVATARS[0]);
  }
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
                <p className="text-sm text-gray-400 mb-2">ライダー 8種 + カラー 8種 計16種</p>
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
                {/* バイク乗りシルエット */}
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#5a5a7a", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  🏍️ バイク乗りシルエット
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "16px" }}>
                  {RIDER_AVATARS.map((rider) => {
                    const isSelected = form.avatarSeed === rider.id;
                    return (
                      <button key={rider.id} type="button" onClick={() => selectAvatar(rider.id, "")}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px", borderRadius: "10px", cursor: "pointer",
                          background: isSelected ? "rgba(255,107,0,0.15)" : "transparent",
                          border: isSelected ? "2px solid #ff6b00" : "2px solid transparent", transition: "all 0.15s" }}>
                        <img src={getAvatarUrl(rider.id, "")} alt={rider.label} width={48} height={48} className="rounded-full" />
                        <span style={{ fontSize: "9px", color: isSelected ? "#ff6b00" : "#6b7280", textAlign: "center" }}>{rider.label}</span>
                      </button>
                    );
                  })}
                </div>

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
