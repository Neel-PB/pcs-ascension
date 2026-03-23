const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = sessionStorage.getItem("nestjs_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  const authPaths = ["/auth/login", "/auth/register", "/auth/check-email", "/auth/set-initial-password"];
  if (res.status === 401 && !authPaths.some(p => path.startsWith(p))) {
    sessionStorage.removeItem("nestjs_token");
    sessionStorage.removeItem("nestjs_user");
    sessionStorage.removeItem("nestjs_must_change_password");
    window.location.href = "/auth";
    throw new Error("Session expired. Please sign in again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data as T;
}
