const API_BASE = "";

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method ?? "GET";
  const headers: Record<string, string> = { ...options?.headers as Record<string, string> };
  if (options?.body) {
    headers["Content-Type"] ??= "application/json";
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      headers,
      ...options,
    });
  } catch {
    throw new Error("Failed to fetch");
  }

  if (res.status === 401 && !path.includes("/auth/refresh") && !path.includes("/auth/login")) {
    if (!refreshPromise) {
      refreshPromise = tryRefreshToken().finally(() => { refreshPromise = null; });
    }
    const refreshed = await refreshPromise;
    if (refreshed) {
      const retry = await fetch(`${API_BASE}${path}`, {
        credentials: "include",
        headers,
        ...options,
      });
      if (!retry.ok) {
        const body = await retry.json().catch(() => ({}));
        throw new Error(body.error ?? `API error: ${retry.status}`);
      }
      return retry.json();
    }
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `API error: ${res.status}`);
  }
  return res.json();
}

export async function assessmentApiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  return apiFetch<T>(`/api${path}`, options);
}
