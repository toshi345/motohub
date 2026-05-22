"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "@/components/Toast";
import { saveDraft, loadDrafts, deleteDraft, formatDraftDate, DraftData } from "@/lib/draft";
import { loadSessions, deleteSession, formatDuration, TrackSession } from "@/lib/gps";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type PostType = "photo" | "route" | "spot";
type IllustStyle = "anime" | "sketch" | "watercolor" | "comic";

const illustStyles: { key: IllustStyle; label: string; desc: string; emoji: string }[] = [
  { key: "anime", label: "アニメ風", desc: "日本アニメ調のイラスト", emoji: "🎌" },
  { key: "sketch", label: "スケッチ", desc: "鉛筆画・線画スタイル", emoji: "✏️" },
  { key: "watercolor", label: "水彩画", desc: "柔らかい水彩テイスト", emoji: "🎨" },
  { key: "comic", label: "コミック", desc: "アメコミ調のポップスタイル", emoji: "💥" },
];

function CreateForm() {
  const searchParams = useSearchParams();
  const fromGPS = searchParams.get("fromGPS") === "1";
  const gpsDistance = searchParams.get("distance") ?? "";
  const gpsDuration = searchParams.get("duration") ?? "";
  const gpsSessionId = searchParams.get("sessionId") ?? "";

  const [postType, setPostType] = useState<PostType>(fromGPS ? "route" : "photo");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState("");

  const [showIllust, setShowIllust] = useState(false);
  const [illustStyle, setIllustStyle] = useState<IllustStyle>("anime");
  const [illustLoading, setIllustLoading] = useState(false);
  const [illustResult, setIllustResult] = useState<string | null>(null);
  const [illustTargetIndex, setIllustTargetIndex] = useState(0);

  const [routeDistance, setRouteDistance] = useState(gpsDistance);
  const [routeDuration, setRouteDuration] = useState(gpsDuration);
  const [routeStart, setRouteStart] = useState("");
  const [routeEnd, setRouteEnd] = useState("");
  const [routeDifficulty, setRouteDifficulty] = useState("medium");

  const [spotCategory, setSpotCategory] = useState("道の駅");
  const [spotAddress, setSpotAddress] = useState("");

  // Draft state
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>();
  const [drafts, setDrafts] = useState<DraftData[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [autoSaveMsg, setAutoSaveMsg] = useState<string | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // GPS sessions
  const [gpsSessions, setGpsSessions] = useState<TrackSession[]>([]);
  const [showGPSSessions, setShowGPSSessions] = useState(false);
  const [linkedSession, setLinkedSession] = useState<TrackSession | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const illustTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load drafts and GPS sessions on mount
  useEffect(() => {
    setDrafts(loadDrafts());
    setGpsSessions(loadSessions());
  }, []);

  // Auto-link GPS session from URL
  useEffect(() => {
    if (!gpsSessionId) return;
    const sessions = loadSessions();
    const found = sessions.find((s) => s.id === gpsSessionId);
    if (found) setLinkedSession(found);
  }, [gpsSessionId]);

  const getDraftPayload = useCallback((): Omit<DraftData, "id" | "savedAt"> => ({
    title, content, tags, postType,
    location, routeDistance, routeDuration,
    routeStart, routeEnd, routeDifficulty,
    spotCategory, spotAddress,
  }), [title, content, tags, postType, location, routeDistance, routeDuration, routeStart, routeEnd, routeDifficulty, spotCategory, spotAddress]);

  // Auto-save trigger (debounced 30s)
  useEffect(() => {
    if (!title && !content) return; // don't auto-save empty
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      const id = saveDraft(getDraftPayload(), currentDraftId);
      setCurrentDraftId(id);
      setDraftSavedAt(new Date().toISOString());
      setAutoSaveMsg("自動保存しました");
      setDrafts(loadDrafts());
      setTimeout(() => setAutoSaveMsg(null), 2500);
    }, 30000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [title, content, tags, postType, location, routeDistance, routeDuration, routeStart, routeEnd, routeDifficulty, spotCategory, spotAddress, currentDraftId, getDraftPayload]);

  const manualSaveDraft = () => {
    const id = saveDraft(getDraftPayload(), currentDraftId);
    setCurrentDraftId(id);
    setDraftSavedAt(new Date().toISOString());
    setAutoSaveMsg("下書きを保存しました ✓");
    setDrafts(loadDrafts());
    setTimeout(() => setAutoSaveMsg(null), 2500);
    toast("💾 下書きを保存しました", "info");
  };

  const loadDraft = (draft: DraftData) => {
    setTitle(draft.title);
    setContent(draft.content);
    setTags(draft.tags);
    setPostType(draft.postType as PostType);
    setLocation(draft.location);
    setRouteDistance(draft.routeDistance);
    setRouteDuration(draft.routeDuration);
    setRouteStart(draft.routeStart);
    setRouteEnd(draft.routeEnd);
    setRouteDifficulty(draft.routeDifficulty);
    setSpotCategory(draft.spotCategory);
    setSpotAddress(draft.spotAddress);
    setCurrentDraftId(draft.id);
    setShowDrafts(false);
  };

  const removeDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteDraft(id);
    setDrafts(loadDrafts());
    if (id === currentDraftId) setCurrentDraftId(undefined);
  };

  const linkGPSSession = (session: TrackSession) => {
    setLinkedSession(session);
    setRouteDistance(session.totalDistanceKm.toFixed(1));
    setRouteDuration(formatDuration(session.stoppedAt! - session.startedAt));
    setPostType("route");
    setShowGPSSessions(false);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const generateIllust = () => {
    if (images.length === 0) return;
    // 毎回リセットしてから生成（再生成対応）
    setIllustResult(null);
    setIllustLoading(true);
    if (illustTimerRef.current) clearTimeout(illustTimerRef.current);
    illustTimerRef.current = setTimeout(() => {
      setIllustResult(images[illustTargetIndex]);
      setIllustLoading(false);
      illustTimerRef.current = null;
    }, 2500);
  };

  const cancelIllust = () => {
    if (illustTimerRef.current) {
      clearTimeout(illustTimerRef.current);
      illustTimerRef.current = null;
    }
    setIllustLoading(false);
    setIllustResult(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentDraftId) deleteDraft(currentDraftId);
    setSubmitted(true);
    setTimeout(() => { window.location.href = "/"; }, 2000);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-16 text-center">
        <div className="text-7xl mb-6 animate-bounce">🏍️</div>
        <h2 className="text-3xl font-black mb-3" style={{color:"#ff6b00"}}>投稿完了！</h2>
        <p className="text-gray-400">全国のライダーに届けました。フィードに戻ります...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-4 pt-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black mb-1">➕ 新規投稿</h1>
          <p className="text-gray-400 text-sm">ツーリング・スポット・愛車フォトを共有しよう</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {/* Auto-save message */}
          {autoSaveMsg && (
            <span className="text-xs text-green-400 font-medium animate-pulse">{autoSaveMsg}</span>
          )}
          {draftSavedAt && !autoSaveMsg && (
            <span className="text-xs text-gray-500">保存済: {formatDraftDate(draftSavedAt)}</span>
          )}
          <div className="flex gap-2">
            {/* Manual save */}
            <button
              type="button"
              onClick={manualSaveDraft}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#252535] text-gray-400 hover:border-[#ff6b00] hover:text-[#ff6b00] transition-colors"
            >
              💾 下書き保存
            </button>
            {/* Load drafts */}
            {drafts.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDrafts(!showDrafts)}
                className="text-xs px-3 py-1.5 rounded-lg border border-[#252535] text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors relative"
              >
                📂 下書き一覧
                <span className="absolute -top-1.5 -right-1.5 bg-[#ff6b00] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {drafts.length}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* GPS from notification banner */}
      {fromGPS && linkedSession && (
        <div className="card p-4 mb-5 flex items-center gap-3" style={{borderColor:"rgba(255,107,0,0.5)", background:"rgba(255,107,0,0.08)"}}>
          <span className="text-2xl">📍</span>
          <div className="flex-1">
            <div className="font-bold text-sm text-[#ff6b00]">GPS記録を取り込み済み</div>
            <div className="text-xs text-gray-400">
              距離: {linkedSession.totalDistanceKm.toFixed(1)}km ·
              時間: {formatDuration(linkedSession.stoppedAt! - linkedSession.startedAt)} ·
              記録ポイント: {linkedSession.points.length}
            </div>
          </div>
          <button onClick={() => setLinkedSession(null)} className="text-gray-500 hover:text-white text-sm">×</button>
        </div>
      )}

      {/* Drafts panel */}
      {showDrafts && drafts.length > 0 && (
        <div className="card p-4 mb-5 space-y-2">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            📂 保存中の下書き
            <span className="text-xs text-gray-500">（クリックで読み込み）</span>
          </h3>
          {drafts.map((draft) => (
            <div
              key={draft.id}
              onClick={() => loadDraft(draft)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-[#1a1a25] ${
                draft.id === currentDraftId ? "border border-[#ff6b00]/50 bg-[#ff6b00]/5" : "border border-transparent"
              }`}
            >
              <div className="text-xl">
                {draft.postType === "route" ? "🗺️" : draft.postType === "spot" ? "📍" : "📸"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {draft.title || <span className="text-gray-500">（タイトルなし）</span>}
                </div>
                <div className="text-xs text-gray-500">{formatDraftDate(draft.savedAt)}</div>
              </div>
              {draft.id === currentDraftId && (
                <span className="text-xs text-[#ff6b00] font-medium">編集中</span>
              )}
              <button
                onClick={(e) => removeDraft(draft.id, e)}
                className="text-gray-600 hover:text-red-400 text-sm transition-colors px-1"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Post type selector */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {([
          { type: "photo" as PostType, icon: "📸", label: "フォト投稿" },
          { type: "route" as PostType, icon: "🗺️", label: "ルート投稿" },
          { type: "spot" as PostType, icon: "📍", label: "スポット投稿" },
        ]).map((t) => (
          <button
            key={t.type}
            onClick={() => setPostType(t.type)}
            className={`card p-4 text-center transition-all ${
              postType === t.type ? "border-[#ff6b00] bg-[#ff6b00]/10" : "hover:border-[#3a3a4a]"
            }`}
          >
            <div className="text-3xl mb-1">{t.icon}</div>
            <div className="text-sm font-medium">{t.label}</div>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1.5">タイトル *</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 秋の志賀草津ルート 絶景ドライブ"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium mb-1.5">内容</label>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="走った感想、道路状況、おすすめポイントなど..."
            style={{resize: "vertical"}}
          />
        </div>

        {/* Photo upload */}
        <div>
          <label className="block text-sm font-medium mb-1.5">📸 写真アップロード</label>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragOver ? "border-[#ff6b00] bg-[#ff6b00]/10" : "border-[#252535] hover:border-[#ff6b00]/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="text-4xl mb-3">📷</div>
            <p className="text-gray-400 text-sm">クリックまたはドラッグ＆ドロップで写真を追加</p>
            <p className="text-gray-600 text-xs mt-1">JPG, PNG, WEBP（最大10枚）</p>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative group cursor-pointer"
                  onClick={() => setIllustTargetIndex(i)}
                  style={{border: showIllust && illustTargetIndex === i ? "2px solid #f97316" : "2px solid transparent", borderRadius: "10px"}}
                >
                  <img src={img} alt="" className="w-full h-24 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImages(images.filter((_, j) => j !== i)); if (illustTargetIndex >= images.length - 1) setIllustTargetIndex(Math.max(0, images.length - 2)); }}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >×</button>
                  {showIllust && illustTargetIndex === i && (
                    <span className="absolute bottom-1 left-1 text-xs font-bold px-1.5 py-0.5 rounded" style={{background:"#f97316", color:"white", fontSize:"10px"}}>AI変換対象</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Illustration */}
        {images.length > 0 && (
          <div className="card p-5" style={{borderColor:"rgba(147,51,234,0.3)", background:"linear-gradient(135deg, rgba(147,51,234,0.08) 0%, rgba(79,70,229,0.04) 100%)"}}>
            {/* Header - 開閉ボタンを大きく明確に */}
            <button
              type="button"
              onClick={() => { setShowIllust(!showIllust); if (showIllust) cancelIllust(); }}
              className="w-full flex items-center justify-between"
            >
              <div className="text-left">
                <h3 className="font-bold flex items-center gap-2">
                  🎨 AIイラスト変換
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background:"rgba(147,51,234,0.2)", color:"#c084fc"}}>
                    プライバシー保護
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">顔・ナンバープレートを隠したいときに便利</p>
              </div>
              {/* 大きくて分かりやすい開閉ボタン */}
              <div style={{
                padding: "8px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 700,
                background: showIllust ? "rgba(147,51,234,0.25)" : "rgba(147,51,234,0.12)",
                color: "#c084fc", border: "1px solid rgba(147,51,234,0.4)",
                display: "flex", alignItems: "center", gap: "6px", flexShrink: 0,
              }}>
                {showIllust ? "▲ 閉じる" : "▼ 開いて変換"}
              </div>
            </button>

            {showIllust && (
              <div className="space-y-4 mt-4">
                {/* スタイル選択 */}
                <div className="grid grid-cols-2 gap-2">
                  {illustStyles.map((s) => (
                    <button key={s.key} type="button"
                      onClick={() => { setIllustStyle(s.key); }}
                      className={`p-3 rounded-lg text-left border transition-all ${
                        illustStyle === s.key ? "border-purple-500 bg-purple-500/20" : "border-[#252535] hover:border-purple-500/50"
                      }`}>
                      <span className="text-xl">{s.emoji}</span>
                      <div className="text-sm font-medium mt-1">{s.label}</div>
                      <div className="text-xs text-gray-500">{s.desc}</div>
                    </button>
                  ))}
                </div>

                {/* 生成・取消ボタン */}
                <div className="flex gap-2">
                  <button type="button" onClick={generateIllust} disabled={illustLoading}
                    className="flex-1 py-3 rounded-lg font-bold transition-all text-white"
                    style={{background: illustLoading ? "#4a4a5a" : "linear-gradient(135deg, #7c3aed, #4f46e5)", opacity: illustLoading ? 0.7 : 1}}>
                    {illustLoading
                      ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">⚙️</span> AI生成中...</span>
                      : illustResult ? "🔄 再生成する" : "🎨 AIイラストを生成する"}
                  </button>
                  {/* 取消・生成中止ボタン */}
                  {(illustLoading || illustResult) && (
                    <button type="button" onClick={cancelIllust}
                      className="px-4 py-3 rounded-lg font-bold text-sm transition-all"
                      style={{background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171"}}>
                      {illustLoading ? "⏹ 中止" : "🗑 削除"}
                    </button>
                  )}
                </div>

                {/* 生成結果 */}
                {illustResult && !illustLoading && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-green-400 font-bold">✅ 生成完了！</p>
                      <span className="text-xs text-gray-500">（{illustStyles.find(s=>s.key===illustStyle)?.label}）</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">元の写真</p>
                        <img src={images[illustTargetIndex]} alt="original" className="w-full h-32 object-cover rounded-lg" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">AIイラスト</p>
                        <img src={illustResult} alt="illust" className="w-full h-32 object-cover rounded-lg" style={{filter:
                          illustStyle === "anime" ? "saturate(2.2) contrast(1.3) hue-rotate(15deg) brightness(1.05)" :
                          illustStyle === "sketch" ? "grayscale(1) contrast(1.8) brightness(1.15) blur(0.3px)" :
                          illustStyle === "watercolor" ? "saturate(1.4) brightness(1.1) hue-rotate(-15deg) blur(0.6px) contrast(0.9)" :
                          "saturate(2.8) contrast(1.6) brightness(0.95) hue-rotate(5deg)"
                        }} />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg" style={{background:"rgba(147,51,234,0.1)"}}>
                      <input type="checkbox" className="w-auto" defaultChecked />
                      <span className="text-sm">イラスト版で投稿する（元写真は非公開）</span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Route fields */}
        {postType === "route" && (
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">🗺️ ルート情報</h3>
              {/* Link GPS session */}
              <button
                type="button"
                onClick={() => { setGpsSessions(loadSessions()); setShowGPSSessions(!showGPSSessions); }}
                className="text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1"
                style={linkedSession ? {borderColor:"rgba(255,107,0,0.5)", color:"#ff6b00", background:"rgba(255,107,0,0.08)"} : {borderColor:"#252535", color:"#9ca3af"}}
              >
                📍 {linkedSession ? "GPS連携中 ✓" : "GPS記録を読み込む"}
              </button>
            </div>

            {/* GPS sessions picker */}
            {showGPSSessions && (
              <div className="bg-[#0f0f18] rounded-xl p-3 space-y-2 border border-[#252535]">
                {gpsSessions.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-3">
                    GPS記録がありません。<br />画面右下の🛣️ボタンで記録を開始してください。
                  </p>
                ) : (
                  gpsSessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => linkGPSSession(s)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-[#1a1a25] transition-colors border ${
                        linkedSession?.id === s.id ? "border-[#ff6b00]/50" : "border-transparent"
                      }`}
                    >
                      <span className="text-xl">📍</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{s.totalDistanceKm.toFixed(1)} km</div>
                        <div className="text-xs text-gray-500">
                          {formatDuration((s.stoppedAt ?? Date.now()) - s.startedAt)} ·
                          最高 {Math.round(s.maxSpeedKmh)} km/h ·
                          {new Date(s.startedAt).toLocaleDateString("ja-JP")}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSession(s.id); setGpsSessions(loadSessions()); }}
                        className="text-gray-600 hover:text-red-400 text-sm"
                      >🗑</button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Linked session summary */}
            {linkedSession && (
              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-[#1a1a25] rounded-lg p-3">
                <div>
                  <div className="font-black text-sm" style={{color:"#ff6b00"}}>{linkedSession.totalDistanceKm.toFixed(1)} km</div>
                  <div className="text-gray-500">GPS実績距離</div>
                </div>
                <div>
                  <div className="font-black text-sm" style={{color:"#ff6b00"}}>{Math.round(linkedSession.maxSpeedKmh)} km/h</div>
                  <div className="text-gray-500">最高速度</div>
                </div>
                <div>
                  <div className="font-black text-sm" style={{color:"#ff6b00"}}>{linkedSession.points.length}</div>
                  <div className="text-gray-500">記録ポイント</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">出発地</label>
                <input value={routeStart} onChange={(e) => setRouteStart(e.target.value)} placeholder="例: 大阪市" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">目的地</label>
                <input value={routeEnd} onChange={(e) => setRouteEnd(e.target.value)} placeholder="例: 草津温泉" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">総距離 (km)</label>
                <input type="number" value={routeDistance} onChange={(e) => setRouteDistance(e.target.value)} placeholder="例: 450" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">所要時間・日数</label>
                <input value={routeDuration} onChange={(e) => setRouteDuration(e.target.value)} placeholder="例: 2日間" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">難易度</label>
              <select value={routeDifficulty} onChange={(e) => setRouteDifficulty(e.target.value)}>
                <option value="easy">初級（初心者OK）</option>
                <option value="medium">中級（ある程度の経験者向け）</option>
                <option value="hard">上級（山岳路・長距離）</option>
              </select>
            </div>
          </div>
        )}

        {/* Spot fields */}
        {postType === "spot" && (
          <div className="card p-5 space-y-4">
            <h3 className="font-bold">📍 スポット情報</h3>
            <div>
              <label className="block text-sm font-medium mb-1">カテゴリ</label>
              <select value={spotCategory} onChange={(e) => setSpotCategory(e.target.value)}>
                <option>道の駅</option>
                <option>峠</option>
                <option>絶景</option>
                <option>グルメ</option>
                <option>温泉</option>
                <option>その他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">住所</label>
              <input value={spotAddress} onChange={(e) => setSpotAddress(e.target.value)} placeholder="例: 神奈川県足柄下郡箱根町..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">評価</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} type="button" className="text-2xl star hover:scale-110 transition-transform">★</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-1.5">📍 場所（任意）</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="例: 神奈川県 箱根町" />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-1.5">🏷️ タグ（スペース区切り）</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="例: 箱根 ツーリング 絶景 MT-09" />
          {tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.split(/\s+/).filter(Boolean).map((tag) => (
                <span key={tag} className="tag bg-[#1a1a25] text-gray-400 border border-[#252535]">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Submit - ボトムナビとの重なり防止で余白を十分に取る */}
        <div className="flex gap-3 pt-2 pb-4">
          <button type="button" onClick={manualSaveDraft} className="btn-ghost px-4 py-3 text-sm">
            💾 下書き
          </button>
          <button type="button" onClick={() => window.history.back()} className="btn-ghost flex-1 text-sm">
            戻る
          </button>
          <button type="submit" className="btn-primary flex-1 py-3">
            🏍️ 投稿する
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 pt-16 text-center text-gray-400">読み込み中...</div>}>
      <CreateForm />
    </Suspense>
  );
}
