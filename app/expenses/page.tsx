"use client";

import { useState, useEffect } from "react";
import {
  ExpenseRecord, ExpenseCategory, EXPENSE_CATEGORIES,
  loadExpenses, saveExpense, deleteExpense, createExpense,
  calcExpenseSummary, MOCK_EXPENSES,
} from "@/lib/expense";
import { loadBikes, Bike, MOCK_BIKES, saveBike } from "@/lib/garage";

const PERIOD_OPTIONS = [
  { key: "month", label: "今月" },
  { key: "3month", label: "3ヶ月" },
  { key: "year", label: "今年" },
  { key: "all", label: "すべて" },
];

const emptyForm = {
  category: "fuel" as ExpenseCategory,
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  title: "",
  note: "",
  isTouring: false,
};

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  let offset = 0;
  const r = 40, cx = 50, cy = 50, circumference = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 100 100" className="w-32 h-32 shrink-0 -rotate-90">
        {data.map((d) => {
          const pct = d.value / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const el = (
            <circle key={d.label} cx={cx} cy={cy} r={r}
              fill="none" stroke={d.color} strokeWidth="18"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circumference}
            />
          );
          offset += pct;
          return el;
        })}
        <circle cx={cx} cy={cy} r="28" fill="#13131a" />
      </svg>
      <div className="space-y-1.5 flex-1 min-w-0">
        {data.slice(0, 5).map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-gray-400 flex-1 truncate">{d.label}</span>
            <span className="font-bold text-white">¥{d.value.toLocaleString()}</span>
            <span className="text-gray-600">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }: { data: { month: string; total: number }[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map(({ month, total }) => (
        <div key={month} className="flex-1 flex flex-col items-center gap-1">
          {total > 0 && <span className="text-[10px] text-gray-500">¥{(total/1000).toFixed(0)}k</span>}
          <div className="w-full rounded-t transition-all"
            style={{ height: `${Math.max((total / max) * 64, total > 0 ? 4 : 2)}px`, background: total > 0 ? "linear-gradient(to top, #cc5500, #ff6b00)" : "#252535" }} />
          <span className="text-[10px] text-gray-500">{month.slice(5)}月</span>
        </div>
      ))}
    </div>
  );
}

export default function ExpensesPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [selectedBikeId, setSelectedBikeId] = useState<string>("");
  const [records, setRecords] = useState<ExpenseRecord[]>([]);
  const [period, setPeriod] = useState<string>("month");
  const [filterCat, setFilterCat] = useState<ExpenseCategory | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  const refresh = () => {
    let bs = loadBikes();
    if (bs.length === 0) { bs = MOCK_BIKES; bs.forEach(saveBike); }
    setBikes(bs);
    if (!selectedBikeId && bs.length > 0) setSelectedBikeId(bs[0].id);

    let recs = loadExpenses(selectedBikeId || bs[0]?.id);
    if (recs.length === 0) { MOCK_EXPENSES.forEach(saveExpense); recs = loadExpenses(selectedBikeId || bs[0]?.id); }
    setRecords(recs);
  };

  useEffect(() => { refresh(); }, [selectedBikeId]);

  const filterByPeriod = (recs: ExpenseRecord[]) => {
    const now = new Date();
    return recs.filter((r) => {
      const d = new Date(r.date);
      if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (period === "3month") { const ago = new Date(now); ago.setMonth(ago.getMonth() - 3); return d >= ago; }
      if (period === "year") return d.getFullYear() === now.getFullYear();
      return true;
    });
  };

  const periodRecords = filterByPeriod(records);
  const filtered = filterCat === "all" ? periodRecords : periodRecords.filter((r) => r.category === filterCat);
  const summary = calcExpenseSummary(periodRecords);

  const donutData = summary.byCategory.map(({ category, total }) => ({
    label: EXPENSE_CATEGORIES[category].label,
    value: total,
    color: EXPENSE_CATEGORIES[category].color,
  }));

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (r: ExpenseRecord) => {
    setForm({ category: r.category, amount: r.amount.toString(), date: r.date, title: r.title, note: r.note ?? "", isTouring: r.isTouring });
    setEditId(r.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.date || !form.amount || !form.title) return;
    const record = createExpense({
      bikeId: selectedBikeId,
      category: form.category,
      amount: parseInt(form.amount),
      date: form.date,
      title: form.title,
      note: form.note || undefined,
      isTouring: form.isTouring,
    });
    if (editId) deleteExpense(editId);
    saveExpense(record);
    setShowForm(false);
    refresh();
  };

  const periodLabel = PERIOD_OPTIONS.find((p) => p.key === period)?.label ?? "";

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 md:pb-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black mb-1">💴 費用管理</h1>
          <p className="text-gray-400 text-sm">バイクにかかる全費用を記録・分析</p>
        </div>
        <button onClick={openAdd} className="btn-primary">＋ 費用を記録</button>
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

      {/* Period filter */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {PERIOD_OPTIONS.map((p) => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            style={period === p.key
              ? { background: "#ff6b00", color: "white", border: "none", padding: "10px 0", borderRadius: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer", flex: 1, textAlign: "center" }
              : { background: "#13131a", color: "#9ca3af", border: "1px solid #252535", padding: "10px 0", borderRadius: "10px", fontWeight: 600, fontSize: "14px", cursor: "pointer", flex: 1, textAlign: "center" }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="card p-4 text-center col-span-2 md:col-span-1">
          <div className="text-2xl mb-1">💴</div>
          <div className="text-2xl font-black" style={{ color: "#ff6b00" }}>¥{summary.total.toLocaleString()}</div>
          <div className="text-xs text-gray-500">{periodLabel}の合計</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl mb-1">⛽</div>
          <div className="text-xl font-black" style={{ color: "#ff6b00" }}>¥{summary.byCategory.find(c=>c.category==="fuel")?.total.toLocaleString() ?? 0}</div>
          <div className="text-xs text-gray-500">燃料費</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl mb-1">🔧</div>
          <div className="text-xl font-black" style={{ color: "#ff6b00" }}>¥{summary.maintenanceTotal.toLocaleString()}</div>
          <div className="text-xs text-gray-500">メンテ関連</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl mb-1">🗺️</div>
          <div className="text-xl font-black" style={{ color: "#ff6b00" }}>¥{summary.touringTotal.toLocaleString()}</div>
          <div className="text-xs text-gray-500">ツーリング費</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Donut chart */}
        {donutData.length > 0 && (
          <div className="card p-5">
            <h3 className="font-bold mb-4">📊 カテゴリ別内訳</h3>
            <DonutChart data={donutData} />
          </div>
        )}

        {/* Monthly bar */}
        {summary.byMonth.length > 0 && (
          <div className="card p-5">
            <h3 className="font-bold mb-4">📈 月別支出</h3>
            <BarChart data={summary.byMonth} />
          </div>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        <button onClick={() => setFilterCat("all")}
          className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
          style={filterCat === "all" ? { background: "#ff6b00", color: "white" } : { background: "#13131a", color: "#9ca3af", border: "1px solid #252535" }}>
          すべて
        </button>
        {(Object.entries(EXPENSE_CATEGORIES) as [ExpenseCategory, typeof EXPENSE_CATEGORIES[ExpenseCategory]][]).map(([key, v]) => (
          <button key={key} onClick={() => setFilterCat(key)}
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1"
            style={filterCat === key ? { background: v.color, color: "white" } : { background: "#13131a", color: "#9ca3af", border: "1px solid #252535" }}>
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      {/* Records */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="card p-12 text-center text-gray-500">
            <div className="text-5xl mb-3">💴</div>
            <p>この期間の記録がありません</p>
            <button onClick={openAdd} className="btn-primary mt-4 text-sm">費用を記録する</button>
          </div>
        ) : (
          filtered.map((r) => {
            const cat = EXPENSE_CATEGORIES[r.category];
            return (
              <div key={r.id} className="card p-4 flex items-center gap-3 hover:border-[#3a3a4a] transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: `${cat.color}22`, border: `1px solid ${cat.color}44` }}>
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{r.title}</span>
                    {r.isTouring && <span className="tag text-xs" style={{ background: "rgba(59,130,246,0.2)", color: "#93c5fd" }}>ツーリング</span>}
                  </div>
                  <div className="text-xs text-gray-500 flex gap-2 mt-0.5">
                    <span>{r.date}</span>
                    <span style={{ color: cat.color }}>{cat.label}</span>
                  </div>
                  {r.note && <p className="text-xs text-gray-600 mt-0.5">{r.note}</p>}
                </div>
                <div className="text-right shrink-0">
                  <div className="font-black text-base">¥{r.amount.toLocaleString()}</div>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => openEdit(r)} className="text-xs text-gray-500 hover:text-white transition-colors">✏️</button>
                    <button onClick={() => { if (confirm("削除しますか？")) { deleteExpense(r.id); refresh(); } }}
                      className="text-xs text-gray-600 hover:text-red-400 transition-colors">🗑</button>
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
            <h3 className="font-bold text-lg">💴 {editId ? "費用を編集" : "費用を記録"}</h3>

            <div>
              <label className="block text-sm font-medium mb-2">カテゴリ</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(EXPENSE_CATEGORIES) as [ExpenseCategory, typeof EXPENSE_CATEGORIES[ExpenseCategory]][]).map(([key, v]) => (
                  <button key={key} type="button" onClick={() => setForm({ ...form, category: key })}
                    className="p-2 rounded-lg text-xs font-medium border text-center transition-all"
                    style={form.category === key
                      ? { borderColor: v.color, background: `${v.color}22`, color: v.color }
                      : { borderColor: "#252535", color: "#9ca3af" }}>
                    <div className="text-lg mb-0.5">{v.icon}</div>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">タイトル *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={`例: ${EXPENSE_CATEGORIES[form.category].label}`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">金額 (円) *</label>
                <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="1500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">日付 *</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-auto" checked={form.isTouring} onChange={(e) => setForm({ ...form, isTouring: e.target.checked })} />
              <span className="text-sm">ツーリング中の出費</span>
            </label>

            <div>
              <label className="block text-sm font-medium mb-1">メモ</label>
              <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="詳細メモ" />
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
