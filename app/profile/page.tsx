"use client";

import { useState, useEffect } from "react";
import PostCard from "@/components/PostCard";
import ShareModal from "@/components/ShareModal";
import ProfileEditModal, { loadProfile, ProfileData } from "@/components/ProfileEditModal";
import SettingsModal from "@/components/SettingsModal";
import { currentUser, mockPosts } from "@/lib/mockData";

const tabs = ["投稿", "ルート", "スポット", "いいね済み"];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("投稿");
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => { setProfile(loadProfile()); }, []);

  const userPosts = mockPosts.slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 md:pb-8 pt-6">
      {/* Profile header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-24 h-24 rounded-full border-4 border-[#ff6b00] bg-[#1a1a25]"
            />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-black">{profile?.name ?? "ライダー山田"}</h1>
            </div>
            <p className="text-[#ff6b00] font-medium mb-1">🏍️ {profile?.bike ?? "Honda CB650R"}</p>
            <p className="text-gray-400 text-sm mb-4">{profile?.bio ?? "全国ツーリング中🏍️ | 関東在住 | ソロツーリング大好き"}</p>

            {/* Stats */}
            <div className="flex gap-6 justify-center sm:justify-start mb-4">
              <div className="text-center">
                <div className="text-xl font-black">42</div>
                <div className="text-xs text-gray-500">投稿</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-black">248</div>
                <div className="text-xs text-gray-500">フォロワー</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-black">103</div>
                <div className="text-xs text-gray-500">フォロー中</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 justify-center sm:justify-start flex-wrap">
              <button onClick={() => setShowEdit(true)} className="btn-ghost text-sm">✏️ プロフィール編集</button>
              <button onClick={() => setShowSettings(true)} className="btn-ghost text-sm">⚙️ 設定</button>
              <button
                onClick={() => setShowShare(true)}
                className="text-sm px-3 py-2 rounded-lg border transition-all"
                style={{borderColor: "rgba(255,107,0,0.5)", color: "#ff6b00"}}
              >
                🔗 アプリを共有
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bike garage */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold flex items-center gap-2">
            🏍️ マイガレージ
          </h2>
          <button className="text-sm text-[#ff6b00] hover:underline">＋ 愛車を追加</button>
        </div>
        <div className="flex items-center gap-4 p-4 bg-[#1a1a25] rounded-xl">
          <div className="text-5xl">🏍️</div>
          <div>
            <div className="font-bold text-lg">{currentUser.bike}</div>
            <div className="text-sm text-gray-400">2022年式 | 走行距離: 18,450 km</div>
            <div className="flex gap-2 mt-2">
              <span className="tag bg-orange-500/20 text-orange-400">ネイキッド</span>
              <span className="tag bg-blue-500/20 text-blue-400">ツーリング</span>
            </div>
          </div>
        </div>
      </div>

      {/* Free notice */}
      <div className="card p-4 mb-6 flex items-center gap-4" style={{background: "linear-gradient(135deg, rgba(255,107,0,0.08) 0%, rgba(204,85,0,0.03) 100%)", borderColor: "rgba(255,107,0,0.25)"}}>
        <span className="text-3xl shrink-0">🎉</span>
        <div className="flex-1">
          <div className="font-bold mb-0.5">MotoHub — 現在すべて無料で提供中</div>
          <div className="text-sm text-gray-400">GPS記録・燃費管理・ルート共有・AIイラストなど全機能が無料です。</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={activeTab === tab
              ? { background: "#ff6b00", color: "white", border: "none", padding: "11px 0", borderRadius: "10px", fontWeight: 700, fontSize: "14px", cursor: "pointer", flex: 1, textAlign: "center" }
              : { background: "#13131a", color: "#9ca3af", border: "1px solid #252535", padding: "11px 0", borderRadius: "10px", fontWeight: 600, fontSize: "14px", cursor: "pointer", flex: 1, textAlign: "center" }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "投稿" && (
        <div className="space-y-4">
          {userPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {activeTab === "ルート" && (
        <div className="card p-12 text-center text-gray-500">
          <div className="text-4xl mb-3">🗺️</div>
          <p>まだルートを投稿していません</p>
          <a href="/create" className="btn-primary inline-block mt-4 text-sm">ルートを投稿する</a>
        </div>
      )}

      {activeTab === "スポット" && (
        <div className="card p-12 text-center text-gray-500">
          <div className="text-4xl mb-3">📍</div>
          <p>まだスポットを投稿していません</p>
          <a href="/create" className="btn-primary inline-block mt-4 text-sm">スポットを投稿する</a>
        </div>
      )}

      {activeTab === "いいね済み" && (
        <div className="space-y-4">
          {mockPosts.filter((p) => p.liked).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Quick links to new features */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        {[
          { href: "/riding-log", icon: "📊", label: "走行ログ", desc: "記録・統計" },
          { href: "/garage", icon: "🏍️", label: "マイガレージ", desc: "愛車・メンテ" },
          { href: "/fuel", icon: "⛽", label: "燃費管理", desc: "給油・燃費計算" },
          { href: "/expenses", icon: "💴", label: "費用管理", desc: "コスト分析" },
          { href: "/achievements", icon: "🏆", label: "実績・バッジ", desc: "コレクション" },
          { href: "/riding-log", icon: "📚", label: "ルートライブラリ", desc: "保存ルート" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="card p-5 text-center hover:border-[#ff6b00] transition-all hover:-translate-y-0.5 group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
            <div className="text-sm font-bold mb-1">{item.label}</div>
            <div className="text-xs text-gray-500">{item.desc}</div>
          </a>
        ))}
      </div>

      {/* Activity stats */}
      <div className="card p-6 mt-5">
        <h2 className="font-bold mb-5">📊 アクティビティ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🏍️", label: "走行距離", value: "18,450km" },
            { icon: "🗺️", label: "ルート投稿", value: "8本" },
            { icon: "📍", label: "スポット登録", value: "12箇所" },
            { icon: "❤️", label: "いいね獲得", value: "1,284" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#1a1a25] rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="font-black text-lg" style={{color: "#ff6b00"}}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
      {showEdit && <ProfileEditModal onClose={() => setShowEdit(false)} onSave={(data) => setProfile(data)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
