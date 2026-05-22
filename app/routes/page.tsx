"use client";

import { useState } from "react";
import { mockRoutes } from "@/lib/mockData";
import { toast } from "@/components/Toast";

const difficulties = ["すべて", "初級", "中級", "上級"];

function DifficultyBadge({ d }: { d: string }) {
  const color = d === "easy" ? "text-green-400 bg-green-500/20" : d === "medium" ? "text-yellow-400 bg-yellow-500/20" : "text-red-400 bg-red-500/20";
  const label = d === "easy" ? "初級" : d === "medium" ? "中級" : "上級";
  return <span className={`tag ${color}`}>{label}</span>;
}

function Stars({ n }: { n: number }) {
  return <span className="star">{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

export default function RoutesPage() {
  const [filter, setFilter] = useState("すべて");
  const [search, setSearch] = useState("");
  const [likedRoutes, setLikedRoutes] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedRoutes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = mockRoutes.filter((r) => {
    const matchDiff =
      filter === "すべて" ||
      (filter === "初級" && (r.difficulty as string) === "easy") ||
      (filter === "中級" && (r.difficulty as string) === "medium") ||
      (filter === "上級" && (r.difficulty as string) === "hard");
    const matchSearch = r.title.includes(search) || r.tags.some((t) => t.includes(search));
    return matchDiff && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 pb-4 pt-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">
          🗺️ ツーリングルート
        </h1>
        <p className="text-gray-400">全国ライダーが投稿したおすすめルートを探そう</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="ルート名・地域で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <div style={{ display: "flex", gap: "8px" }}>
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              style={filter === d
                ? { background: "#ff6b00", color: "white", border: "none", padding: "10px 16px", borderRadius: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer", flex: 1, textAlign: "center" }
                : { background: "#13131a", color: "#9ca3af", border: "1px solid #252535", padding: "10px 16px", borderRadius: "10px", fontWeight: 600, fontSize: "14px", cursor: "pointer", flex: 1, textAlign: "center" }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Route cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((route) => (
          <article key={route.id} className="card overflow-hidden hover:border-[#3a3a4a] transition-all hover:-translate-y-0.5 cursor-pointer group">
            <div className="relative overflow-hidden">
              <img
                src={route.image}
                alt={route.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3">
                <DifficultyBadge d={route.difficulty} />
              </div>
              <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {route.distance}km
              </div>
            </div>
            <div className="p-5 space-y-4">
              <h3 className="font-bold leading-snug">{route.title}</h3>
              <div className="flex items-center gap-2">
                <img
                  src={route.author.avatar}
                  alt={route.author.name}
                  className="w-6 h-6 rounded-full bg-[#1a1a25]"
                />
                <span className="text-xs text-gray-400">{route.author.name}</span>
              </div>

              {/* Route stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-[#1a1a25] rounded-lg p-3">
                  <div className="font-bold text-[#ff6b00] mb-1">{route.distance}km</div>
                  <div className="text-gray-500">距離</div>
                </div>
                <div className="bg-[#1a1a25] rounded-lg p-3">
                  <div className="font-bold text-[#ff6b00] mb-1">{route.duration}</div>
                  <div className="text-gray-500">日数</div>
                </div>
                <div className="bg-[#1a1a25] rounded-lg p-3">
                  <div className="font-bold text-[#ff6b00] mb-1">{route.startPoint}</div>
                  <div className="text-gray-500">出発</div>
                </div>
              </div>

              {/* Ratings */}
              <div className="flex gap-4 text-xs">
                <div>
                  <span className="text-gray-500">景色: </span>
                  <Stars n={route.scenery} />
                </div>
                <div>
                  <span className="text-gray-500">道: </span>
                  <Stars n={route.road} />
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {route.tags.map((tag) => (
                  <span key={tag} className="tag bg-[#1a1a25] text-gray-400 border border-[#252535] text-xs">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[#252535]">
                <button
                  onClick={() => toggleLike(route.id)}
                  className="flex items-center gap-2 text-sm transition-colors py-1"
                  style={{ color: likedRoutes.has(route.id) ? "#f87171" : "#6b7280" }}
                >
                  {likedRoutes.has(route.id) ? "❤️" : "🤍"} {route.likes + (likedRoutes.has(route.id) ? 1 : 0)}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => { navigator.clipboard?.writeText("https://motohub-psi.vercel.app"); toast("🔗 URLをコピーしました"); }} className="text-xs btn-ghost py-2 px-4">
                    🔗 共有
                  </button>
                  <button onClick={() => toast("📍 ルート詳細は近日公開予定です", "soon")} className="text-xs btn-primary py-2 px-4">
                    詳細を見る
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-16 text-center text-gray-500 col-span-3">
          <div className="text-5xl mb-4">🗺️</div>
          <p className="text-lg">該当するルートが見つかりません</p>
          <p className="text-sm mt-1">検索条件を変えてみてください</p>
        </div>
      )}

      {/* Map preview section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">📍 ルートマップ（サンプル）</h2>
        <div className="card p-6 flex items-center justify-center min-h-64" style={{background: "linear-gradient(135deg, #0a1a0a 0%, #0a0a1a 100%)"}}>
          <div className="text-center">
            <div className="text-6xl mb-4">🗾</div>
            <p className="text-gray-400 mb-2">インタラクティブマップ</p>
            <p className="text-sm text-gray-500">
              本番環境では Mapbox / Google Maps でルートを地図上に表示します
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              {mockRoutes.map((r) => (
                <div key={r.id} className="bg-[#1a1a25] rounded-lg p-3 text-left">
                  <div className="font-medium text-xs mb-1 truncate">{r.title}</div>
                  <div className="text-[#ff6b00] text-xs">{r.startPoint} → {r.endPoint}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 card p-6 text-center" style={{background: "linear-gradient(135deg, rgba(255,107,0,0.1) 0%, rgba(204,85,0,0.05) 100%)", borderColor: "rgba(255,107,0,0.3)"}}>
        <h3 className="text-xl font-bold mb-2">あなたのルートを共有しよう！</h3>
        <p className="text-gray-400 text-sm mb-4">走ったルートを投稿して、全国のライダーと共有しましょう</p>
        <a href="/create" className="btn-primary inline-block">
          🗺️ ルートを投稿する
        </a>
      </div>
    </div>
  );
}
