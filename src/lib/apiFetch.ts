const DEPLOYED_API = "https://ascension-api-213151693504.us-central1.run.app";
const envUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

const isLocalApi = envUrl.includes("127.0.0.1") || envUrl.includes("localhost");
const isLocalOrigin = typeof window !== "undefined" && window.location.hostname === "localhost";
const API_BASE_URL = (isLocalApi && !isLocalOrigin) ? DEPLOYED_API : (envUrl || DEPLOYED_API);

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = sessionStorage.getItem("nestjs_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data as T;
}
