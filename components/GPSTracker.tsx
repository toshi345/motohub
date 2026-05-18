"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  TrackPoint,
  TrackSession,
  calcTotalDistance,
  formatDuration,
  saveSession,
  setActiveSession,
  getActiveSession,
  haversineKm,
} from "@/lib/gps";
import { saveToLibrary } from "@/lib/routeLibrary";

type Mode = "manual" | "auto";
type Status = "idle" | "recording" | "paused" | "done";

const AUTO_SPEED_THRESHOLD_KMH = 5; // start auto-recording above this speed
const MIN_DISTANCE_M = 10; // ignore GPS jitter < 10m

export default function GPSTracker() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [mode, setMode] = useState<Mode>("manual");
  const [session, setSession] = useState<TrackSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState<number | null>(null);
  const [currentDist, setCurrentDist] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [completedSession, setCompletedSession] = useState<TrackSession | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionRef = useRef<TrackSession | null>(null);
  const startTimeRef = useRef<number>(0);
  const autoStartedRef = useRef(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // Wake Lock: 画面オフを防いでGPSが止まらないようにする
  const requestWakeLock = async () => {
    if (!("wakeLock" in navigator)) return;
    try {
      wakeLockRef.current = await (navigator as Navigator & { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request("screen");
      setWakeLockActive(true);
      // 画面が一時的にオフになった後に復帰したら再取得
      wakeLockRef.current.addEventListener("release", () => {
        setWakeLockActive(false);
      });
    } catch {
      // Wake Lock非対応でも記録は続ける
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setWakeLockActive(false);
    }
  };

  // 画面が表示状態に戻ったとき（例：通知確認後）に Wake Lock を再取得
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && (status === "recording") && !wakeLockRef.current) {
        await requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [status]);

  // Keep sessionRef in sync
  useEffect(() => { sessionRef.current = session; }, [session]);

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const startTimer = (baseElapsed = 0) => {
    clearTimer();
    const startAt = Date.now() - baseElapsed;
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - startAt);
    }, 1000);
  };

  const stopWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const handlePosition = useCallback((pos: GeolocationPosition) => {
    const { latitude: lat, longitude: lng, speed, altitude, accuracy } = pos.coords;
    setGpsAccuracy(Math.round(accuracy));

    const speedKmh = speed != null ? speed * 3.6 : null;
    setCurrentSpeed(speedKmh != null ? Math.round(speedKmh) : null);

    // Auto mode: start recording when moving
    if (mode === "auto" && !autoStartedRef.current && speedKmh != null && speedKmh >= AUTO_SPEED_THRESHOLD_KMH) {
      autoStartedRef.current = true;
      startActualRecording(lat, lng, speed, altitude);
      return;
    }

    if (!sessionRef.current || sessionRef.current.stoppedAt) return;

    const newPoint: TrackPoint = {
      lat, lng,
      timestamp: Date.now(),
      speed: speed ?? null,
      altitude: altitude ?? null,
    };

    setSession((prev) => {
      if (!prev) return prev;
      const pts = prev.points;
      // Filter GPS jitter
      if (pts.length > 0) {
        const last = pts[pts.length - 1];
        const distM = haversineKm(last.lat, last.lng, lat, lng) * 1000;
        if (distM < MIN_DISTANCE_M) return prev;
      }
      const newPts = [...pts, newPoint];
      const dist = calcTotalDistance(newPts);
      const spd = speed != null ? speed * 3.6 : 0;
      const updated = {
        ...prev,
        points: newPts,
        totalDistanceKm: dist,
        maxSpeedKmh: Math.max(prev.maxSpeedKmh, spd),
      };
      setActiveSession(updated);
      setCurrentDist(dist);
      return updated;
    });
  }, [mode]);

  const startActualRecording = (lat?: number, lng?: number, speed?: number | null, altitude?: number | null) => {
    startTimeRef.current = Date.now();
    const newSession: TrackSession = {
      id: `track_${Date.now()}`,
      startedAt: Date.now(),
      points: lat != null ? [{ lat, lng: lng!, timestamp: Date.now(), speed: speed ?? null, altitude: altitude ?? null }] : [],
      totalDistanceKm: 0,
      maxSpeedKmh: 0,
    };
    setSession(newSession);
    sessionRef.current = newSession;
    setActiveSession(newSession);
    setCurrentDist(0);
    setStatus("recording");
    startTimer(0);
    requestWakeLock(); // 画面オフを防ぐ
  };

  const startRecording = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError("このブラウザはGPSに対応していません");
      return;
    }

    if (mode === "manual") {
      startActualRecording();
    } else {
      // Auto mode: GPS監視を開始し、走行検知で記録を開始する
      autoStartedRef.current = false;
      setStatus("recording");
      startTimer(0);
      requestWakeLock(); // 自動モードでも即座に画面オフを防止
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      (err) => {
        if (err.code === 1) setError("GPS許可が必要です。ブラウザの設定を確認してください");
        else if (err.code === 2) setError("GPS信号を取得できません");
        else setError("GPS取得エラー");
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  };

  const pauseRecording = () => {
    stopWatch();
    clearTimer();
    setStatus("paused");
    setElapsed((e) => e);
    releaseWakeLock(); // 一時停止中は画面オフを許可
  };

  const resumeRecording = () => {
    setError(null);
    setStatus("recording");
    startTimer(elapsed);
    requestWakeLock(); // 再開したら再度画面オフを防ぐ
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      () => setError("GPS再取得に失敗しました"),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  };

  const stopRecording = () => {
    stopWatch();
    clearTimer();
    releaseWakeLock(); // 終了したら画面オフを解除
    const finished = sessionRef.current
      ? { ...sessionRef.current, stoppedAt: Date.now() }
      : null;
    if (finished) {
      saveSession(finished);
      setCompletedSession(finished);
    }
    setActiveSession(null);
    setStatus("done");
  };

  const resetAll = () => {
    stopWatch();
    clearTimer();
    releaseWakeLock(); // リセット時も解除
    setStatus("idle");
    setSession(null);
    sessionRef.current = null;
    setElapsed(0);
    setCurrentDist(0);
    setCurrentSpeed(null);
    setCompletedSession(null);
    autoStartedRef.current = false;
    setError(null);
  };

  useEffect(() => {
    return () => { stopWatch(); clearTimer(); };
  }, [stopWatch]);

  const distStr = currentDist >= 1 ? `${currentDist.toFixed(1)} km` : `${Math.round(currentDist * 1000)} m`;

  // Pulse color by status
  const pulseColor = status === "recording" ? "#ff6b00" : status === "paused" ? "#facc15" : "#6b7280";

  // Create post with this route
  const goCreatePost = () => {
    if (!completedSession) return;
    const dur = formatDuration((completedSession.stoppedAt! - completedSession.startedAt));
    const params = new URLSearchParams({
      fromGPS: "1",
      distance: completedSession.totalDistanceKm.toFixed(1),
      duration: dur,
      sessionId: completedSession.id,
    });
    window.location.href = `/create?${params.toString()}`;
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-20 right-4 md:bottom-6 z-40 flex flex-col items-end gap-2">
        {/* Expanded panel */}
        {open && (
          <div className="card w-72 shadow-2xl" style={{borderColor: status === "recording" ? "#ff6b00" : status === "paused" ? "#facc15" : "#252535"}}>
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm flex items-center gap-2">
                  <span className="text-base">📍</span> GPS走行記録
                </span>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    width: "32px", height: "32px",
                    borderRadius: "8px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#a0a0c0",
                    fontSize: "18px",
                    cursor: "pointer",
                    lineHeight: 1,
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.15)";
                    (e.currentTarget as HTMLElement).style.color = "#f87171";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLElement).style.color = "#a0a0c0";
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Done screen */}
              {status === "done" && completedSession && (
                <div className="space-y-3">
                  <div className="text-center py-2">
                    <div className="text-4xl mb-1">🏁</div>
                    <div className="text-green-400 font-bold">記録完了！</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-[#1a1a25] rounded-lg p-3">
                      <div className="font-black text-base" style={{color:"#ff6b00"}}>
                        {completedSession.totalDistanceKm.toFixed(1)} km
                      </div>
                      <div className="text-gray-500">走行距離</div>
                    </div>
                    <div className="bg-[#1a1a25] rounded-lg p-3">
                      <div className="font-black text-base" style={{color:"#ff6b00"}}>
                        {formatDuration(completedSession.stoppedAt! - completedSession.startedAt)}
                      </div>
                      <div className="text-gray-500">走行時間</div>
                    </div>
                    <div className="bg-[#1a1a25] rounded-lg p-3">
                      <div className="font-black text-base" style={{color:"#ff6b00"}}>
                        {Math.round(completedSession.maxSpeedKmh)} km/h
                      </div>
                      <div className="text-gray-500">最高速度</div>
                    </div>
                    <div className="bg-[#1a1a25] rounded-lg p-3">
                      <div className="font-black text-base" style={{color:"#ff6b00"}}>
                        {completedSession.points.length}
                      </div>
                      <div className="text-gray-500">記録ポイント</div>
                    </div>
                  </div>
                  <button onClick={goCreatePost} className="btn-primary w-full text-sm">
                    🗺️ このルートを投稿する
                  </button>
                  <button
                    onClick={() => {
                      if (!completedSession) return;
                      const d = new Date(completedSession.startedAt);
                      saveToLibrary({
                        name: `${d.getMonth()+1}/${d.getDate()} のツーリング`,
                        description: "",
                        tags: [],
                        session: completedSession,
                        isPublic: false,
                      });
                      alert("📚 ルートライブラリに保存しました！");
                    }}
                    className="btn-ghost w-full text-sm"
                  >
                    📚 ライブラリに保存
                  </button>
                  <div className="flex gap-2">
                    <a href="/riding-log" className="flex-1 text-center text-xs text-gray-500 hover:text-white transition-colors py-1">
                      📊 走行ログを見る
                    </a>
                    <a href="/achievements" className="flex-1 text-center text-xs text-gray-500 hover:text-white transition-colors py-1">
                      🏆 実績を確認
                    </a>
                  </div>
                  <button onClick={resetAll} className="text-xs text-gray-600 hover:text-gray-400 w-full text-center transition-colors">
                    閉じる
                  </button>
                </div>
              )}

              {/* Idle screen */}
              {status === "idle" && (
                <div style={{display:"flex", flexDirection:"column", gap:"16px"}}>
                  {/* Mode toggle */}
                  <div>
                    <p style={{fontSize:"12px", color:"#a0a0c0", marginBottom:"10px"}}>記録モード</p>
                    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
                      {(["manual", "auto"] as Mode[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => setMode(m)}
                          style={{
                            padding: "14px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            border: `1px solid ${mode === m ? "#ff6b00" : "#2a2a45"}`,
                            background: mode === m ? "rgba(255,107,0,0.1)" : "transparent",
                            color: mode === m ? "#ff6b00" : "#9ca3af",
                            cursor: "pointer",
                            textAlign: "center",
                          }}
                        >
                          {m === "manual" ? (
                            <><div style={{fontSize:"24px", marginBottom:"8px"}}>👆</div>手動 ON/OFF</>
                          ) : (
                            <><div style={{fontSize:"24px", marginBottom:"8px"}}>🤖</div>走行で自動開始</>
                          )}
                        </button>
                      ))}
                    </div>
                    {mode === "auto" && (
                      <p style={{fontSize:"11px", color:"#5a5a7a", marginTop:"8px"}}>
                        ※ 時速{AUTO_SPEED_THRESHOLD_KMH}km以上で自動的に記録を開始します
                      </p>
                    )}
                  </div>

                  {/* Wake Lock 対応状況 + 注釈 */}
                  {"wakeLock" in navigator ? (
                    <div style={{
                      padding: "8px 12px", borderRadius: "8px",
                      background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                      fontSize: "11px", color: "#10b981",
                      display: "flex", alignItems: "flex-start", gap: "6px",
                    }}>
                      <span style={{marginTop:"1px"}}>🔆</span>
                      <span>
                        記録中は<strong>画面が自動でオフにならない</strong>よう制御します。
                        長距離ツーリングではバイクのUSB給電やモバイルバッテリーとの併用をおすすめします。
                      </span>
                    </div>
                  ) : (
                    <div style={{
                      padding: "8px 12px", borderRadius: "8px",
                      background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)",
                      fontSize: "11px", color: "#fbbf24",
                      display: "flex", alignItems: "flex-start", gap: "6px",
                    }}>
                      <span style={{marginTop:"1px"}}>⚠️</span>
                      <span>
                        このブラウザは画面オフ防止に対応していません。
                        端末の<strong>画面自動ロックをOFF</strong>にしてから記録を開始してください。
                        画面が消えるとGPS記録が止まる可能性があります。
                      </span>
                    </div>
                  )}

                  {error && <p style={{fontSize:"12px", color:"#f87171", background:"rgba(239,68,68,0.1)", borderRadius:"8px", padding:"8px"}}>{error}</p>}

                  <button
                    onClick={startRecording}
                    style={{
                      width:"100%", padding:"14px",
                      background:"linear-gradient(135deg, #ff6b00, #ff8c38)",
                      color:"white", fontWeight:700, fontSize:"15px",
                      border:"none", borderRadius:"10px", cursor:"pointer",
                      boxShadow:"0 2px 12px rgba(255,107,0,0.35)",
                      marginTop:"4px",
                    }}
                  >
                    ▶ 記録開始
                  </button>
                </div>
              )}

              {/* Recording / Paused screen */}
              {(status === "recording" || status === "paused") && (
                <div className="space-y-3">
                  {/* Live stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-[#1a1a25] rounded-lg p-2">
                      <div className="font-black text-sm" style={{color:"#ff6b00"}}>{formatDuration(elapsed)}</div>
                      <div className="text-gray-500">時間</div>
                    </div>
                    <div className="bg-[#1a1a25] rounded-lg p-2">
                      <div className="font-black text-sm" style={{color:"#ff6b00"}}>{distStr}</div>
                      <div className="text-gray-500">距離</div>
                    </div>
                    <div className="bg-[#1a1a25] rounded-lg p-2">
                      <div className="font-black text-sm" style={{color:"#ff6b00"}}>
                        {currentSpeed != null ? `${currentSpeed}` : "--"}
                        <span className="text-xs font-normal text-gray-500"> km/h</span>
                      </div>
                      <div className="text-gray-500">速度</div>
                    </div>
                  </div>

                  {/* GPS accuracy + Wake Lock status */}
                  <div className="flex items-center justify-center gap-3 text-xs">
                    {gpsAccuracy != null && (
                      <span className="text-gray-500">
                        GPS ±{gpsAccuracy}m
                        {mode === "auto" && !sessionRef.current?.points.length && status === "recording" && (
                          <span className="text-yellow-400 ml-1">走行待機中...</span>
                        )}
                      </span>
                    )}
                    {/* Wake Lock インジケーター */}
                    <span
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        padding: "2px 8px", borderRadius: "999px",
                        fontSize: "11px", fontWeight: 600,
                        background: wakeLockActive ? "rgba(16,185,129,0.15)" : "rgba(107,114,128,0.15)",
                        color: wakeLockActive ? "#10b981" : "#6b7280",
                      }}
                    >
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: wakeLockActive ? "#10b981" : "#6b7280", display: "inline-block" }} />
                      {wakeLockActive ? "画面オフ防止 ON" : "画面オフ防止 OFF"}
                    </span>
                  </div>

                  {error && <p className="text-xs text-red-400">{error}</p>}

                  <div className="flex gap-2">
                    {status === "recording" ? (
                      <button onClick={pauseRecording} className="btn-ghost flex-1 text-sm">
                        ⏸ 一時停止
                      </button>
                    ) : (
                      <button onClick={resumeRecording} className="btn-primary flex-1 text-sm">
                        ▶ 再開
                      </button>
                    )}
                    <button
                      onClick={stopRecording}
                      className="flex-1 text-sm py-2 rounded-lg font-medium border transition-colors"
                      style={{background:"rgba(239,68,68,0.15)", borderColor:"rgba(239,68,68,0.5)", color:"#f87171"}}
                    >
                      ⏹ 終了
                    </button>
                  </div>
                  <button onClick={resetAll} className="text-xs text-gray-600 hover:text-gray-400 w-full text-center transition-colors">
                    記録を破棄してリセット
                  </button>

                  {/* バッテリー注釈 */}
                  {wakeLockActive && (
                    <div style={{
                      padding: "6px 10px", borderRadius: "6px",
                      background: "rgba(107,114,128,0.08)",
                      fontSize: "10px", color: "#6b7280",
                      textAlign: "center", lineHeight: "1.5",
                    }}>
                      🔋 画面オン継続中のためバッテリー消費が増えます。<br/>
                      長距離ツーリングはUSB給電との併用がおすすめです。
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FAB button */}
        <button
          onClick={() => setOpen(!open)}
          title="GPS走行記録"
          style={{
            width: "60px", height: "60px",
            borderRadius: "18px",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "3px",
            cursor: "pointer",
            border: status === "idle"
              ? "1.5px solid rgba(6,182,212,0.4)"
              : "none",
            transition: "transform 0.15s, box-shadow 0.15s",
            background: status === "recording"
              ? "linear-gradient(135deg, #ff6b00, #e05500)"
              : status === "paused"
              ? "linear-gradient(135deg, #d97706, #a16207)"
              : status === "done"
              ? "linear-gradient(135deg, #16a34a, #15803d)"
              : "linear-gradient(135deg, #0e1a24, #0c1620)",
            boxShadow: status === "recording"
              ? "0 0 0 3px rgba(255,107,0,0.25), 0 8px 24px rgba(255,107,0,0.45)"
              : status === "paused"
              ? "0 0 0 3px rgba(217,119,6,0.25), 0 6px 20px rgba(217,119,6,0.35)"
              : status === "done"
              ? "0 0 0 3px rgba(22,163,74,0.25), 0 6px 20px rgba(22,163,74,0.35)"
              : "0 0 0 2px rgba(6,182,212,0.2), 0 6px 20px rgba(0,0,0,0.5)",
            animation: status === "recording" ? "pulse-orange 2s infinite" : "none",
          }}
        >
          {/* Icon — カラーをステータスで切り替え */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {status === "recording" ? (
              /* 録音中: 停止ボタン（白） */
              <>
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
                <rect x="8" y="8" width="8" height="8" rx="2" fill="white"/>
              </>
            ) : status === "paused" ? (
              /* 一時停止中: ポーズバー（白） */
              <>
                <rect x="6" y="5" width="4" height="14" rx="1.5" fill="white"/>
                <rect x="14" y="5" width="4" height="14" rx="1.5" fill="white"/>
              </>
            ) : status === "done" ? (
              /* 完了: チェック（白） */
              <path d="M5 13l5 5L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            ) : (
              /* 待機中: GPSピン（シアン） */
              <>
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  stroke="#06b6d4" strokeWidth="1.8" fill="rgba(6,182,212,0.12)"
                />
                <circle cx="12" cy="9.5" r="2.5" stroke="#06b6d4" strokeWidth="1.8"/>
                <circle cx="12" cy="9.5" r="1" fill="#06b6d4"/>
              </>
            )}
          </svg>
          {/* ラベル */}
          <span style={{
            fontSize: "9px", fontWeight: 800, letterSpacing: "0.08em",
            color: status === "idle" ? "#06b6d4" : "white",
            lineHeight: 1,
          }}>
            {status === "recording" ? "REC" : status === "paused" ? "PAUSE" : status === "done" ? "完了" : "GPS"}
          </span>
        </button>

        {/* Recording timer badge */}
        {status === "recording" && (
          <div style={{
            background: "#ff6b00", color: "white",
            fontSize: "11px", fontWeight: 700,
            padding: "3px 10px", borderRadius: "999px",
            boxShadow: "0 2px 8px rgba(255,107,0,0.5)",
            letterSpacing: "0.05em",
          }}>
            ● {formatDuration(elapsed)}
          </div>
        )}
        {status === "paused" && (
          <div style={{
            background: "#d97706", color: "white",
            fontSize: "11px", fontWeight: 700,
            padding: "3px 10px", borderRadius: "999px",
          }}>
            ⏸ 一時停止中
          </div>
        )}
      </div>
    </>
  );
}
