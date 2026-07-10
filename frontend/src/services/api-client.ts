import { serverStatus } from './server-status';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: { error: string; details?: unknown },
  ) {
    super(body.error);
    this.name = 'ApiError';
  }
}

/** The request never reached the server (unreachable / DNS / timeout) — distinct from an HTTP error. */
export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super('Network request failed', { cause });
    this.name = 'NetworkError';
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (init.headers) Object.assign(headers, init.headers);

  let res: Response;
  try {
    res = await fetch(path, { ...init, headers });
  } catch (e) {
    // fetch rejects when the server can't be reached — confirm & flag globally, then rethrow.
    void serverStatus.reportSuspectedOutage();
    throw new NetworkError(e);
  }

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({ error: res.statusText }));
  if (!res.ok) {
    // A 5xx may mean the backend is down — in dev, Vite's proxy answers 500 when the
    // target is unreachable. Confirm via /health (guards against false positives).
    if (res.status >= 500) void serverStatus.reportSuspectedOutage();
    throw new ApiError(res.status, body);
  }
  return body as T;
}
