"use client";

import { useState } from "react";
import { Post } from "@/lib/types";
import { toast } from "@/components/Toast";
import { HeartIcon, CommentIcon, ShareIcon } from "@/components/Icons";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}分前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}時間前`;
  return `${Math.floor(hours / 24)}日前`;
}

function categoryColor(type: string) {
  if (type === "route") return "bg-blue-500/20 text-blue-400";
  if (type === "spot") return "bg-green-500/20 text-green-400";
  return "bg-orange-500/20 text-orange-400";
}

function categoryLabel(type: string) {
  if (type === "route") return "🗺️ ルート";
  if (type === "spot") return "📍 スポット";
  return "📸 フォト";
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="star">
      {"★".repeat(Math.floor(rating))}
      {"☆".repeat(5 - Math.floor(rating))}
    </span>
  );
}

export default function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.liked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <article className="card overflow-hidden hover:border-[#3a3a4a] transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 pb-4">
        <img
          src={post.author.avatar}
          alt={post.author.name}
          className="w-10 h-10 rounded-full bg-[#1a1a25]"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{post.author.name}</span>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <span>🏍️ {post.author.bike}</span>
            {post.location && <span>· 📍 {post.location}</span>}
            <span>· {timeAgo(post.createdAt)}</span>
          </div>
        </div>
        <span className={`tag ${categoryColor(post.type)}`}>{categoryLabel(post.type)}</span>
      </div>

      {/* Image */}
      {post.images[0] && (
        <div className="relative">
          <img
            src={post.images[0]}
            alt={post.title}
            className={`w-full h-64 object-cover ${post.isIllustration ? "filter saturate-150 contrast-110" : ""}`}
          />
          {post.isIllustration && (
            <div className="absolute top-2 right-2 bg-purple-600/90 text-white text-xs px-2 py-1 rounded-full font-medium">
              🎨 AI イラスト
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-4">
        <h3 className="font-bold text-base">{post.title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{post.content}</p>

        {/* Route info */}
        {post.routeData && (
          <div className="grid grid-cols-3 gap-3 bg-[#1a1a25] rounded-lg p-4 text-center">
            <div>
              <div className="text-[#ff6b00] font-bold">{post.routeData.distance}km</div>
              <div className="text-xs text-gray-500">総距離</div>
            </div>
            <div>
              <div className="text-[#ff6b00] font-bold">{post.routeData.duration}</div>
              <div className="text-xs text-gray-500">所要時間</div>
            </div>
            <div>
              <div className="text-[#ff6b00] font-bold capitalize">
                {post.routeData.difficulty === "easy" ? "初級" : post.routeData.difficulty === "medium" ? "中級" : "上級"}
              </div>
              <div className="text-xs text-gray-500">難易度</div>
            </div>
          </div>
        )}

        {/* Spot info */}
        {post.spotData && (
          <div className="flex items-center gap-3 bg-[#1a1a25] rounded-lg p-3">
            <span className="text-2xl">
              {post.spotData.category === "道の駅" ? "🏪" : post.spotData.category === "峠" ? "⛰️" : post.spotData.category === "温泉" ? "♨️" : "📍"}
            </span>
            <div>
              <div className="flex items-center gap-1">
                <Stars rating={post.spotData.rating} />
                <span className="text-sm font-bold text-yellow-400">{post.spotData.rating}</span>
                <span className="text-xs text-gray-500">({post.spotData.reviewCount}件)</span>
              </div>
              <div className="text-xs text-gray-500">{post.spotData.address}</div>
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="tag bg-[#1a1a25] text-gray-400 border border-[#252535]">
              #{tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5 pt-3 mt-1 border-t border-[#252535]">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-2 text-sm transition-colors py-1 ${liked ? "text-red-400" : "text-gray-500 hover:text-red-400"}`}
          >
            <HeartIcon size={18} color={liked ? "#f87171" : "currentColor"} filled={liked} />
            <span>{likeCount}</span>
          </button>
          <button onClick={() => toast("💬 コメント機能は近日公開予定です", "soon")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-400 transition-colors py-1">
            <CommentIcon size={18} color="currentColor" />
            <span>{post.comments}</span>
          </button>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(`https://motohub-psi.vercel.app`);
              toast("🔗 URLをコピーしました");
            }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-400 transition-colors py-1">
            <ShareIcon size={18} color="currentColor" />
            <span>共有</span>
          </button>
          <div className="flex-1" />
          <button
            onClick={() => toast("メニュー機能は近日公開予定です", "soon")}
            className="text-gray-500 hover:text-gray-300 transition-colors px-2 py-1"
            style={{ fontSize: "20px", letterSpacing: "2px" }}>
            ···
          </button>
        </div>
      </div>
    </article>
  );
}
