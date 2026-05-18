import { TrackSession } from "./gps";

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  category: "distance" | "rides" | "speed" | "streak" | "community";
  rarity: "bronze" | "silver" | "gold" | "platinum";
  unlockedAt?: string;
  progress?: number; // 0-100
  check: (stats: RidingStats, sessions: TrackSession[]) => boolean;
  getProgress: (stats: RidingStats, sessions: TrackSession[]) => number;
}

export interface RidingStats {
  totalDistanceKm: number;
  totalRides: number;
  maxSingleDistanceKm: number;
  maxSpeedKmh: number;
  totalDurationMs: number;
  longestStreakDays: number;
}

const rarityColor: Record<string, string> = {
  bronze:   "from-amber-700 to-amber-600",
  silver:   "from-gray-400 to-gray-300",
  gold:     "from-yellow-500 to-yellow-400",
  platinum: "from-cyan-400 to-purple-400",
};
const rarityLabel: Record<string, string> = {
  bronze: "ブロンズ", silver: "シルバー", gold: "ゴールド", platinum: "プラチナ",
};
const rarityBorder: Record<string, string> = {
  bronze: "#92400e", silver: "#9ca3af", gold: "#eab308", platinum: "#22d3ee",
};
export { rarityColor, rarityLabel, rarityBorder };

export function calcStats(sessions: TrackSession[]): RidingStats {
  const completed = sessions.filter((s) => s.stoppedAt);
  const totalDistanceKm = completed.reduce((s, r) => s + r.totalDistanceKm, 0);
  const maxSingleDistanceKm = Math.max(0, ...completed.map((r) => r.totalDistanceKm));
  const maxSpeedKmh = Math.max(0, ...completed.map((r) => r.maxSpeedKmh));
  const totalDurationMs = completed.reduce((s, r) => s + ((r.stoppedAt ?? 0) - r.startedAt), 0);

  // Streak: count consecutive days with at least one ride
  const rideDays = new Set(completed.map((r) => new Date(r.startedAt).toDateString()));
  let streak = 0, maxStreak = 0, cur = 0;
  const sorted = [...rideDays].sort();
  sorted.forEach((d, i) => {
    if (i === 0) { cur = 1; } else {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(d);
      const diff = (curr.getTime() - prev.getTime()) / 86400000;
      cur = diff === 1 ? cur + 1 : 1;
    }
    maxStreak = Math.max(maxStreak, cur);
  });
  streak = maxStreak;

  return { totalDistanceKm, totalRides: completed.length, maxSingleDistanceKm, maxSpeedKmh, totalDurationMs, longestStreakDays: streak };
}

export const ACHIEVEMENTS: Achievement[] = [
  // --- Distance ---
  {
    id: "dist_100", title: "初ツーリング", desc: "累計100km走破", icon: "🏁", category: "distance", rarity: "bronze",
    check: (s) => s.totalDistanceKm >= 100,
    getProgress: (s) => Math.min(100, (s.totalDistanceKm / 100) * 100),
  },
  {
    id: "dist_500", title: "ロードランナー", desc: "累計500km走破", icon: "🛣️", category: "distance", rarity: "bronze",
    check: (s) => s.totalDistanceKm >= 500,
    getProgress: (s) => Math.min(100, (s.totalDistanceKm / 500) * 100),
  },
  {
    id: "dist_1000", title: "サンセットライダー", desc: "累計1,000km走破", icon: "🌅", category: "distance", rarity: "silver",
    check: (s) => s.totalDistanceKm >= 1000,
    getProgress: (s) => Math.min(100, (s.totalDistanceKm / 1000) * 100),
  },
  {
    id: "dist_5000", title: "ハイウェイスター", desc: "累計5,000km走破", icon: "⭐", category: "distance", rarity: "silver",
    check: (s) => s.totalDistanceKm >= 5000,
    getProgress: (s) => Math.min(100, (s.totalDistanceKm / 5000) * 100),
  },
  {
    id: "dist_10000", title: "鉄の旅人", desc: "累計10,000km走破", icon: "🏆", category: "distance", rarity: "gold",
    check: (s) => s.totalDistanceKm >= 10000,
    getProgress: (s) => Math.min(100, (s.totalDistanceKm / 10000) * 100),
  },
  {
    id: "dist_50000", title: "伝説のライダー", desc: "累計50,000km走破", icon: "👑", category: "distance", rarity: "platinum",
    check: (s) => s.totalDistanceKm >= 50000,
    getProgress: (s) => Math.min(100, (s.totalDistanceKm / 50000) * 100),
  },
  // --- Single ride ---
  {
    id: "single_300", title: "ロングライダー", desc: "1回のツーリングで300km以上", icon: "🗾", category: "distance", rarity: "silver",
    check: (s) => s.maxSingleDistanceKm >= 300,
    getProgress: (s) => Math.min(100, (s.maxSingleDistanceKm / 300) * 100),
  },
  {
    id: "single_500", title: "超長距離ライダー", desc: "1回のツーリングで500km以上", icon: "🚀", category: "distance", rarity: "gold",
    check: (s) => s.maxSingleDistanceKm >= 500,
    getProgress: (s) => Math.min(100, (s.maxSingleDistanceKm / 500) * 100),
  },
  // --- Rides count ---
  {
    id: "rides_10", title: "週末ライダー", desc: "10回以上走行記録", icon: "📅", category: "rides", rarity: "bronze",
    check: (s) => s.totalRides >= 10,
    getProgress: (s) => Math.min(100, (s.totalRides / 10) * 100),
  },
  {
    id: "rides_50", title: "熟練ライダー", desc: "50回以上走行記録", icon: "🎖️", category: "rides", rarity: "silver",
    check: (s) => s.totalRides >= 50,
    getProgress: (s) => Math.min(100, (s.totalRides / 50) * 100),
  },
  {
    id: "rides_100", title: "走行マスター", desc: "100回以上走行記録", icon: "💯", category: "rides", rarity: "gold",
    check: (s) => s.totalRides >= 100,
    getProgress: (s) => Math.min(100, (s.totalRides / 100) * 100),
  },
  // --- Streak ---
  {
    id: "streak_3", title: "3日連続ライダー", desc: "3日連続で走行記録", icon: "🔥", category: "streak", rarity: "bronze",
    check: (s) => s.longestStreakDays >= 3,
    getProgress: (s) => Math.min(100, (s.longestStreakDays / 3) * 100),
  },
  {
    id: "streak_7", title: "週間ライダー", desc: "7日連続で走行記録", icon: "🌟", category: "streak", rarity: "silver",
    check: (s) => s.longestStreakDays >= 7,
    getProgress: (s) => Math.min(100, (s.longestStreakDays / 7) * 100),
  },
  // --- Speed ---
  {
    id: "speed_100", title: "100km/h クラブ", desc: "最高速度100km/h以上を記録（公道法定速度内で）", icon: "⚡", category: "speed", rarity: "bronze",
    check: (s) => s.maxSpeedKmh >= 100,
    getProgress: (s) => Math.min(100, (s.maxSpeedKmh / 100) * 100),
  },
  {
    id: "speed_150", title: "スピードスター", desc: "最高速度150km/h以上を記録（サーキットなど）", icon: "💨", category: "speed", rarity: "silver",
    check: (s) => s.maxSpeedKmh >= 150,
    getProgress: (s) => Math.min(100, (s.maxSpeedKmh / 150) * 100),
  },
];

export function evaluateAchievements(sessions: TrackSession[]): Achievement[] {
  const stats = calcStats(sessions);
  return ACHIEVEMENTS.map((a) => ({
    ...a,
    unlockedAt: a.check(stats, sessions) ? "unlocked" : undefined,
    progress: Math.round(a.getProgress(stats, sessions)),
  }));
}
