/**
 * Admin session helpers (browser only).
 *
 * The JWT issued by POST /api/login is kept in localStorage under "token",
 * exactly as the Vite admin stored it, so a signed-in admin stays signed in
 * across the migration. The backend verifies the token on every admin request;
 * the client-side gate only decides which screen to show.
 */

const TOKEN_KEY = "token";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string): void => {
  window.localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable: nothing to clear */
  }
};

/** Authorization header for admin API calls. */
export const authHeaders = (token: string | null): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {};
