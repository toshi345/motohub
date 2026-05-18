export interface DraftData {
  id: string;
  title: string;
  content: string;
  tags: string;
  postType: string;
  location: string;
  routeDistance: string;
  routeDuration: string;
  routeStart: string;
  routeEnd: string;
  routeDifficulty: string;
  spotCategory: string;
  spotAddress: string;
  savedAt: string;
}

const DRAFTS_KEY = "motohub_drafts";

export function saveDraft(data: Omit<DraftData, "id" | "savedAt">, existingId?: string): string {
  const drafts = loadDrafts();
  const id = existingId ?? `draft_${Date.now()}`;
  const draft: DraftData = { ...data, id, savedAt: new Date().toISOString() };
  const filtered = drafts.filter((d) => d.id !== id);
  filtered.unshift(draft);
  // Keep max 10 drafts
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered.slice(0, 10)));
  return id;
}

export function loadDrafts(): DraftData[] {
  try {
    return JSON.parse(localStorage.getItem(DRAFTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function deleteDraft(id: string) {
  const drafts = loadDrafts().filter((d) => d.id !== id);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export function formatDraftDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "たった今";
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}時間前`;
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}
