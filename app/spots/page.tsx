"use client";

import { useState } from "react";
import { mockSpots } from "@/lib/mockData";
import { toast } from "@/components/Toast";
import { PinIcon, MapIcon, TagIcon, FlameIcon } from "@/components/Icons";

const categories = ["すべて", "道の駅", "峠", "絶景", "グルメ", "温泉"];

function CategoryIcon({ cat }: { cat: string }) {
  const map: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
    "道の駅": PinIcon,
    "峠": MapIcon,
    "絶景": MapIcon,
    "グルメ": TagIcon,
    "温泉": FlameIcon,
    "その他": PinIcon,
  };
  const Icon = map[cat] ?? PinIcon;
  return <Icon size={14} color="currentColor" />;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="star text-sm">
      {"★".repeat(full)}
      {half ? "⭐" : ""}
      {"☆".repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

const reviews = [
  { user: "峠マスター鈴木", avatar: "Suzuki", bg: "ffdfbf", spot: "s1", rating: 5, comment: "朝霧の中の富士山が最高！ライダー同士で話が弾みました。駐車場も広くて安心。", date: "2025-11-01" },
  { user: "旅人田中", avatar: "Tanaka", bg: "d1f4e0", spot: "s3", rating: 5, comment: "やまなみは何度来ても感動する。阿蘇の外輪山を見ながら走るあの感覚は唯一無二。ぜひ早朝に！", date: "2025-10-28" },
  { user: "ツーリング佐藤", avatar: "Sato", bg: "c0aede", spot: "s2", rating: 4, comment: "北海道の広大さを実感できる場所。ソフトクリームが絶品でした。ライダーが多く集まる場所なので情報交換できる！", date: "2025-10-20" },
];

export default function SpotsPage() {
  const [activeCategory, setActiveCategory] = useState("すべて");
  const [search, setSearch] = useState("");
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);

  const filtered = mockSpots.filter((s) => {
    const matchCat = activeCategory === "すべて" || s.category === activeCategory;
    const matchSearch = s.name.includes(search) || s.description.includes(search);
    return matchCat && matchSearch;
  });

  const spotReviews = reviews.filter((r) => r.spot === selectedSpot);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-4 pt-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2 flex items-center gap-2"><PinIcon size={28} color="#ff6b00" className="inline-block" /> スポットクチコミ</h1>
        <p className="text-gray-400">全国のライダーが厳選したおすすめスポット</p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="スポット名・地域で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            style={activeCategory === c
              ? { background: "#ff6b00", color: "white", border: "none", padding: "10px 0", borderRadius: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer", flex: 1, textAlign: "center", minWidth: "60px" }
              : { background: "#13131a", color: "#9ca3af", border: "1px solid #252535", padding: "10px 0", borderRadius: "10px", fontWeight: 600, fontSize: "14px", cursor: "pointer", flex: 1, textAlign: "center", minWidth: "60px" }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Spots grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 mb-10">
        {filtered.map((spot) => (
          <article
            key={spot.id}
            className={`card overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 group ${selectedSpot === spot.id ? "border-[#ff6b00]" : "hover:border-[#3a3a4a]"}`}
            onClick={() => setSelectedSpot(selectedSpot === spot.id ? null : spot.id)}
          >
            <div className="relative overflow-hidden">
              <img
                src={spot.image}
                alt={spot.name}
                className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <CategoryIcon cat={spot.category} />
                <span>{spot.category}</span>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <h3 className="font-bold text-base">{spot.name}</h3>
              <div className="flex items-center gap-2">
                <Stars rating={spot.rating} />
                <span className="text-yellow-400 font-bold text-sm">{spot.rating}</span>
                <span className="text-xs text-gray-500">({spot.reviewCount}件のクチコミ)</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{spot.description}</p>
              <div className="flex items-center justify-between pt-3 border-t border-[#252535]">
                <span className="text-xs text-gray-500">
                  📌 {spot.lat.toFixed(2)}°N, {spot.lng.toFixed(2)}°E
                </span>
                <button className="text-sm text-[#ff6b00] hover:underline py-1 px-2">
                  {selectedSpot === spot.id ? "▲ 閉じる" : "▼ クチコミを見る"}
                </button>
              </div>
            </div>

            {/* Inline reviews */}
            {selectedSpot === spot.id && (
              <div className="border-t border-[#252535] p-5 bg-[#0f0f18] space-y-4">
                <h4 className="text-sm font-bold">💬 クチコミ</h4>
                {reviews.filter((r) => r.spot === spot.id).length > 0 ? (
                  reviews.filter((r) => r.spot === spot.id).map((rev, i) => (
                    <div key={i} className="flex gap-3">
                      <img
                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${rev.avatar}&backgroundColor=${rev.bg}`}
                        alt={rev.user}
                        className="w-8 h-8 rounded-full bg-[#1a1a25] flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{rev.user}</span>
                          <span className="star text-xs">{"★".repeat(rev.rating)}</span>
                          <span className="text-xs text-gray-500">{rev.date}</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{rev.comment}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">まだクチコミがありません。最初の投稿者になりましょう！</p>
                )}
                <button onClick={() => toast("✏️ クチコミ投稿は近日公開予定です", "soon")} className="btn-primary w-full text-sm mt-2">
                  ✏️ クチコミを書く
                </button>
              </div>
            )}
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-16 text-center text-gray-500">
          <div className="text-5xl mb-4">📍</div>
          <p className="text-lg">該当するスポットが見つかりません</p>
        </div>
      )}

      {/* Recent reviews section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">📝 最新クチコミ</h2>
        <div className="space-y-4">
          {reviews.map((rev, i) => {
            const spot = mockSpots.find((s) => s.id === rev.spot);
            return (
              <div key={i} className="card p-5 flex gap-4">
                <img
                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${rev.avatar}&backgroundColor=${rev.bg}`}
                  alt={rev.user}
                  className="w-10 h-10 rounded-full bg-[#1a1a25] flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{rev.user}</span>
                    <span className="star text-xs">{"★".repeat(rev.rating)}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{background: "rgba(255,107,0,0.15)", color: "#ff6b00"}}>
                      {spot?.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{rev.comment}</p>
                  <p className="text-xs text-gray-600 mt-1">{rev.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="card p-6 text-center" style={{background: "linear-gradient(135deg, rgba(255,107,0,0.1) 0%, rgba(204,85,0,0.05) 100%)", borderColor: "rgba(255,107,0,0.3)"}}>
        <h3 className="text-xl font-bold mb-2">お気に入りスポットを共有しよう！</h3>
        <p className="text-gray-400 text-sm mb-4">道の駅・峠・絶景スポットのクチコミを投稿して全国のライダーに紹介しましょう</p>
        <a href="/create" className="btn-primary inline-block">
          📍 スポットを投稿する
        </a>
      </div>
    </div>
  );
}
