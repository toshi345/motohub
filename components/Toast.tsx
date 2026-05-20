"use client";

import { useState, useEffect } from "react";

let showToastFn: ((msg: string, type?: "info" | "soon") => void) | null = null;

export function toast(msg: string, type: "info" | "soon" = "info") {
  showToastFn?.(msg, type);
}

export default function Toast() {
  const [items, setItems] = useState<{ id: number; msg: string; type: string }[]>([]);

  useEffect(() => {
    showToastFn = (msg, type = "info") => {
      const id = Date.now();
      setItems((prev) => [...prev, { id, msg, type: type ?? "info" }]);
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 3000);
    };
    return () => { showToastFn = null; };
  }, []);

  return (
    <div style={{ position: "fixed", bottom: "80px", left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", gap: "8px", alignItems: "center", pointerEvents: "none" }}>
      {items.map((item) => (
        <div key={item.id} style={{
          padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
          background: item.type === "soon" ? "rgba(255,107,0,0.9)" : "rgba(30,30,50,0.95)",
          color: "white", border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
          animation: "fade-in 0.2s ease",
          whiteSpace: "nowrap",
        }}>
          {item.msg}
        </div>
      ))}
    </div>
  );
}
