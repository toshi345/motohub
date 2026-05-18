"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

// SVG icons for bottom nav
const NavIcons: Record<string, (active: boolean) => React.ReactNode> = {
  "/": (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#ff6b00" : "#5a5a7a"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  ),
  "/routes": (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#ff6b00" : "#5a5a7a"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="18" r="2"/>
      <circle cx="18" cy="6" r="2"/>
      <path d="M6 16C6 10 10 8 12 8s6-2 6-2"/>
    </svg>
  ),
  "/riding-log": (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#ff6b00" : "#5a5a7a"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M7 16l3-4 3 3 3-5"/>
    </svg>
  ),
  "/profile": (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#ff6b00" : "#5a5a7a"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
};

const mobileNav = [
  { href: "/", label: "フィード" },
  { href: "/routes", label: "ルート" },
  { href: "/create", label: "投稿" },
  { href: "/riding-log", label: "走行ログ" },
  { href: "/profile", label: "マイページ" },
];

const desktopNav = [
  { href: "/", label: "フィード" },
  { href: "/routes", label: "ルート" },
  { href: "/spots", label: "スポット" },
];

const myMenuItems = [
  { href: "/riding-log",  label: "走行ログ",      icon: "📊" },
  { href: "/garage",      label: "マイガレージ",   icon: "🏍️" },
  { href: "/fuel",        label: "燃費管理",       icon: "⛽" },
  { href: "/expenses",    label: "費用管理",        icon: "💴" },
  { href: "/achievements",label: "実績・バッジ",   icon: "🏆" },
  { href: "/profile",     label: "プロフィール",   icon: "👤" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [myMenuOpen, setMyMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [atTop, setAtTop] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setAtTop(currentY < 10);
      // スクロールダウン → 非表示、スクロールアップ → 表示
      if (currentY > lastScrollY.current + 6) {
        setVisible(false);
        setMyMenuOpen(false);
      } else if (currentY < lastScrollY.current - 4) {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── Desktop nav ── */}
      <nav
        className="glass fixed top-0 left-0 right-0 z-50 border-b"
        style={{
          borderColor: atTop ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.1)",
          transform: visible ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), background 0.3s",
          background: atTop ? "rgba(8,8,16,0.7)" : "rgba(8,8,16,0.97)",
        }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-black text-xl shrink-0 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🏍️</span>
            <span className="text-gradient">MotoHub</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            {desktopNav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all relative"
                  style={active
                    ? { color: "#ff6b00", background: "rgba(255,107,0,0.1)" }
                    : { color: "#a0a0c0" }}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                      style={{ background: "#ff6b00" }} />
                  )}
                </Link>
              );
            })}

            {/* マイページ dropdown */}
            <div className="relative">
              <button
                onClick={() => setMyMenuOpen(!myMenuOpen)}
                onBlur={() => setTimeout(() => setMyMenuOpen(false), 150)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5"
                style={myMenuItems.some((m) => m.href === pathname)
                  ? { color: "#ff6b00", background: "rgba(255,107,0,0.1)" }
                  : { color: "#a0a0c0" }}
              >
                マイページ
                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"
                  style={{ transform: myMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                  <path d="M0 0l5 6 5-6z"/>
                </svg>
              </button>

              {myMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-44 py-1.5 rounded-xl shadow-2xl z-50 fade-in"
                  style={{ background: "#161628", border: "1px solid #2a2a45" }}>
                  {myMenuItems.map((item) => (
                    <Link key={item.href} href={item.href}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                      style={pathname === item.href
                        ? { color: "#ff6b00", background: "rgba(255,107,0,0.08)" }
                        : { color: "#a0a0c0" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = pathname === item.href ? "#ff6b00" : "#a0a0c0"; }}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 ml-auto">
            <Link href="/create" className="hidden md:flex btn-primary text-sm gap-1.5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/>
              </svg>
              投稿する
            </Link>
            <Link href="/profile" className="shrink-0">
              <img
                src="https://api.dicebear.com/7.x/adventurer/svg?seed=Yamada&backgroundColor=b6e3f4"
                alt="avatar"
                className="w-9 h-9 rounded-full transition-all"
                style={{ border: "2px solid #1e1e35" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#ff6b00"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1e1e35"; }}
              />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: "rgba(8,8,16,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ display: "flex", height: "58px" }}>
          {mobileNav.map((item) => {
            const active = pathname === item.href;
            const isCreate = item.href === "/create";
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2px",
                  color: active ? "#ff6b00" : "#5a5a7a",
                  textDecoration: "none",
                }}
              >
                {isCreate ? (
                  <div style={{
                    width: "44px", height: "44px",
                    borderRadius: "14px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginTop: "-18px",
                    background: "linear-gradient(135deg, #ff6b00, #ff8c38)",
                    boxShadow: "0 4px 18px rgba(255,107,0,0.5)",
                    flexShrink: 0,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </div>
                ) : (
                  <>
                    <div style={{
                      width: "40px", height: "26px",
                      borderRadius: "8px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: active ? "rgba(255,107,0,0.12)" : "transparent",
                      transition: "background 0.2s",
                    }}>
                      {NavIcons[item.href]?.(active)}
                    </div>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: active ? 700 : 500,
                      lineHeight: 1,
                      color: active ? "#ff6b00" : "#5a5a7a",
                    }}>
                      {item.label}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
