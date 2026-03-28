const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const ASSESSMENT_API_BASE = process.env.NEXT_PUBLIC_ASSESSMENT_API_URL ?? "http://localhost:3012";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...options?.headers as Record<string, string> };
  if (options?.body) {
    headers["Content-Type"] ??= "application/json";
  }
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers,
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `API error: ${res.status}`);
  }
  return res.json();
}

export async function assessmentApiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${ASSESSMENT_API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `API error: ${res.status}`);
  }
  return res.json();
}
