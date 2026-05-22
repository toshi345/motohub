// 全ページ共通のシンプルSVGアイコン集
// strokeWidth="1.8" / strokeLinecap="round" で統一

type IconProps = { size?: number; color?: string; className?: string };
const s = (props: IconProps) => ({
  width: props.size ?? 20,
  height: props.size ?? 20,
  className: props.className,
});
const stroke = (props: IconProps) => ({
  fill: "none",
  stroke: props.color ?? "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

// ── ナビ・一般 ─────────────────────────────
export const HomeIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);

export const MapIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/>
    <path d="M6 16C6 10 10 8 12 8s6-2 6-2"/>
  </svg>
);

export const PinIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
);

export const ChartIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M7 16l3-4 3 3 3-5"/>
  </svg>
);

export const UserIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

export const PlusIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export const BikeIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/>
    <path d="M5 17l2-5h7l2 5"/>
    <path d="M10 12L8 7h5l2 5"/>
  </svg>
);

// ── 統計 ───────────────────────────────────
export const RulerIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <path d="M21 7L7 21l-4-4L17 3l4 4z"/>
    <path d="M14 10l-4 4M11 7l-4 4M17 13l-4 4"/>
  </svg>
);

export const ClockIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 7v5l3 3"/>
  </svg>
);

export const SpeedIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" strokeDasharray="2"/>
    <path d="M12 12l4-4"/>
    <circle cx="12" cy="12" r="2" fill="currentColor" strokeWidth="0"/>
  </svg>
);

export const FlameIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <path d="M12 2c0 5-5 7-5 12a5 5 0 0010 0c0-3-2-5-2-8-1.5 2-3 3-3 6"/>
  </svg>
);

export const TrophyIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <path d="M8 21h8M12 17v4M7 4H4v4a4 4 0 004 4h8a4 4 0 004-4V4h-3"/>
    <path d="M7 4h10v6a5 5 0 01-10 0V4z"/>
  </svg>
);

// ── 投稿・カメラ ───────────────────────────
export const CameraIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

export const ImageIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="M21 15l-5-5L5 21"/>
  </svg>
);

export const EditIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// ── ガレージ・メンテ ──────────────────────
export const WrenchIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
  </svg>
);

export const OilIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <path d="M3 22v-2a4 4 0 014-4h10a4 4 0 014 4v2"/>
    <rect x="8" y="2" width="8" height="10" rx="2"/>
    <path d="M12 12v4"/>
  </svg>
);

export const TireIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <circle cx="12" cy="12" r="9"/>
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>
  </svg>
);

export const BatteryIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <rect x="1" y="6" width="18" height="12" rx="2"/>
    <path d="M23 13v-2"/>
    <path d="M7 9v6M11 9v6"/>
  </svg>
);

// ── 燃費・お金 ────────────────────────────
export const FuelIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <path d="M3 22V4a2 2 0 012-2h8a2 2 0 012 2v8h2a2 2 0 012 2v4a2 2 0 002 2H3z"/>
    <path d="M7 10h4M7 6h4"/>
  </svg>
);

export const MoneyIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <rect x="1" y="4" width="22" height="16" rx="2"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M1 9h4M19 9h4M1 15h4M19 15h4"/>
  </svg>
);

// ── アクション ────────────────────────────
export const HeartIcon = (p: IconProps & { filled?: boolean }) => (
  <svg {...s(p)} viewBox="0 0 24 24" fill={p.filled ? (p.color ?? "currentColor") : "none"} stroke={p.color ?? "currentColor"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

export const CommentIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
  </svg>
);

export const ShareIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
);

export const StarIcon = (p: IconProps & { filled?: boolean }) => (
  <svg {...s(p)} viewBox="0 0 24 24" fill={p.filled ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

export const TagIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export const ShieldIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

export const SettingsIcon = (p: IconProps) => (
  <svg {...s(p)} viewBox="0 0 24 24" {...stroke(p)}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);
