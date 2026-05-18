"use client";

import { useState, useEffect } from "react";
import {
  FuelRecord, loadFuelRecords, saveFuelRecord, deleteFuelRecord,
  createFuelRecord, calcFuelStats, MOCK_FUEL_RECORDS,
} from "@/lib/fuel";
import { loadBikes, Bike, MOCK_BIKES, saveBike } from "@/lib/garage";

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  liters: "",
  pricePerLiter: "",
  totalCost: "",
  odometer: "",
  isFull: true,
  station: "",
  note: "",
};

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-black" style={{ color: "#ff6b00" }}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
    </div>
  );
}

function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map(({ label, value }) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t transition-all"
            style={{
              height: `${Math.max((value / max) * 56, value > 0 ? 4 : 2)}px`,
              background: value > 0 ? "linear-gradient(to top, #cc5500, #ff6b00)" : "#252535",
            }}
          />
          <span className="text-[10px] text-gray-500">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function FuelPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [selectedBikeId, setSelectedBikeId] = useState<string>("");
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [autoCalc, setAutoCalc] = useState<"total" | "unit" | "none">("none");

  const refresh = () => {
    let bs = loadBikes();
    if (bs.length === 0) { bs = MOCK_BIKES; bs.forEach(saveBike); }
    setBikes(bs);
    if (!selectedBikeId && bs.length > 0) setSelectedBikeId(bs[0].id);

    let recs = loadFuelRecords(selectedBikeId || bs[0]?.id);
    if (recs.length === 0 && (selectedBikeId === "bike_demo_1" || bs[0]?.id === "bike_demo_1")) {
      MOCK_FUEL_RECORDS.forEach(saveFuelRecord);
      recs = loadFuelRecords(selectedBikeId || bs[0]?.id);
    }
    setRecords(recs);
  };

  useEffect(() => { refresh(); }, [selectedBikeId]);

  // Auto-calculate total or unit price
  useEffect(() => {
    const l = parseFloat(form.liters);
    const p = parseFloat(form.pricePerLiter);
    const t = parseFloat(form.totalCost);
    if (!isNaN(l) && !isNaN(p) && autoCalc !== "total") {
      setForm((f) => ({ ...f, totalCost: Math.round(l * p).toString() }));
    } else if (!isNaN(l) && !isNaN(t) && l > 0 && autoCalc !== "unit") {
      setForm((f) => ({ ...f, pricePerLiter: Math.round(t / l).toString() }));
    }
  }, [form.liters, form.pricePerLiter, form.totalCost]);

  const stats = calcFuelStats(records);

  const openAdd = () => {
    const bike = bikes.find((b) => b.id === selectedBikeId);
    setForm({ ...emptyForm, odometer: bike?.currentKm.toString() ?? "" });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (r: FuelRecord) => {
    setForm({
      date: r.date, liters: r.liters.toString(), pricePerLiter: r.pricePerLiter.toString(),
      totalCost: r.totalCost.toString(), odometer: r.odometer.toString(),
      isFull: r.isFull, station: r.station ?? "", note: r.note ?? "",
    });
    setEditId(r.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.date || !form.liters || !form.odometer) return;
    const record = createFuelRecord({
      bikeId: selectedBikeId,
      date: form.date,
      liters: parseFloat(form.liters),
      pricePerLiter: parseFloat(form.pricePerLiter) || 0,
      totalCost: parseFloat(form.totalCost) || 0,
      odometer: parseFloat(form.odometer),
      isFull: form.isFull,
      station: form.station || undefined,
      note: form.note || undefined,
    });
    if (editId) { deleteFuelRecord(editId); }
    saveFuelRecord(record);
    setShowForm(false);
    refresh();
  };

  // Monthly chart data (last 6 months)
  const monthlyData = (() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
      return { label: `${d.getMonth() + 1}月`, key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` };
    });
    return months.map(({ label, key }) => ({
      label,
      value: records.filter((r) => r.date.startsWith(key)).reduce((s, r) => s + r.totalCost, 0),
    }));
  })();

  // Per-record efficiency
  const efficiencies = (() => {
    const sorted = [...records].sort((a, b) => a.odometer - b.odometer);
    const full = sorted.filter((r) => r.isFull);
    return full.map((r, i) => {
      if (i === 0) return null;
      const prev = full[i - 1];
      const km = r.odometer - prev.odometer;
      return km > 0 && r.liters > 0 ? parseFloat((km / r.liters).toFixed(1)) : null;
    });
  })();

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 md:pb-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black mb-1">⛽ 燃費管理</h1>
          <p className="text-gray-400 text-sm">給油記録・燃費計算・コスト分析</p>
        </div>
        <button onClick={openAdd} className="btn-primary">＋ 給油記録</button>
      </div>

      {/* Bike selector */}
      {bikes.length > 1 && (
        <div className="flex gap-2 mb-5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {bikes.map((b) => (
            <button key={b.id} onClick={() => setSelectedBikeId(b.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
              style={selectedBikeId === b.id ? { background: "#ff6b00", color: "white" } : { background: "#13131a", color: "#9ca3af", border: "1px solid #252535" }}>
              🏍️ {b.nickname || `${b.make} ${b.model}`}
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard icon="📊" label="平均燃費" value={stats.avgFuelEfficiency > 0 ? `${stats.avgFuelEfficiency.toFixed(1)} km/L` : "--"} />
        <StatCard icon="⛽" label="累計給油量" value={`${stats.totalLiters.toFixed(1)} L`} />
        <StatCard icon="💴" label="累計給油費" value={`¥${stats.totalCost.toLocaleString()}`} />
        <StatCard icon="🔢" label="給油回数" value={`${records.length} 回`} />
      </div>

      {/* Cost per km */}
      {stats.costPerKm > 0 && (
        <div className="card p-4 mb-5 flex items-center gap-4">
          <span className="text-3xl">💡</span>
          <div>
            <div className="text-sm text-gray-400">燃料コスト</div>
            <div className="font-black text-2xl" style={{ color: "#ff6b00" }}>
              約 ¥{stats.costPerKm.toFixed(1)} <span className="text-sm font-normal text-gray-400">/ km</span>
            </div>
          </div>
          {stats.avgFuelEfficiency > 0 && (
            <div className="ml-auto text-right">
              <div className="text-xs text-gray-500">100km あたり</div>
              <div className="font-bold text-lg text-white">
                ¥{(stats.costPerKm * 100).toFixed(0)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monthly chart */}
      {records.length > 0 && (
        <div className="card p-5 mb-5">
          <h3 className="font-bold mb-4">💴 月別給油コスト（直近6ヶ月）</h3>
          <MiniBarChart data={monthlyData} />
        </div>
      )}

      {/* Records list */}
      <div className="space-y-3">
        <h3 className="font-bold">📋 給油記録</h3>

        {records.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">
            <div className="text-5xl mb-4">⛽</div>
            <p className="text-lg font-medium mb-1">給油記録がありません</p>
            <button onClick={openAdd} className="btn-primary mt-3 text-sm">最初の給油を記録する</button>
          </div>
        ) : (
          records.map((r, i) => {
            const eff = r.isFull ? efficiencies[records.filter(x => x.isFull).indexOf(r)] : null;
            return (
              <div key={r.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="text-center shrink-0">
                    <div className="text-2xl">⛽</div>
                    {r.isFull && <div className="text-[10px] text-green-400 font-bold mt-0.5">満タン</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{r.date}</span>
                      {r.station && <span className="text-xs text-gray-500">📍 {r.station}</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mt-1.5">
                      <span>💧 {r.liters} L</span>
                      <span>💴 ¥{r.pricePerLiter}/L</span>
                      <span>💰 ¥{r.totalCost.toLocaleString()}</span>
                      <span>📏 {r.odometer.toLocaleString()} km</span>
                    </div>
                    {eff && (
                      <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: eff >= 25 ? "rgba(16,185,129,0.15)" : eff >= 20 ? "rgba(255,107,0,0.15)" : "rgba(239,68,68,0.15)", color: eff >= 25 ? "#10b981" : eff >= 20 ? "#ff6b00" : "#ef4444" }}>
                        📊 {eff} km/L
                        {eff >= 25 ? " 👍 良好" : eff < 18 ? " ⚠️ 要確認" : ""}
                      </div>
                    )}
                    {r.note && <p className="text-xs text-gray-500 mt-1">📝 {r.note}</p>}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => openEdit(r)} className="text-xs text-gray-500 hover:text-white transition-colors">✏️ 編集</button>
                    <button onClick={() => { if (confirm("削除しますか？")) { deleteFuelRecord(r.id); refresh(); } }}
                      className="text-xs text-gray-600 hover:text-red-400 transition-colors">🗑 削除</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,0.75)" }}>
          <div className="card w-full max-w-md p-6 space-y-4 my-4">
            <h3 className="font-bold text-lg">⛽ {editId ? "給油記録を編集" : "給油記録を追加"}</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">日付 *</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">メーター (km) *</label>
                <input type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} placeholder="18450" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">給油量 (L) *</label>
              <input type="number" step="0.01" value={form.liters}
                onChange={(e) => { setAutoCalc("total"); setForm({ ...form, liters: e.target.value }); }}
                placeholder="12.5" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">単価 (円/L)</label>
                <input type="number" value={form.pricePerLiter}
                  onChange={(e) => { setAutoCalc("total"); setForm({ ...form, pricePerLiter: e.target.value }); }}
                  placeholder="172" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">合計金額 (円)</label>
                <input type="number" value={form.totalCost}
                  onChange={(e) => { setAutoCalc("unit"); setForm({ ...form, totalCost: e.target.value }); }}
                  placeholder="自動計算" />
              </div>
            </div>
            <p className="text-xs text-gray-500 -mt-2">💡 単価 × 給油量 で合計を自動計算します</p>

            <div>
              <label className="block text-sm font-medium mb-1">スタンド名</label>
              <input value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} placeholder="例: エネオス 渋谷店" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-auto" checked={form.isFull} onChange={(e) => setForm({ ...form, isFull: e.target.checked })} />
              <span className="text-sm">満タン給油（燃費計算に使用）</span>
            </label>
            {!form.isFull && <p className="text-xs text-orange-400">※ 燃費計算には満タン給油の記録のみ使用されます</p>}

            <div>
              <label className="block text-sm font-medium mb-1">メモ</label>
              <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="ツーリング前に満タン など" />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowForm(false)} className="btn-ghost flex-1">キャンセル</button>
              <button onClick={handleSubmit} className="btn-primary flex-1">{editId ? "更新する" : "記録する"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
