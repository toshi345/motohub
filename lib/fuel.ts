export interface FuelRecord {
  id: string;
  bikeId: string;
  date: string;
  liters: number;        // 給油量 (L)
  pricePerLiter: number; // 単価 (円/L)
  totalCost: number;     // 合計金額 (円)
  odometer: number;      // 給油時のメーター (km)
  isFull: boolean;       // 満タン給油か
  station?: string;      // スタンド名
  note?: string;
}

export interface FuelStats {
  avgFuelEfficiency: number;  // 平均燃費 (km/L)
  totalLiters: number;        // 累計給油量
  totalCost: number;          // 累計給油コスト
  totalDistance: number;      // 計測距離
  costPerKm: number;          // 円/km
  lastRecord?: FuelRecord;
  records: FuelRecord[];
}

const KEY = "motohub_fuel_records";

export function loadFuelRecords(bikeId?: string): FuelRecord[] {
  try {
    const all: FuelRecord[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return bikeId ? all.filter((r) => r.bikeId === bikeId) : all;
  } catch { return []; }
}

export function saveFuelRecord(record: FuelRecord) {
  const all = loadFuelRecords();
  const filtered = all.filter((r) => r.id !== record.id);
  filtered.push(record);
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  localStorage.setItem(KEY, JSON.stringify(filtered));
}

export function deleteFuelRecord(id: string) {
  const all = loadFuelRecords().filter((r) => r.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function createFuelRecord(data: Omit<FuelRecord, "id">): FuelRecord {
  return { ...data, id: `fuel_${Date.now()}` };
}

/** 満タン法で燃費計算 */
export function calcFuelStats(records: FuelRecord[]): FuelStats {
  const sorted = [...records].sort((a, b) => a.odometer - b.odometer);
  const fullRecords = sorted.filter((r) => r.isFull);

  let totalDistance = 0;
  let totalLiters = 0;
  let segments: { km: number; liters: number }[] = [];

  for (let i = 1; i < fullRecords.length; i++) {
    const prev = fullRecords[i - 1];
    const curr = fullRecords[i];
    const km = curr.odometer - prev.odometer;
    if (km > 0 && curr.liters > 0) {
      segments.push({ km, liters: curr.liters });
      totalDistance += km;
      totalLiters += curr.liters;
    }
  }

  const allLiters = records.reduce((s, r) => s + r.liters, 0);
  const allCost = records.reduce((s, r) => s + r.totalCost, 0);
  const avgFuelEfficiency = totalLiters > 0 ? totalDistance / totalLiters : 0;
  const costPerKm = totalDistance > 0 ? allCost / (records.reduce((s,r) => s + (r.odometer), 0) > 0 ? totalDistance : 1) : 0;

  return {
    avgFuelEfficiency,
    totalLiters: allLiters,
    totalCost: allCost,
    totalDistance,
    costPerKm: avgFuelEfficiency > 0 ? (records.reduce((s,r)=>s+r.pricePerLiter,0)/records.length) / avgFuelEfficiency : 0,
    lastRecord: sorted[sorted.length - 1],
    records: sorted.reverse(),
  };
}

export const MOCK_FUEL_RECORDS: FuelRecord[] = [
  { id: "f1", bikeId: "bike_demo_1", date: "2025-11-01", liters: 12.5, pricePerLiter: 172, totalCost: 2150, odometer: 18450, isFull: true, station: "エネオス 環状8号店", note: "ツーリング前に満タン" },
  { id: "f2", bikeId: "bike_demo_1", date: "2025-10-18", liters: 11.2, pricePerLiter: 168, totalCost: 1882, odometer: 18120, isFull: true, station: "出光 青梅街道店" },
  { id: "f3", bikeId: "bike_demo_1", date: "2025-10-05", liters: 13.1, pricePerLiter: 171, totalCost: 2240, odometer: 17780, isFull: true, station: "シェル 調布IC前" },
  { id: "f4", bikeId: "bike_demo_1", date: "2025-09-20", liters: 10.8, pricePerLiter: 165, totalCost: 1782, odometer: 17420, isFull: true, station: "コスモ石油 府中店" },
  { id: "f5", bikeId: "bike_demo_1", date: "2025-09-07", liters: 12.0, pricePerLiter: 169, totalCost: 2028, odometer: 17050, isFull: true, station: "エネオス 環状8号店" },
];
