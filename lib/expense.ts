export type ExpenseCategory =
  | "fuel"       // ガソリン代
  | "highway"    // 高速代
  | "parking"    // 駐車場
  | "maintenance"// メンテナンス
  | "parts"      // パーツ・用品
  | "insurance"  // 保険
  | "tax"        // 税金・車検
  | "gear"       // ウェア・装備
  | "accommodation" // 宿泊
  | "food"       // 飲食（ツーリング中）
  | "other";     // その他

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
  fuel:          { label: "ガソリン代",     icon: "⛽", color: "#f97316" },
  highway:       { label: "高速代",         icon: "🛣️", color: "#3b82f6" },
  parking:       { label: "駐車・駐輪場",   icon: "🅿️", color: "#8b5cf6" },
  maintenance:   { label: "メンテナンス",   icon: "🔧", color: "#ef4444" },
  parts:         { label: "パーツ・用品",   icon: "⚙️", color: "#ec4899" },
  insurance:     { label: "保険",           icon: "🛡️", color: "#14b8a6" },
  tax:           { label: "税金・車検",     icon: "📋", color: "#f59e0b" },
  gear:          { label: "ウェア・装備",   icon: "🧥", color: "#6366f1" },
  accommodation: { label: "宿泊費",         icon: "🏨", color: "#10b981" },
  food:          { label: "飲食（ツーリング）", icon: "🍜", color: "#84cc16" },
  other:         { label: "その他",         icon: "💰", color: "#6b7280" },
};

export interface ExpenseRecord {
  id: string;
  bikeId?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  title: string;
  note?: string;
  isTouring: boolean; // ツーリング中の出費か
}

const KEY = "motohub_expenses";

export function loadExpenses(bikeId?: string): ExpenseRecord[] {
  try {
    const all: ExpenseRecord[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return bikeId ? all.filter((r) => !r.bikeId || r.bikeId === bikeId) : all;
  } catch { return []; }
}

export function saveExpense(record: ExpenseRecord) {
  const all = loadExpenses();
  const filtered = all.filter((r) => r.id !== record.id);
  filtered.push(record);
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  localStorage.setItem(KEY, JSON.stringify(filtered));
}

export function deleteExpense(id: string) {
  localStorage.setItem(KEY, JSON.stringify(loadExpenses().filter((r) => r.id !== id)));
}

export function createExpense(data: Omit<ExpenseRecord, "id">): ExpenseRecord {
  return { ...data, id: `exp_${Date.now()}` };
}

export interface ExpenseSummary {
  total: number;
  byCategory: { category: ExpenseCategory; total: number; count: number }[];
  byMonth: { month: string; total: number }[];
  touringTotal: number;
  maintenanceTotal: number;
}

export function calcExpenseSummary(records: ExpenseRecord[]): ExpenseSummary {
  const total = records.reduce((s, r) => s + r.amount, 0);
  const touringTotal = records.filter((r) => r.isTouring).reduce((s, r) => s + r.amount, 0);
  const maintenanceTotal = records.filter((r) => ["maintenance","parts","tax","insurance"].includes(r.category)).reduce((s, r) => s + r.amount, 0);

  const catMap = new Map<ExpenseCategory, { total: number; count: number }>();
  records.forEach((r) => {
    const cur = catMap.get(r.category) ?? { total: 0, count: 0 };
    catMap.set(r.category, { total: cur.total + r.amount, count: cur.count + 1 });
  });
  const byCategory = [...catMap.entries()]
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.total - a.total);

  const monthMap = new Map<string, number>();
  records.forEach((r) => {
    const m = r.date.slice(0, 7); // YYYY-MM
    monthMap.set(m, (monthMap.get(m) ?? 0) + r.amount);
  });
  const byMonth = [...monthMap.entries()]
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

  return { total, byCategory, byMonth, touringTotal, maintenanceTotal };
}

export const MOCK_EXPENSES: ExpenseRecord[] = [
  { id: "e1", bikeId: "bike_demo_1", category: "fuel",       amount: 2150, date: "2025-11-01", title: "給油 エネオス",     isTouring: false },
  { id: "e2", bikeId: "bike_demo_1", category: "highway",    amount: 3200, date: "2025-10-28", title: "箱根ツーリング 高速", isTouring: true, note: "往復" },
  { id: "e3", bikeId: "bike_demo_1", category: "fuel",       amount: 1882, date: "2025-10-18", title: "給油 出光",         isTouring: false },
  { id: "e4", bikeId: "bike_demo_1", category: "maintenance", amount: 8800, date: "2025-10-10", title: "オイル交換 工賃込み", isTouring: false },
  { id: "e5", bikeId: "bike_demo_1", category: "parts",      amount: 4500, date: "2025-10-05", title: "チェーンオイル・タオル等", isTouring: false },
  { id: "e6", bikeId: "bike_demo_1", category: "fuel",       amount: 2240, date: "2025-10-05", title: "給油 シェル",       isTouring: true },
  { id: "e7", bikeId: "bike_demo_1", category: "parking",    amount: 500,  date: "2025-10-05", title: "道の駅 駐輪場",    isTouring: true },
  { id: "e8", bikeId: "bike_demo_1", category: "food",       amount: 1200, date: "2025-10-05", title: "道の駅 ランチ",    isTouring: true },
  { id: "e9", bikeId: "bike_demo_1", category: "gear",       amount: 12800, date: "2025-09-15", title: "グローブ購入",   isTouring: false },
  { id: "e10",bikeId: "bike_demo_1", category: "fuel",       amount: 1782, date: "2025-09-20", title: "給油 コスモ",      isTouring: false },
  { id: "e11",bikeId: "bike_demo_1", category: "fuel",       amount: 2028, date: "2025-09-07", title: "給油 エネオス",    isTouring: false },
  { id: "e12",bikeId: "bike_demo_1", category: "insurance",  amount: 14000,date: "2025-08-01", title: "任意保険 年払い分割", isTouring: false },
];
