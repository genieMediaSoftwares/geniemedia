// ---------------------------------------------------------------------------
// Small, safe coercions used by the adapters
// ---------------------------------------------------------------------------

export type RawRecord = Record<string, unknown>;

export const isRecord = (value: unknown): value is RawRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const str = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
};

export const num = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/** JSON columns arrive as arrays, or as strings when stored as LONGTEXT. */
export const arr = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};
