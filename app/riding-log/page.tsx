"use client";

import { useState, useEffect } from "react";
import { loadSessions, deleteSession, formatDuration, TrackSession } from "@/lib/gps";
import { calcStats } from "@/lib/achievements";
import { loadRouteLibrary, saveToLibrary, deleteFromLibrary, updateRouteInLibrary, SavedRoute } from "@/lib/routeLibrary";
import { RulerIcon, BikeIcon, ClockIcon, SpeedIcon, MapIcon, PinIcon, FlameIcon } from "@/components/Icons";

type MainTab = "log" | "library";
type LogFilter = "all" | "week" | "month" | "year";

const STAT_ICONS: Record<string, React.ComponentType<{size?: number; color?: string}>> = {
  "📏": RulerIcon, "🏍️": BikeIcon, "⏱️": ClockIcon, "⚡": SpeedIcon,
  "🛣️": MapIcon, "📍": PinIcon, "🔥": FlameIcon,
};

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  const IconComp = STAT_ICONS[icon];
  return (
    <div className="card p-4 text-center">
      <div className="flex justify-center mb-2">
        {IconComp ? <IconComp size={22} color="#ff6b00" /> : <span className="text-2xl">{icon}</span>}
      </div>
      <div className="text-xl font-black" style={{ color: "#ff6b00" }}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
    </div>
  );
}

function BarChart({ sessions }: { sessions: TrackSession[] }) {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { label: `${d.getMonth() + 1}月`, year: d.getFullYear(), month: d.getMonth() };
  });
  const data = months.map(({ label, year, month }) => {
    const km = sessions
      .filter((s) => {
        const d = new Date(s.startedAt);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((acc, s) => acc + s.totalDistanceKm, 0);
    return { label, km };
  });
  const max = Math.max(...data.map((d) => d.km), 1);
  return (
    <div className="flex items-end gap-2 h-28 px-1">
      {data.map(({ label, km }) => (
        <div key={label} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs text-[#ff6b00]">{km > 0 ? `${km.toFixed(0)}` : ""}</span>
          <div
            className="w-full rounded-t-md transition-all"
            style={{
              height: `${Math.max((km / max) * 80, km > 0 ? 6 : 2)}px`,
              background: km > 0 ? "linear-gradient(to top, #cc5500, #ff6b00)" : "#252535",
            }}
          />
          <span className="text-xs text-gray-500">{label}</span>
        </div>
      ))}
    </div>
  );
}

function SessionRow({
  session,
  onDelete,
  onSave,
  isSaved,
}: {
  session: TrackSession;
  onDelete: (id: string) => void;
  onSave: (session: TrackSession) => void;
  isSaved: boolean;
}) {
  const dur = session.stoppedAt
    ? formatDuration(session.stoppedAt - session.startedAt)
    : "--";
  const date = new Date(session.startedAt);
  const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  return (
    <div className="card p-5 flex items-center gap-4 hover:border-[#3a3a4a] transition-colors">
      <div className="text-4xl shrink-0">🏍️</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold mb-2">{dateStr}</div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          <span>📏 {session.totalDistanceKm.toFixed(1)} km</span>
          <span>⏱️ {dur}</span>
          <span>⚡ {Math.round(session.maxSpeedKmh)} km/h</span>
          <span>📍 {session.points.length} pt</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-end shrink-0">
        <button
          onClick={() => onSave(session)}
          disabled={isSaved}
          className="text-xs px-3 py-2 rounded-lg border transition-all"
          style={isSaved
            ? { borderColor: "rgba(255,107,0,0.4)", color: "#ff6b00", background: "rgba(255,107,0,0.08)" }
            : { borderColor: "#252535", color: "#9ca3af" }}
        >
          {isSaved ? "📚 保存済" : "📚 ライブラリへ"}
        </button>
        <button
          onClick={() => { if (confirm("この記録を削除しますか？")) onDelete(session.id); }}
          className="text-xs text-gray-600 hover:text-red-400 transition-colors py-1"
        >
          🗑 削除
        </button>
      </div>
    </div>
  );
}

function SaveRouteModal({
  session,
  onClose,
  onSaved,
}: {
  session: TrackSession;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const handleSave = () => {
    saveToLibrary({
      name: name || `${new Date(session.startedAt).toLocaleDateString("ja-JP")} のツーリング`,
      description,
      tags: tags.split(/\s+/).filter(Boolean),
      session,
      isPublic,
    });
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="card w-full max-w-md p-6 space-y-4">
        <h3 className="font-bold text-lg">📚 ルートライブラリに保存</h3>
        <div>
          <label className="block text-sm font-medium mb-1">ルート名</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 箱根ターンパイク快走ルート" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">メモ</label>
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="道路状況、おすすめポイントなど..." style={{ resize: "none" }} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">タグ（スペース区切り）</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="例: 箱根 快走 日帰り" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-auto" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          <span className="text-sm">コミュニティに公開する（投稿ページから共有できます）</span>
        </label>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="btn-ghost flex-1">キャンセル</button>
          <button onClick={handleSave} className="btn-primary flex-1">保存する</button>
        </div>
      </div>
    </div>
  );
}

function RouteLibraryCard({ route, onDelete, onEdit }: { route: SavedRoute; onDelete: (id: string) => void; onEdit: (route: SavedRoute) => void }) {
  const dur = route.session.stoppedAt
    ? formatDuration(route.session.stoppedAt - route.session.startedAt)
    : "--";
  const d = new Date(route.savedAt);
  return (
    <div className="card p-5 space-y-4 hover:border-[#3a3a4a] transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold">{route.name}</h3>
        {route.isPublic && (
          <span className="tag bg-blue-500/20 text-blue-400 shrink-0">公開中</span>
        )}
      </div>
      {route.description && <p className="text-sm text-gray-400">{route.description}</p>}
      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
        <span>📏 {route.session.totalDistanceKm.toFixed(1)} km</span>
        <span>⏱️ {dur}</span>
        <span>⚡ {Math.round(route.session.maxSpeedKmh)} km/h</span>
        <span>📅 {d.getMonth() + 1}/{d.getDate()}</span>
      </div>
      {route.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {route.tags.map((t) => (
            <span key={t} className="tag bg-[#1a1a25] text-gray-400 border border-[#252535]">#{t}</span>
          ))}
        </div>
      )}
      <div className="flex gap-2 pt-3 border-t border-[#252535]">
        <a
          href={`/create?fromGPS=1&distance=${route.session.totalDistanceKm.toFixed(1)}&duration=${dur}&sessionId=${route.session.id}`}
          className="btn-primary flex-1 text-center text-sm py-2.5"
        >
          🗺️ 投稿する
        </a>
        <button onClick={() => onEdit(route)} className="btn-ghost text-sm px-4 py-2.5">✏️ 編集</button>
        <button
          onClick={() => { if (confirm("このルートを削除しますか？")) onDelete(route.id); }}
          className="text-sm text-gray-600 hover:text-red-400 px-3 transition-colors"
        >
          🗑
        </button>
      </div>
    </div>
  );
}

export default function RidingLogPage() {
  const [mainTab, setMainTab] = useState<MainTab>("log");
  const [logFilter, setLogFilter] = useState<LogFilter>("all");
  const [sessions, setSessions] = useState<TrackSession[]>([]);
  const [library, setLibrary] = useState<SavedRoute[]>([]);
  const [saveModal, setSaveModal] = useState<TrackSession | null>(null);
  const [editModal, setEditModal] = useState<SavedRoute | null>(null);

  const refresh = () => {
    setSessions(loadSessions());
    setLibrary(loadRouteLibrary());
  };
  useEffect(refresh, []);

  const stats = calcStats(sessions);

  const filterFn = (s: TrackSession) => {
    const d = new Date(s.startedAt);
    const now = new Date();
    if (logFilter === "week") {
      const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    }
    if (logFilter === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (logFilter === "year") return d.getFullYear() === now.getFullYear();
    return true;
  };

  const filteredSessions = sessions.filter(filterFn).sort((a, b) => b.startedAt - a.startedAt);
  const savedIds = new Set(library.map((r) => r.session.id));

  const avgDist = stats.totalRides > 0 ? (stats.totalDistanceKm / stats.totalRides).toFixed(1) : "0";
  const totalHours = Math.floor(stats.totalDurationMs / 3600000);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-4 pt-6">
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-1">📊 ライディングログ</h1>
        <p className="text-gray-400 text-sm">走行記録・ルートライブラリを管理</p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <StatCard icon="📏" label="累計走行距離" value={`${stats.totalDistanceKm.toFixed(0)} km`} />
        <StatCard icon="🏍️" label="走行回数" value={`${stats.totalRides} 回`} />
        <StatCard icon="⏱️" label="総走行時間" value={`${totalHours} h`} />
        <StatCard icon="⚡" label="最高速度" value={`${Math.round(stats.maxSpeedKmh)} km/h`} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard icon="🛣️" label="最長ツーリング" value={`${stats.maxSingleDistanceKm.toFixed(0)} km`} />
        <StatCard icon="📍" label="平均走行距離" value={`${avgDist} km`} sub="/ 1回" />
        <StatCard icon="🔥" label="最長連続日数" value={`${stats.longestStreakDays} 日`} sub="連続ライド" />
      </div>

      {/* Monthly bar chart */}
      {sessions.length > 0 && (
        <div className="card p-6 mb-8">
          <h3 className="font-bold mb-5">📈 月別走行距離（直近6ヶ月）</h3>
          <BarChart sessions={sessions} />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", marginTop: "8px" }}>
        {([
          { key: "log", label: "🗒️ 走行ログ" },
          { key: "library", label: "📚 ルートライブラリ" },
        ] as { key: MainTab; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setMainTab(t.key)}
            style={mainTab === t.key
              ? { background: "#ff6b00", color: "white", padding: "12px 0", borderRadius: "10px", fontWeight: 700, fontSize: "14px", border: "none", cursor: "pointer", flex: 1, textAlign: "center" }
              : { background: "#13131a", color: "#9ca3af", padding: "12px 0", borderRadius: "10px", fontWeight: 600, fontSize: "14px", border: "1px solid #252535", cursor: "pointer", flex: 1, textAlign: "center" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* LOG TAB */}
      {mainTab === "log" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Filter */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
            {(["all", "week", "month", "year"] as LogFilter[]).map((f) => {
              const label = f === "all" ? "すべて" : f === "week" ? "今週" : f === "month" ? "今月" : "今年";
              return (
                <button
                  key={f}
                  onClick={() => setLogFilter(f)}
                  style={logFilter === f
                    ? { background: "#ff6b00", color: "white", padding: "10px 0", borderRadius: "10px", fontWeight: 700, fontSize: "13px", border: "none", cursor: "pointer", flex: 1, textAlign: "center", whiteSpace: "nowrap" }
                    : { background: "#13131a", color: "#9ca3af", padding: "10px 0", borderRadius: "10px", fontWeight: 600, fontSize: "13px", border: "1px solid #252535", cursor: "pointer", flex: 1, textAlign: "center", whiteSpace: "nowrap" }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {filteredSessions.length === 0 ? (
            <div className="card p-12 text-center text-gray-500">
              <div className="text-5xl mb-4">🏍️</div>
              <p className="text-lg font-medium mb-1">走行記録がありません</p>
              <p className="text-sm">画面右下の 🛣️ ボタンで走行記録を開始しましょう</p>
            </div>
          ) : (
            filteredSessions.map((s) => (
              <SessionRow
                key={s.id}
                session={s}
                onDelete={(id) => { deleteSession(id); refresh(); }}
                onSave={(session) => setSaveModal(session)}
                isSaved={savedIds.has(s.id)}
              />
            ))
          )}
        </div>
      )}

      {/* LIBRARY TAB */}
      {mainTab === "library" && (
        <div className="space-y-4">
          {library.length === 0 ? (
            <div className="card p-12 text-center text-gray-500">
              <div className="text-5xl mb-4">📚</div>
              <p className="text-lg font-medium mb-1">ルートライブラリが空です</p>
              <p className="text-sm">走行ログから「📚 ライブラリへ」で保存できます</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {library.map((route) => (
                <RouteLibraryCard
                  key={route.id}
                  route={route}
                  onDelete={(id) => { deleteFromLibrary(id); refresh(); }}
                  onEdit={(r) => setEditModal(r)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Save to library modal */}
      {saveModal && (
        <SaveRouteModal
          session={saveModal}
          onClose={() => setSaveModal(null)}
          onSaved={refresh}
        />
      )}

      {/* Edit library route modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="card w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-lg">✏️ ルートを編集</h3>
            <div>
              <label className="block text-sm font-medium mb-1">ルート名</label>
              <input
                value={editModal.name}
                onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">メモ</label>
              <textarea
                rows={2}
                value={editModal.description}
                onChange={(e) => setEditModal({ ...editModal, description: e.target.value })}
                style={{ resize: "none" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">タグ</label>
              <input
                value={editModal.tags.join(" ")}
                onChange={(e) => setEditModal({ ...editModal, tags: e.target.value.split(/\s+/).filter(Boolean) })}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-auto"
                checked={editModal.isPublic}
                onChange={(e) => setEditModal({ ...editModal, isPublic: e.target.checked })}
              />
              <span className="text-sm">コミュニティに公開する</span>
            </label>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setEditModal(null)} className="btn-ghost flex-1">キャンセル</button>
              <button
                onClick={() => { updateRouteInLibrary(editModal.id, editModal); refresh(); setEditModal(null); }}
                className="btn-primary flex-1"
              >
                更新する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
