export type MaintenanceType = "oil" | "tire_front" | "tire_rear" | "chain" | "brake_front" | "brake_rear" | "coolant" | "battery" | "filter" | "other";

export interface MaintenanceRecord {
  id: string;
  type: MaintenanceType;
  label: string;
  km: number;
  date: string;
  note: string;
  nextKm?: number;
  nextDate?: string;
}

export interface Bike {
  id: string;
  nickname: string;
  make: string;
  model: string;
  year: number;
  color: string;
  imageUrl?: string;
  purchaseKm: number;
  currentKm: number;
  purchasedAt: string;
  maintenanceRecords: MaintenanceRecord[];
  notes: string;
}

export const MAINTENANCE_LABELS: Record<MaintenanceType, { label: string; icon: string; defaultIntervalKm: number }> = {
  oil:         { label: "エンジンオイル",   icon: "🛢️", defaultIntervalKm: 3000  },
  tire_front:  { label: "前タイヤ",         icon: "⭕", defaultIntervalKm: 10000 },
  tire_rear:   { label: "後タイヤ",         icon: "⭕", defaultIntervalKm: 7000  },
  chain:       { label: "チェーン",         icon: "⛓️", defaultIntervalKm: 5000  },
  brake_front: { label: "前ブレーキパッド", icon: "🔴", defaultIntervalKm: 15000 },
  brake_rear:  { label: "後ブレーキパッド", icon: "🔴", defaultIntervalKm: 15000 },
  coolant:     { label: "クーラント",       icon: "💧", defaultIntervalKm: 20000 },
  battery:     { label: "バッテリー",       icon: "🔋", defaultIntervalKm: 30000 },
  filter:      { label: "エアフィルター",   icon: "🌀", defaultIntervalKm: 10000 },
  other:       { label: "その他",           icon: "🔧", defaultIntervalKm: 0     },
};

const BIKES_KEY = "motohub_garage_bikes";

export function loadBikes(): Bike[] {
  try { return JSON.parse(localStorage.getItem(BIKES_KEY) ?? "[]"); } catch { return []; }
}

export function saveBike(bike: Bike) {
  const bikes = loadBikes().filter((b) => b.id !== bike.id);
  bikes.unshift(bike);
  localStorage.setItem(BIKES_KEY, JSON.stringify(bikes));
}

export function deleteBike(id: string) {
  localStorage.setItem(BIKES_KEY, JSON.stringify(loadBikes().filter((b) => b.id !== id)));
}

export function createBike(data: Omit<Bike, "id" | "maintenanceRecords">): Bike {
  return { ...data, id: `bike_${Date.now()}`, maintenanceRecords: [] };
}

/** Returns maintenance items sorted by urgency (remaining km ascending) */
export function getMaintenanceStatus(bike: Bike) {
  return bike.maintenanceRecords
    .filter((r) => r.nextKm != null)
    .map((r) => ({
      ...r,
      remaining: (r.nextKm ?? 0) - bike.currentKm,
      urgent: (r.nextKm ?? 0) - bike.currentKm <= 500,
      overdue: (r.nextKm ?? 0) - bike.currentKm <= 0,
    }))
    .sort((a, b) => a.remaining - b.remaining);
}

export const MOCK_BIKES: Bike[] = [
  {
    id: "bike_demo_1",
    nickname: "CB号",
    make: "Honda",
    model: "CB650R",
    year: 2022,
    color: "#cc3300",
    purchaseKm: 0,
    currentKm: 18450,
    purchasedAt: "2022-04-01",
    notes: "大事な相棒。年2回は遠方ツーリングしてる。",
    maintenanceRecords: [
      { id: "m1", type: "oil",   label: "エンジンオイル",   km: 16000, date: "2025-08-10", note: "Motul 5100 10W-40", nextKm: 19000 },
      { id: "m2", type: "chain", label: "チェーン",         km: 15000, date: "2025-07-01", note: "RK製に交換",          nextKm: 20000 },
      { id: "m3", type: "tire_rear", label: "後タイヤ", km: 12000, date: "2025-04-15", note: "PIRELLI ANGEL GT2", nextKm: 19000 },
    ],
  },
];
