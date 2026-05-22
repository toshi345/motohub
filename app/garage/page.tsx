"use client";

import { useState, useEffect } from "react";
import {
  Bike, MaintenanceRecord, MaintenanceType,
  loadBikes, saveBike, deleteBike, createBike,
  getMaintenanceStatus, MAINTENANCE_LABELS, MOCK_BIKES,
} from "@/lib/garage";
import { loadSessions } from "@/lib/gps";
import {
  BikeIcon, OilIcon, TireIcon, WrenchIcon, FuelIcon,
  BatteryIcon, SettingsIcon,
} from "@/components/Icons";

const BIKE_COLORS = ["#cc3300", "#003399", "#006600", "#cc6600", "#330066", "#222222", "#888888", "#ffffff"];

function MaintenanceTypeIcon({ type }: { type: MaintenanceType }) {
  const props = { size: 16, color: "currentColor" };
  switch (type) {
    case "oil": return <OilIcon {...props} />;
    case "tire_front":
    case "tire_rear": return <TireIcon {...props} />;
    case "chain": return <WrenchIcon {...props} />;
    case "brake_front":
    case "brake_rear": return <WrenchIcon {...props} />;
    case "coolant": return <FuelIcon {...props} />;
    case "battery": return <BatteryIcon {...props} />;
    case "filter": return <SettingsIcon {...props} />;
    default: return <WrenchIcon {...props} />;
  }
}

function BikeColorDot({ color }: { color: string }) {
  return <span className="inline-block w-4 h-4 rounded-full border border-white/20" style={{ background: color }} />;
}

function ProgressBar({ value, color = "#ff6b00" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 bg-[#252535] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
    </div>
  );
}

function MaintenanceItem({ record, currentKm, onEdit, onDelete }: {
  record: MaintenanceRecord;
  currentKm: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const meta = MAINTENANCE_LABELS[record.type];
  const remaining = record.nextKm != null ? record.nextKm - currentKm : null;
  const intervalKm = record.nextKm != null ? record.nextKm - record.km : meta.defaultIntervalKm;
  const progressPct = record.nextKm != null ? Math.max(0, Math.min(100, ((currentKm - record.km) / Math.max(intervalKm, 1)) * 100)) : 0;
  const urgency = remaining != null && remaining <= 0 ? "overdue" : remaining != null && remaining <= 500 ? "urgent" : "ok";

  return (
    <div className={`p-3 rounded-xl border transition-colors ${urgency === "overdue" ? "border-red-500/50 bg-red-500/5" : urgency === "urgent" ? "border-yellow-500/50 bg-yellow-500/5" : "border-[#252535]"}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <MaintenanceTypeIcon type={record.type} />
        <span className="font-medium text-sm flex-1">{meta.label}</span>
        {urgency === "overdue" && <span className="tag bg-red-500/20 text-red-400">⚠️ 超過</span>}
        {urgency === "urgent" && <span className="tag bg-yellow-500/20 text-yellow-400">⚡ 要注意</span>}
      </div>
      <div className="text-xs text-gray-500 mb-2">
        前回: {record.km.toLocaleString()} km（{record.date}）
        {record.nextKm != null && <> · 次回: {record.nextKm.toLocaleString()} km</>}
      </div>
      {record.nextKm != null && (
        <>
          <ProgressBar value={progressPct} color={urgency === "overdue" ? "#ef4444" : urgency === "urgent" ? "#eab308" : "#ff6b00"} />
          <div className="text-xs mt-1 text-right">
            {remaining != null && remaining > 0
              ? <span className="text-gray-400">あと {remaining.toLocaleString()} km</span>
              : <span className="text-red-400">交換時期を過ぎています</span>}
          </div>
        </>
      )}
      {record.note && <p className="text-xs text-gray-500 mt-1">📝 {record.note}</p>}
      <div className="flex gap-2 mt-2">
        <button onClick={onEdit} className="text-xs text-gray-500 hover:text-white transition-colors">✏️ 編集</button>
        <button onClick={onDelete} className="text-xs text-gray-600 hover:text-red-400 transition-colors">🗑 削除</button>
      </div>
    </div>
  );
}

const emptyBikeForm = {
  nickname: "", make: "", model: "", year: new Date().getFullYear(), color: "#cc3300",
  purchaseKm: 0, currentKm: 0, purchasedAt: "", notes: "",
};

const emptyMaintenanceForm: Omit<MaintenanceRecord, "id"> = {
  type: "oil" as MaintenanceType, label: MAINTENANCE_LABELS.oil.label,
  km: 0, date: "", note: "", nextKm: undefined, nextDate: undefined,
};

export default function GaragePage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showBikeForm, setShowBikeForm] = useState(false);
  const [bikeForm, setBikeForm] = useState(emptyBikeForm);
  const [editingBikeId, setEditingBikeId] = useState<string | null>(null);
  const [showMaintForm, setShowMaintForm] = useState(false);
  const [maintForm, setMaintForm] = useState<Omit<MaintenanceRecord, "id">>(emptyMaintenanceForm);
  const [editingMaintId, setEditingMaintId] = useState<string | null>(null);
  const [tab, setTab] = useState<"maintenance" | "stats">("maintenance");
  const [gpsTotalKm, setGpsTotalKm] = useState(0);

  const refresh = () => {
    let stored = loadBikes();
    if (stored.length === 0) { stored = MOCK_BIKES; stored.forEach(saveBike); }
    setBikes(stored);
    if (!selectedId && stored.length > 0) setSelectedId(stored[0].id);
  };

  useEffect(() => {
    refresh();
    const sessions = loadSessions();
    setGpsTotalKm(sessions.reduce((a, s) => a + s.totalDistanceKm, 0));
  }, []);

  const selected = bikes.find((b) => b.id === selectedId) ?? null;
  const status = selected ? getMaintenanceStatus(selected) : [];

  const openAddBike = () => { setBikeForm(emptyBikeForm); setEditingBikeId(null); setShowBikeForm(true); };
  const openEditBike = (b: Bike) => {
    setBikeForm({ nickname: b.nickname, make: b.make, model: b.model, year: b.year, color: b.color, purchaseKm: b.purchaseKm, currentKm: b.currentKm, purchasedAt: b.purchasedAt, notes: b.notes });
    setEditingBikeId(b.id);
    setShowBikeForm(true);
  };

  const submitBike = () => {
    if (!bikeForm.make || !bikeForm.model) return;
    if (editingBikeId) {
      const existing = bikes.find((b) => b.id === editingBikeId)!;
      saveBike({ ...existing, ...bikeForm });
    } else {
      saveBike(createBike({ ...bikeForm, imageUrl: undefined }));
    }
    setShowBikeForm(false);
    refresh();
  };

  const removeBike = (id: string) => {
    if (!confirm("この愛車を削除しますか？")) return;
    deleteBike(id);
    setSelectedId(null);
    refresh();
  };

  const openAddMaint = () => {
    setMaintForm({ ...emptyMaintenanceForm, km: selected?.currentKm ?? 0 });
    setEditingMaintId(null);
    setShowMaintForm(true);
  };

  const openEditMaint = (r: MaintenanceRecord) => {
    setMaintForm({ type: r.type, label: r.label, km: r.km, date: r.date, note: r.note, nextKm: r.nextKm, nextDate: r.nextDate });
    setEditingMaintId(r.id);
    setShowMaintForm(true);
  };

  const submitMaint = () => {
    if (!selected || !maintForm.date) return;
    const meta = MAINTENANCE_LABELS[maintForm.type];
    const record: MaintenanceRecord = {
      id: editingMaintId ?? `m_${Date.now()}`,
      ...maintForm,
      label: meta.label,
      nextKm: maintForm.nextKm ?? (meta.defaultIntervalKm ? maintForm.km + meta.defaultIntervalKm : undefined),
    };
    const updated = { ...selected, maintenanceRecords: editingMaintId
      ? selected.maintenanceRecords.map((r) => r.id === editingMaintId ? record : r)
      : [...selected.maintenanceRecords, record]
    };
    saveBike(updated);
    setShowMaintForm(false);
    refresh();
  };

  const deleteMaint = (bikeId: string, maintId: string) => {
    const bike = bikes.find((b) => b.id === bikeId)!;
    saveBike({ ...bike, maintenanceRecords: bike.maintenanceRecords.filter((r) => r.id !== maintId) });
    refresh();
  };

  const overdueCount = status.filter((s) => s.overdue).length;
  const urgentCount = status.filter((s) => s.urgent && !s.overdue).length;

  return (
    <div className="max-w-5xl mx-auto px-4 pb-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black mb-1 flex items-center gap-2"><BikeIcon size={28} color="#ff6b00" /> マイガレージ</h1>
          <p className="text-gray-400 text-sm">愛車管理・メンテナンス記録</p>
        </div>
        <button onClick={openAddBike} className="btn-primary">＋ 愛車を追加</button>
      </div>

      {/* Bike selector */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: "none" }}>
        {bikes.map((bike) => {
          const urg = getMaintenanceStatus(bike).some((s) => s.overdue || s.urgent);
          return (
            <button
              key={bike.id}
              onClick={() => setSelectedId(bike.id)}
              className={`card p-4 min-w-[160px] text-left transition-all shrink-0 ${selectedId === bike.id ? "border-[#ff6b00]" : "hover:border-[#3a3a4a]"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <BikeColorDot color={bike.color} />
                {urg && <span className="text-xs text-yellow-400">⚠️</span>}
              </div>
              <div className="font-bold text-sm truncate">{bike.nickname || `${bike.make} ${bike.model}`}</div>
              <div className="text-xs text-gray-500">{bike.make} {bike.model}</div>
              <div className="text-xs text-[#ff6b00] mt-1">{bike.currentKm.toLocaleString()} km</div>
            </button>
          );
        })}
        {bikes.length === 0 && (
          <div className="card p-6 text-center text-gray-500 flex-1">
            <p className="text-sm">愛車が登録されていません</p>
          </div>
        )}
      </div>

      {selected && (
        <>
          {/* Bike detail header */}
          <div className="card p-5 mb-5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${selected.color}22`, border: `2px solid ${selected.color}55` }}>
                <BikeIcon size={36} color={selected.color} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black">{selected.nickname || `${selected.make} ${selected.model}`}</h2>
                  {overdueCount > 0 && <span className="tag bg-red-500/20 text-red-400">⚠️ 要メンテ {overdueCount}件</span>}
                  {urgentCount > 0 && !overdueCount && <span className="tag bg-yellow-500/20 text-yellow-400">⚡ 注意 {urgentCount}件</span>}
                </div>
                <p className="text-gray-400 text-sm">{selected.make} {selected.model} · {selected.year}年式</p>
                {selected.notes && <p className="text-sm text-gray-500 mt-1">{selected.notes}</p>}
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => openEditBike(selected)} className="text-xs btn-ghost px-3 py-1">✏️ 編集</button>
                <button onClick={() => removeBike(selected.id)} className="text-xs text-red-400/70 hover:text-red-400 transition-colors text-center">🗑 削除</button>
              </div>
            </div>

            {/* Km stats */}
            <div className="grid grid-cols-3 gap-3 mt-4 text-center text-xs">
              <div className="bg-[#1a1a25] rounded-lg p-3">
                <div className="font-black text-base" style={{ color: "#ff6b00" }}>{selected.currentKm.toLocaleString()} km</div>
                <div className="text-gray-500">現在の走行距離</div>
              </div>
              <div className="bg-[#1a1a25] rounded-lg p-3">
                <div className="font-black text-base" style={{ color: "#ff6b00" }}>{(selected.currentKm - selected.purchaseKm).toLocaleString()} km</div>
                <div className="text-gray-500">所有期間走行距離</div>
              </div>
              <div className="bg-[#1a1a25] rounded-lg p-3">
                <div className="font-black text-base" style={{ color: "#ff6b00" }}>{gpsTotalKm.toFixed(0)} km</div>
                <div className="text-gray-500">GPS記録済み距離</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {([
              { key: "maintenance", label: "🔧 メンテナンス記録" },
              { key: "stats", label: "📊 走行統計" },
            ] as { key: typeof tab; label: string }[]).map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={tab === t.key ? { background: "#ff6b00", color: "white" } : { background: "#13131a", color: "#9ca3af", border: "1px solid #252535" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* MAINTENANCE TAB */}
          {tab === "maintenance" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">メンテナンス記録</h3>
                <button onClick={openAddMaint} className="btn-primary text-sm">＋ 記録を追加</button>
              </div>

              {/* Urgent alerts */}
              {(overdueCount > 0 || urgentCount > 0) && (
                <div className={`card p-4 ${overdueCount > 0 ? "border-red-500/50 bg-red-500/5" : "border-yellow-500/50 bg-yellow-500/5"}`}>
                  <h4 className="font-bold text-sm mb-2">{overdueCount > 0 ? "⚠️ 交換時期超過" : "⚡ 交換時期が近づいています"}</h4>
                  {status.filter((s) => s.overdue || s.urgent).map((s) => (
                    <div key={s.id} className="text-sm text-gray-300">
                      {MAINTENANCE_LABELS[s.type].icon} {s.label}: {s.remaining > 0 ? `あと ${s.remaining.toLocaleString()} km` : `${Math.abs(s.remaining).toLocaleString()} km 超過`}
                    </div>
                  ))}
                </div>
              )}

              {selected.maintenanceRecords.length === 0 ? (
                <div className="card p-10 text-center text-gray-500">
                  <div className="flex justify-center mb-3"><WrenchIcon size={40} color="#6b7280" /></div>
                  <p>メンテナンス記録がありません</p>
                  <button onClick={openAddMaint} className="btn-primary mt-4 text-sm">最初の記録を追加</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selected.maintenanceRecords.map((r) => (
                    <MaintenanceItem
                      key={r.id}
                      record={r}
                      currentKm={selected.currentKm}
                      onEdit={() => openEditMaint(r)}
                      onDelete={() => { if (confirm("削除しますか？")) { deleteMaint(selected.id, r.id); } }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STATS TAB */}
          {tab === "stats" && (
            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="font-bold mb-4">📊 走行距離の推移（購入後）</h3>
                <div className="space-y-3">
                  {[
                    { label: "購入時", km: selected.purchaseKm, pct: 0 },
                    { label: "現在", km: selected.currentKm, pct: 100 },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400 w-16 shrink-0">{item.label}</span>
                      <div className="flex-1">
                        <ProgressBar value={item.pct} />
                      </div>
                      <span className="text-[#ff6b00] font-bold w-24 text-right">{item.km.toLocaleString()} km</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="card p-4 text-center">
                  <div className="text-2xl mb-1">📅</div>
                  <div className="font-black text-lg" style={{ color: "#ff6b00" }}>{selected.purchasedAt || "--"}</div>
                  <div className="text-xs text-gray-500">購入日</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl mb-1">🔧</div>
                  <div className="font-black text-lg" style={{ color: "#ff6b00" }}>{selected.maintenanceRecords.length} 件</div>
                  <div className="text-xs text-gray-500">メンテナンス記録</div>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-bold mb-3">🛢️ オイル交換推奨</h3>
                <p className="text-sm text-gray-400">
                  現在の走行距離: <strong className="text-white">{selected.currentKm.toLocaleString()} km</strong>
                </p>
                {(() => {
                  const oilRecord = selected.maintenanceRecords.filter((r) => r.type === "oil").sort((a, b) => b.km - a.km)[0];
                  if (!oilRecord) return <p className="text-sm text-yellow-400 mt-1">⚠️ オイル交換記録がありません</p>;
                  const next = oilRecord.nextKm ?? oilRecord.km + 3000;
                  const rem = next - selected.currentKm;
                  return (
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">次回推奨: <strong className="text-[#ff6b00]">{next.toLocaleString()} km</strong></p>
                      <p className="text-sm mt-1">{rem > 0 ? <span className="text-green-400">あと {rem.toLocaleString()} km</span> : <span className="text-red-400">⚠️ {Math.abs(rem).toLocaleString()} km 超過</span>}</p>
                      <ProgressBar value={((selected.currentKm - oilRecord.km) / (next - oilRecord.km)) * 100} color={rem <= 0 ? "#ef4444" : rem <= 500 ? "#eab308" : "#ff6b00"} />
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </>
      )}

      {/* Bike Form Modal */}
      {showBikeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="card w-full max-w-md p-6 space-y-4 my-4">
            <h3 className="font-bold text-lg">{editingBikeId ? "✏️ 愛車を編集" : "🏍️ 愛車を登録"}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">メーカー *</label>
                <input value={bikeForm.make} onChange={(e) => setBikeForm({ ...bikeForm, make: e.target.value })} placeholder="Honda" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">モデル *</label>
                <input value={bikeForm.model} onChange={(e) => setBikeForm({ ...bikeForm, model: e.target.value })} placeholder="CB650R" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">ニックネーム</label>
                <input value={bikeForm.nickname} onChange={(e) => setBikeForm({ ...bikeForm, nickname: e.target.value })} placeholder="CB号" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">年式</label>
                <input type="number" value={bikeForm.year} onChange={(e) => setBikeForm({ ...bikeForm, year: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">カラー</label>
              <div className="flex gap-2 flex-wrap">
                {BIKE_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setBikeForm({ ...bikeForm, color: c })}
                    className="w-8 h-8 rounded-full border-2 transition-all"
                    style={{ background: c, borderColor: bikeForm.color === c ? "#ff6b00" : "transparent", transform: bikeForm.color === c ? "scale(1.2)" : "scale(1)" }}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">購入時走行距離 (km)</label>
                <input type="number" value={bikeForm.purchaseKm} onChange={(e) => setBikeForm({ ...bikeForm, purchaseKm: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">現在の走行距離 (km)</label>
                <input type="number" value={bikeForm.currentKm} onChange={(e) => setBikeForm({ ...bikeForm, currentKm: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">購入日</label>
              <input type="date" value={bikeForm.purchasedAt} onChange={(e) => setBikeForm({ ...bikeForm, purchasedAt: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">メモ</label>
              <textarea rows={2} value={bikeForm.notes} onChange={(e) => setBikeForm({ ...bikeForm, notes: e.target.value })} placeholder="愛車についてのメモ" style={{ resize: "none" }} />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowBikeForm(false)} className="btn-ghost flex-1">キャンセル</button>
              <button onClick={submitBike} className="btn-primary flex-1">{editingBikeId ? "更新" : "登録"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Form Modal */}
      {showMaintForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="card w-full max-w-md p-6 space-y-4 my-4">
            <h3 className="font-bold text-lg">🔧 メンテナンス記録を追加</h3>
            <div>
              <label className="block text-sm font-medium mb-1">種別</label>
              <select value={maintForm.type} onChange={(e) => setMaintForm({ ...maintForm, type: e.target.value as MaintenanceType, label: MAINTENANCE_LABELS[e.target.value as MaintenanceType].label })}>
                {(Object.entries(MAINTENANCE_LABELS) as [MaintenanceType, typeof MAINTENANCE_LABELS[MaintenanceType]][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">実施時の走行距離 (km)</label>
                <input type="number" value={maintForm.km} onChange={(e) => setMaintForm({ ...maintForm, km: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">実施日 *</label>
                <input type="date" value={maintForm.date} onChange={(e) => setMaintForm({ ...maintForm, date: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                次回交換予定距離 (km)
                {MAINTENANCE_LABELS[maintForm.type].defaultIntervalKm > 0 && (
                  <button type="button" className="ml-2 text-xs text-[#ff6b00]"
                    onClick={() => setMaintForm({ ...maintForm, nextKm: maintForm.km + MAINTENANCE_LABELS[maintForm.type].defaultIntervalKm })}>
                    +{MAINTENANCE_LABELS[maintForm.type].defaultIntervalKm.toLocaleString()}km 自動設定
                  </button>
                )}
              </label>
              <input type="number" value={maintForm.nextKm ?? ""} onChange={(e) => setMaintForm({ ...maintForm, nextKm: e.target.value ? Number(e.target.value) : undefined })} placeholder="空白で次回設定なし" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">メモ（使用品など）</label>
              <input value={maintForm.note} onChange={(e) => setMaintForm({ ...maintForm, note: e.target.value })} placeholder="例: Motul 5100 10W-40" />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowMaintForm(false)} className="btn-ghost flex-1">キャンセル</button>
              <button onClick={submitMaint} className="btn-primary flex-1">{editingMaintId ? "更新" : "記録する"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
