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
  avatarSeed: "Yamada",
  avatarBg: "b6e3f4",
};

export function saveProfile(data: ProfileData) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

export function getAvatarUrl(seed: string, bg: string) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=${bg}`;
}

const BIKE_TYPES = ["ネイキッド", "スポーツ", "ツアラー", "アドベンチャー", "オフロード", "スクーター", "クルーザー", "その他"];

// プリセットアバター一覧
const AVATAR_PRESETS = [
  { seed: "Yamada",  bg: "b6e3f4", label: "ブルー" },
  { seed: "Rider1",  bg: "ffdfbf", label: "オレンジ" },
  { seed: "Rider2",  bg: "d1f4e0", label: "グリーン" },
  { seed: "Rider3",  bg: "c0aede", label: "パープル" },
  { seed: "Rider4",  bg: "ffd6e0", label: "ピンク" },
  { seed: "Rider5",  bg: "fef3c7", label: "イエロー" },
  { seed: "Rider6",  bg: "dbeafe", label: "スカイ" },
  { seed: "Rider7",  bg: "d1fae5", label: "ミント" },
  { seed: "Rider8",  bg: "ffe4e6", label: "ローズ" },
  { seed: "Rider9",  bg: "e0e7ff", label: "インディゴ" },
  { seed: "Rider10", bg: "fce7f3", label: "マゼンタ" },
  { seed: "Rider11", bg: "ecfdf5", label: "エメラルド" },
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
                  style={{ background: "#ff6b00" }}>
                  ✓
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">12種類のアバターから選べます</p>
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
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px",
                marginTop: "12px", padding: "16px", borderRadius: "12px",
                background: "#0d0d18", border: "1px solid #252535",
              }}>
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = form.avatarSeed === preset.seed;
                  return (
                    <button
                      key={preset.seed}
                      type="button"
                      onClick={() => selectAvatar(preset.seed, preset.bg)}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                        padding: "8px", borderRadius: "10px", cursor: "pointer",
                        background: isSelected ? "rgba(255,107,0,0.15)" : "transparent",
                        border: isSelected ? "2px solid #ff6b00" : "2px solid transparent",
                        transition: "all 0.15s",
                      }}
                    >
                      <img
                        src={getAvatarUrl(preset.seed, preset.bg)}
                        alt={preset.label}
                        className="w-14 h-14 rounded-full"
                      />
                      <span style={{ fontSize: "10px", color: isSelected ? "#ff6b00" : "#6b7280" }}>
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
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
