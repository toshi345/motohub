export interface TrackPoint {
  lat: number;
  lng: number;
  timestamp: number;
  speed: number | null; // m/s
  altitude: number | null;
}

export interface TrackSession {
  id: string;
  startedAt: number;
  stoppedAt?: number;
  points: TrackPoint[];
  totalDistanceKm: number;
  maxSpeedKmh: number;
  name?: string;
}

const SESSIONS_KEY = "motohub_gps_sessions";
const ACTIVE_KEY = "motohub_gps_active";

/** Haversine formula — returns distance in km */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calcTotalDistance(points: TrackPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineKm(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng);
  }
  return total;
}

export function saveSession(session: TrackSession) {
  try {
    const sessions: TrackSession[] = JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? "[]");
    const filtered = sessions.filter((s) => s.id !== session.id);
    filtered.unshift(session);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered.slice(0, 20)));
  } catch {}
}

export function loadSessions(): TrackSession[] {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function setActiveSession(session: TrackSession | null) {
  try {
    if (session) {
      localStorage.setItem(ACTIVE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
  } catch {}
}

export function getActiveSession(): TrackSession | null {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function deleteSession(id: string) {
  try {
    const sessions = loadSessions().filter((s) => s.id !== id);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {}
}
