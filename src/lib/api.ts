const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5050";

const jsonHeaders = { "Content-Type": "application/json" };

export const authApi = {
  async register(body: { fullName: string; email: string; password: string }) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: jsonHeaders,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
  async login(body: { email: string; password: string }) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: jsonHeaders,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
  async logout() {
    await fetch(`${BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
  },
  async me() {
    const res = await fetch(`${BASE_URL}/me`, { credentials: "include" });
    if (!res.ok) return null;
    return res.json();
  },
};
