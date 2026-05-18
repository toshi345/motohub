import { TrackSession } from "./gps";

export interface SavedRoute {
  id: string;
  name: string;
  description: string;
  tags: string[];
  savedAt: string;
  session: TrackSession;
  isPublic: boolean;
  coverImageUrl?: string;
}

const KEY = "motohub_route_library";

export function loadRouteLibrary(): SavedRoute[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function saveToLibrary(data: Omit<SavedRoute, "id" | "savedAt">): SavedRoute {
  const routes = loadRouteLibrary();
  const route: SavedRoute = { ...data, id: `route_${Date.now()}`, savedAt: new Date().toISOString() };
  routes.unshift(route);
  localStorage.setItem(KEY, JSON.stringify(routes.slice(0, 100)));
  return route;
}

export function updateRouteInLibrary(id: string, updates: Partial<SavedRoute>) {
  const routes = loadRouteLibrary().map((r) => r.id === id ? { ...r, ...updates } : r);
  localStorage.setItem(KEY, JSON.stringify(routes));
}

export function deleteFromLibrary(id: string) {
  localStorage.setItem(KEY, JSON.stringify(loadRouteLibrary().filter((r) => r.id !== id)));
}
