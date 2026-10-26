/** Small fetch wrapper for the app's own API. Throws ApiError with the server's Hebrew message. */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const response = await fetch(path, {
    method: init?.method ?? "GET",
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = (data as { error?: { code: string; message: string } } | null)?.error;
    throw new ApiError(
      error?.code ?? "NETWORK",
      error?.message ?? "אין חיבור לשרת. נסה שוב.",
      response.status,
    );
  }
  return data as T;
}
