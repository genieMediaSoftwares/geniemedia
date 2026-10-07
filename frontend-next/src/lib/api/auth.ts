import BASE_URL from "@/Api";
import type { LoginResponse } from "@/types";

export async function login(email: string, password: string): Promise<{ ok: boolean; status: number; data: LoginResponse | null }> {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json().catch(() => null)) as LoginResponse | null;
  return { ok: res.ok, status: res.status, data };
}
