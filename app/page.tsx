"use client";

import { useState } from "react";
import PostCard from "@/components/PostCard";
import { mockPosts } from "@/lib/mockData";
import { Post } from "@/lib/types";
import { toast } from "@/components/Toast";
import { BikeIcon, CameraIcon, MapIcon, PinIcon, FlameIcon } from "@/components/Icons";

const filters = ["すべて", "フォト", "ルート", "スポット"];

const stats = [
  { label: "ライダー", value: "12,483", Icon: BikeIcon },
  { label: "投稿数",   value: "38,291", Icon: CameraIcon },
  { label: "ルート",   value: "4,128",  Icon: MapIcon },
  { label: "スポット", value: "9,204",  Icon: PinIcon },
];

const trendingTags = ["#秋ツーリング", "#北海道", "#箱根", "#阿蘇", "#道の駅", "#絶景", "#峠", "#日帰り"];

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState("すべて");
  const [posts] = useState<Post[]>(mockPosts);

  const filtered = posts.filter((p) => {
    if (activeFilter === "すべて") return true;
    if (activeFilter === "フォト") return p.type === "photo";
    if (activeFilter === "ルート") return p.type === "route";
    if (activeFilter === "スポット") return p.type === "spot";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 pb-4">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8 mt-6"
        style={{
          background: "linear-gradient(135deg, #120600 0%, #0a0814 50%, #080810 100%)",
          border: "1px solid rgba(255,107,0,0.2)",
          boxShadow: "0 0 60px rgba(255,107,0,0.05) inset",
        }}>
        {/* Decorative lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px" style={{background: "linear-gradient(90deg, transparent, rgba(255,107,0,0.4), transparent)"}} />
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full" style={{background: "radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)"}} />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full" style={{background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)"}} />
        </div>
        <div className="relative p-8 md:p-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-5"
            style={{background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.3)", color: "#ff8c38"}}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] pulse-primary" />
            全国12,483人のライダーが参加中
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tight">
            <span style={{
              background: "linear-gradient(135deg, #ff6b00 0%, #ff8c38 60%, #ffb347 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "#ff6b00",
              display: "inline-block",
            }}>バイク乗り</span>
            <br />
            <span style={{color: "#ffffff"}}>のためのアプリ</span>
          </h1>
          <p className="text-base md:text-lg max-w-lg" style={{color: "#a0a0c0"}}>
            走行記録・燃費管理・メンテナンス。
            <br className="hidden md:block" />
            ルート共有・スポットクチコミ。すべてここで。
          </p>
        </div>
        {/* Big bike icon */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-9xl md:text-[10rem] select-none pointer-events-none"
          style={{opacity: 0.06, filter: "blur(1px)"}}>🏍️</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className="flex justify-center mb-2">
              <s.Icon size={24} color="#ff6b00" />
            </div>
            <div className="text-xl font-black" style={{color: "#ff6b00"}}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={activeFilter === f
                  ? { background: "#ff6b00", color: "white", padding: "10px 0", borderRadius: "10px", fontWeight: 700, fontSize: "13px", border: "none", cursor: "pointer", flex: 1, whiteSpace: "nowrap", overflow: "hidden" }
                  : { background: "#13131a", color: "#9ca3af", padding: "10px 0", borderRadius: "10px", fontWeight: 600, fontSize: "13px", border: "1px solid #252535", cursor: "pointer", flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Posts */}
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {filtered.length === 0 && (
            <div className="card p-12 text-center text-gray-500">
              <div className="text-4xl mb-3">🏍️</div>
              <p>まだ投稿がありません</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Trending tags */}
          <div className="card p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FlameIcon size={18} color="#ff6b00" /> トレンドタグ
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toast(`${tag} の検索機能は近日公開予定です`, "soon")}
                  className="text-sm px-2 py-1 rounded transition-colors hover:opacity-80"
                  style={{color: "#ff6b00"}}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Free CTA */}
          <div className="card p-5" style={{background: "linear-gradient(135deg, rgba(255,107,0,0.1) 0%, rgba(204,85,0,0.05) 100%)", borderColor: "rgba(255,107,0,0.3)"}}>
            <div className="text-2xl mb-2">🎉</div>
            <h3 className="font-bold mb-1">MotoHub — 完全無料</h3>
            <p className="text-sm text-gray-400 mb-4">
              全機能が無料で使えます。GPS記録・燃費管理・ルート共有など。
            </p>
            <div className="text-xl font-black mb-3" style={{color: "#ff6b00"}}>
              すべて無料
              <span className="text-sm font-normal text-gray-400 ml-1">で使えます</span>
            </div>
            <a href="/riding-log" className="btn-primary w-full text-sm text-center block">
              さっそく使ってみる
            </a>
          </div>

          {/* Popular riders */}
          <div className="card p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <BikeIcon size={18} color="#ff6b00" /> 人気ライダー
            </h3>
            <div className="space-y-4">
              {[
                { name: "旅人田中", bike: "BMW R1250GS", seed: "Tanaka", bg: "d1f4e0", followers: "2.1k" },
                { name: "峠マスター鈴木", bike: "Yamaha MT-09", seed: "Suzuki", bg: "ffdfbf", followers: "1.2k" },
                { name: "ツーリング佐藤", bike: "Kawasaki Z900RS", seed: "Sato", bg: "c0aede", followers: "892" },
              ].map((u) => (
                <div key={u.name} className="flex items-center gap-3">
                  <img
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${u.seed}&backgroundColor=${u.bg}`}
                    alt={u.name}
                    className="w-10 h-10 rounded-full bg-[#1a1a25]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{u.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{u.bike}</div>
                  </div>
                  <div className="text-xs text-gray-500">{u.followers}</div>
                  <button
                    onClick={() => toast("👤 フォロー機能は近日公開予定です", "soon")}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors border"
                    style={{color: "#ff6b00", borderColor: "rgba(255,107,0,0.5)"}}>
                    フォロー
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
