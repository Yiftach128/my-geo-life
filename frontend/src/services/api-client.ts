export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: { error: string; details?: unknown },
  ) {
    super(body.error);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (init.headers) Object.assign(headers, init.headers);

  const res = await fetch(path, { ...init, headers });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({ error: res.statusText }));
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}
