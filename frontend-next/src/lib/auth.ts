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
  }
};

export const authHeaders = (token: string | null): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {};
