"use client";

import { useState, useEffect } from "react";

export interface ProfileData {
  name: string;
  bio: string;
  bike: string;
  bikeYear: string;
  bikeType: string;
  location: string;
}

const KEY = "motohub_profile";

export function loadProfile(): ProfileData {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {
    name: "ライダー山田",
    bio: "全国ツーリング中🏍️ | 関東在住 | ソロツーリング大好き",
    bike: "Honda CB650R",
    bikeYear: "2022",
    bikeType: "ネイキッド",
    location: "東京都",
  };
}

export function saveProfile(data: ProfileData) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

const BIKE_TYPES = ["ネイキッド", "スポーツ", "ツアラー", "アドベンチャー", "オフロード", "スクーター", "クルーザー", "その他"];

export default function ProfileEditModal({ onClose, onSave }: { onClose: () => void; onSave: (data: ProfileData) => void }) {
  const [form, setForm] = useState<ProfileData>(loadProfile());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveProfile(form);
    onSave(form);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }} onClick={onClose}>
      <div className="card w-full max-w-md" style={{ maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#252535]">
          <h2 className="font-black text-lg">✏️ プロフィール編集</h2>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#a0a0c0", fontSize: "16px", cursor: "pointer" }}>✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">ライダー名</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ライダー山田" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">自己紹介</label>
            <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="ツーリング好き・関東在住など" style={{ resize: "none" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">🏍️ 愛車</label>
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
          <div>
            <label className="block text-sm font-medium mb-1.5">📍 活動エリア</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="例: 東京都・関東" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-ghost flex-1">キャンセル</button>
            <button onClick={handleSave} className="btn-primary flex-1" style={saved ? { background: "#10b981" } : {}}>
              {saved ? "✓ 保存しました" : "保存する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
