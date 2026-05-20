"use client";

import { useState } from "react";

const KEY = "motohub_settings";

interface Settings {
  notifications: boolean;
  gpsAutoMode: boolean;
  distanceUnit: "km" | "mile";
  fuelUnit: "liter" | "gallon";
  currency: "JPY" | "USD";
}

function loadSettings(): Settings {
  try {
    const s = localStorage.getItem(KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return { notifications: true, gpsAutoMode: false, distanceUnit: "km", fuelUnit: "liter", currency: "JPY" };
}

function saveSettings(s: Settings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: "44px", height: "24px", borderRadius: "999px", position: "relative",
        background: value ? "#ff6b00" : "#252535", border: "none", cursor: "pointer",
        transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: "3px",
        left: value ? "23px" : "3px",
        width: "18px", height: "18px",
        borderRadius: "50%", background: "white",
        transition: "left 0.2s",
      }} />
    </button>
  );
}

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [saved, setSaved] = useState(false);

  const update = (key: keyof Settings, value: boolean | string) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  const clearAllData = () => {
    if (confirm("⚠️ すべてのデータ（走行記録・燃費・費用・ガレージ）を削除しますか？\nこの操作は取り消せません。")) {
      const keys = ["motohub_fuel_records", "motohub_expenses", "motohub_garage_bikes", "motohub_gps_sessions", "motohub_route_library", "motohub_drafts", "motohub_profile"];
      keys.forEach((k) => localStorage.removeItem(k));
      alert("データを削除しました。");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }} onClick={onClose}>
      <div className="card w-full max-w-md" style={{ maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#252535]">
          <h2 className="font-black text-lg">⚙️ 設定</h2>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#a0a0c0", fontSize: "16px", cursor: "pointer" }}>✕</button>
        </div>

        <div className="p-5 space-y-5">
          {/* GPS */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">📍 GPS</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">自動記録モードをデフォルトに</div>
                  <div className="text-xs text-gray-500">GPS起動時に自動モードで開始</div>
                </div>
                <Toggle value={settings.gpsAutoMode} onChange={(v) => update("gpsAutoMode", v)} />
              </div>
            </div>
          </div>

          {/* 単位 */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">📏 単位</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">距離</div>
                <div className="flex gap-2">
                  {(["km", "mile"] as const).map((u) => (
                    <button key={u} onClick={() => update("distanceUnit", u)}
                      className="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      style={settings.distanceUnit === u ? { background: "#ff6b00", color: "white", border: "none" } : { background: "#13131a", color: "#9ca3af", border: "1px solid #252535" }}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">燃料</div>
                <div className="flex gap-2">
                  {(["liter", "gallon"] as const).map((u) => (
                    <button key={u} onClick={() => update("fuelUnit", u)}
                      className="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      style={settings.fuelUnit === u ? { background: "#ff6b00", color: "white", border: "none" } : { background: "#13131a", color: "#9ca3af", border: "1px solid #252535" }}>
                      {u === "liter" ? "リットル" : "ガロン"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* アプリ情報 */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">ℹ️ アプリ情報</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex justify-between"><span>バージョン</span><span>1.0.0</span></div>
              <div className="flex justify-between"><span>公開URL</span><span className="text-[#ff6b00] text-xs">motohub-psi.vercel.app</span></div>
            </div>
          </div>

          {/* データ管理 */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">🗄️ データ管理</h3>
            <button
              onClick={clearAllData}
              className="w-full py-3 rounded-xl text-sm font-bold transition-colors"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
            >
              🗑 すべてのデータを削除
            </button>
            <p className="text-xs text-gray-600 mt-1 text-center">走行記録・燃費・費用・ガレージデータが削除されます</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="btn-ghost flex-1">閉じる</button>
            <button onClick={handleSave} className="btn-primary flex-1" style={saved ? { background: "#10b981" } : {}}>
              {saved ? "✓ 保存しました" : "保存する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
