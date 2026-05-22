"use client";

import { useState, useEffect, useRef } from "react";

let showToastFn: ((msg: string, type?: "info" | "soon") => void) | null = null;

export function toast(msg: string, type: "info" | "soon" = "info") {
  showToastFn?.(msg, type);
}

export default function Toast() {
  const [items, setItems] = useState<{ id: number; msg: string; type: string }[]>([]);
  // 表示中メッセージの重複防止用
  const activeMessages = useRef<Set<string>>(new Set());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    showToastFn = (msg, type = "info") => {
      // 同じメッセージが既に表示中なら何もしない
      if (activeMessages.current.has(msg)) return;

      const id = Date.now();
      activeMessages.current.add(msg);
      setItems((prev) => [...prev, { id, msg, type: type ?? "info" }]);

      // 既存のタイマーがあればクリア
      if (timers.current.has(msg)) clearTimeout(timers.current.get(msg)!);

      const timer = setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.msg !== msg));
        activeMessages.current.delete(msg);
        timers.current.delete(msg);
      }, 2500);

      timers.current.set(msg, timer);
    };

    return () => {
      showToastFn = null;
      timers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <div style={{
      position: "fixed", bottom: "80px", left: "50%",
      transform: "translateX(-50%)", zIndex: 9999,
      display: "flex", flexDirection: "column", gap: "8px",
      alignItems: "center", pointerEvents: "none",
    }}>
      {items.map((item) => (
        <div key={item.id} style={{
          padding: "10px 20px", borderRadius: "10px",
          fontSize: "13px", fontWeight: 600,
          background: item.type === "soon"
            ? "rgba(255,107,0,0.92)"
            : "rgba(20,20,36,0.96)",
          color: "white",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
          animation: "fade-in 0.2s ease",
          whiteSpace: "nowrap",
        }}>
          {item.msg}
        </div>
      ))}
    </div>
  );
}
