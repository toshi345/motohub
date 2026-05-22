"use client";

import { useState, useEffect } from "react";
import { loadSessions } from "@/lib/gps";
import { evaluateAchievements, calcStats, Achievement, rarityColor, rarityLabel, rarityBorder } from "@/lib/achievements";
import { RulerIcon, BikeIcon, SpeedIcon } from "@/components/Icons";

function AchievementCard({ a }: { a: Achievement }) {
  const unlocked = !!a.unlockedAt;
  const borderColor = unlocked ? rarityBorder[a.rarity] : "#252535";

  return (
    <div
      className={`card p-4 transition-all ${unlocked ? "hover:scale-[1.02]" : "opacity-60"}`}
      style={{ borderColor }}
    >
      {/* Icon + rarity */}
      <div className="flex items-start justify-between mb-2">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${unlocked ? "" : "grayscale"}`}
          style={{
            background: unlocked
              ? `linear-gradient(135deg, ${rarityBorder[a.rarity]}33, ${rarityBorder[a.rarity]}11)`
              : "#1a1a25",
            border: unlocked ? `1px solid ${rarityBorder[a.rarity]}55` : "1px solid #252535",
          }}
        >
          {a.icon}
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            background: unlocked ? `${rarityBorder[a.rarity]}22` : "#1a1a25",
            color: unlocked ? rarityBorder[a.rarity] : "#4b5563",
          }}
        >
          {rarityLabel[a.rarity]}
        </span>
      </div>

      {/* Title + desc */}
      <h3 className={`font-bold text-sm mb-0.5 ${unlocked ? "text-white" : "text-gray-500"}`}>
        {a.title}
      </h3>
      <p className="text-xs text-gray-500 mb-3">{a.desc}</p>

      {/* Progress bar */}
      {!unlocked && (
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>進捗</span>
            <span>{a.progress}%</span>
          </div>
          <div className="h-1.5 bg-[#252535] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${a.progress}%`, background: "#ff6b00" }}
            />
          </div>
        </div>
      )}

      {unlocked && (
        <div className="flex items-center gap-1 text-xs font-medium" style={{ color: rarityBorder[a.rarity] }}>
          ✓ 達成済み
        </div>
      )}
    </div>
  );
}

const CATEGORIES = [
  { key: "all", label: "すべて", icon: "🏆" },
  { key: "distance", label: "走行距離", icon: "📏" },
  { key: "rides", label: "走行回数", icon: "🏍️" },
  { key: "speed", label: "スピード", icon: "⚡" },
  { key: "streak", label: "連続記録", icon: "🔥" },
];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState("all");
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [stats, setStats] = useState({ totalDistanceKm: 0, totalRides: 0, maxSpeedKmh: 0 });

  useEffect(() => {
    const sessions = loadSessions();
    setAchievements(evaluateAchievements(sessions));
    const s = calcStats(sessions);
    setStats({ totalDistanceKm: s.totalDistanceKm, totalRides: s.totalRides, maxSpeedKmh: s.maxSpeedKmh });
  }, []);

  const unlocked = achievements.filter((a) => a.unlockedAt);
  const filtered = achievements.filter((a) => {
    if (filter !== "all" && a.category !== filter) return false;
    if (showUnlockedOnly && !a.unlockedAt) return false;
    return true;
  });

  const byRarity = (arr: Achievement[]) => {
    const order = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
    return [...arr].sort((a, b) => {
      if (!!a.unlockedAt !== !!b.unlockedAt) return a.unlockedAt ? -1 : 1;
      return order[a.rarity] - order[b.rarity];
    });
  };

  const pct = achievements.length > 0 ? Math.round((unlocked.length / achievements.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-4 pt-6">
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-1">🏆 実績・バッジ</h1>
        <p className="text-gray-400 text-sm">走行記録で解除される実績コレクション</p>
      </div>

      {/* Overview */}
      <div className="card p-5 mb-6" style={{ background: "linear-gradient(135deg, #1a0a00, #0a0a1a)" }}>
        <div className="flex items-center gap-5">
          <div className="text-center">
            <div className="text-4xl font-black" style={{ color: "#ff6b00" }}>{unlocked.length}</div>
            <div className="text-xs text-gray-500">解除済み</div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{unlocked.length} / {achievements.length} 達成</span>
              <span style={{ color: "#ff6b00" }}>{pct}%</span>
            </div>
            <div className="h-3 bg-[#252535] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #cc5500, #ff6b00)" }} />
            </div>
            <div className="flex gap-3 mt-3 text-xs text-gray-500">
              {(["bronze", "silver", "gold", "platinum"] as const).map((r) => {
                const cnt = unlocked.filter((a) => a.rarity === r).length;
                return (
                  <span key={r} style={{ color: rarityBorder[r] }}>
                    {rarityLabel[r]} ×{cnt}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Riding stats summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-3 text-center">
          <div className="flex justify-center mb-1"><RulerIcon size={20} color="#ff6b00" /></div>
          <div className="font-black" style={{ color: "#ff6b00" }}>{stats.totalDistanceKm.toFixed(0)} km</div>
          <div className="text-xs text-gray-500">累計走行距離</div>
        </div>
        <div className="card p-3 text-center">
          <div className="flex justify-center mb-1"><BikeIcon size={20} color="#ff6b00" /></div>
          <div className="font-black" style={{ color: "#ff6b00" }}>{stats.totalRides} 回</div>
          <div className="text-xs text-gray-500">走行回数</div>
        </div>
        <div className="card p-3 text-center">
          <div className="flex justify-center mb-1"><SpeedIcon size={20} color="#ff6b00" /></div>
          <div className="font-black" style={{ color: "#ff6b00" }}>{Math.round(stats.maxSpeedKmh)} km/h</div>
          <div className="text-xs text-gray-500">最高速度</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
              style={filter === c.key
                ? { background: "#ff6b00", color: "white" }
                : { background: "#13131a", color: "#9ca3af", border: "1px solid #252535" }}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 cursor-pointer ml-auto shrink-0">
          <input
            type="checkbox"
            className="w-auto"
            checked={showUnlockedOnly}
            onChange={(e) => setShowUnlockedOnly(e.target.checked)}
          />
          <span className="text-sm text-gray-400">達成済みのみ</span>
        </label>
      </div>

      {/* Achievement grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <div className="text-5xl mb-3">🏆</div>
          <p>該当する実績がありません</p>
          <p className="text-sm mt-1">走行記録を積み重ねてバッジを解除しましょう！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {byRarity(filtered).map((a) => (
            <AchievementCard key={a.id} a={a} />
          ))}
        </div>
      )}

      {/* Next milestones */}
      {!showUnlockedOnly && (
        <div className="mt-8">
          <h2 className="font-bold mb-4">🎯 次の目標</h2>
          <div className="space-y-3">
            {achievements
              .filter((a) => !a.unlockedAt && (a.progress ?? 0) > 0)
              .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))
              .slice(0, 3)
              .map((a) => (
                <div key={a.id} className="card p-4 flex items-center gap-4">
                  <span className="text-3xl">{a.icon}</span>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{a.title}</div>
                    <div className="text-xs text-gray-500 mb-1.5">{a.desc}</div>
                    <div className="h-1.5 bg-[#252535] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${a.progress}%`, background: "#ff6b00" }} />
                    </div>
                  </div>
                  <span className="text-[#ff6b00] font-bold text-sm">{a.progress}%</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
