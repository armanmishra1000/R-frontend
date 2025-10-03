import type { User } from "@/types/auth";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5050";

const jsonHeaders = { "Content-Type": "application/json" };

/**
 * Safely parse error response, handling both JSON and non-JSON responses
 */
async function parseErrorResponse(res: Response): Promise<never> {
  const contentType = res.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    try {
      const errorData = await res.json();
      throw errorData;
    } catch {
      // JSON parsing failed (body already consumed)
      throw { error: `Failed to parse error response`, status: res.status };
    }
  } else {
    // Non-JSON response, read as text
    try {
      const text = await res.text();
      throw { error: text || `HTTP ${res.status}: ${res.statusText}`, status: res.status };
    } catch {
      // Text reading failed
      throw { error: `HTTP ${res.status}: ${res.statusText}`, status: res.status };
    }
  }
}

export const authApi = {
  async register(body: { fullName: string; email: string; password: string }): Promise<User> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: jsonHeaders,
      body: JSON.stringify(body),
    });
    if (!res.ok) await parseErrorResponse(res);
    return res.json();
  },
  async login(body: { email: string; password: string }): Promise<User> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: jsonHeaders,
      body: JSON.stringify(body),
    });
    if (!res.ok) await parseErrorResponse(res);
    return res.json();
  },
  async logout(): Promise<void> {
    const res = await fetch(`${BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
    if (!res.ok) {
      throw new Error(`Logout failed: HTTP ${res.status} ${res.statusText}`);
    }
  },
  async me(): Promise<User | null> {
    const res = await fetch(`${BASE_URL}/me`, { credentials: "include" });
    if (!res.ok) return null;
    return res.json();
  },
};
