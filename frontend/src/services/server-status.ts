/**
 * Global "is the backend reachable" store, kept outside React so it can be driven
 * from non-React code (the `apiFetch` layer) and read from React via
 * `useSyncExternalStore` (see `hooks/useServerStatus.ts`).
 *
 * Behaviour (per product decisions):
 * - Silent while healthy: no background traffic at all.
 * - A *suspected* outage (a network reject, OR a 5xx — including the 500 Vite's dev
 *   proxy returns when the backend is unreachable) triggers a `GET /health` probe to
 *   *confirm* before showing anything. Only if `/health` is also unreachable do we
 *   flip to `down`. This filters false positives (a one-off endpoint 500, or the
 *   geocoder's 503, leaves `/health` returning 200, so the card stays hidden).
 * - While `down`, poll `/health` every few seconds; the moment it responds 200 we
 *   flip back to `up`, reset the user's dismissal, and stop.
 */

const HEALTH_URL = '/health';
const POLL_INTERVAL_MS = 5000;
const PROBE_TIMEOUT_MS = 5000;

export interface ServerStatusSnapshot {
  status: 'up' | 'down';
  /** The user closed the card for the current outage; reset on recovery. */
  dismissed: boolean;
}

let snapshot: ServerStatusSnapshot = { status: 'up', dismissed: false };
const listeners = new Set<() => void>();
let pollTimer: ReturnType<typeof setTimeout> | null = null;
let probing = false; // a confirmation `/health` probe is currently in flight

function emit() {
  for (const listener of listeners) listener();
}

/** Replace the snapshot only on a real change, so `getSnapshot` stays referentially stable. */
function setSnapshot(next: ServerStatusSnapshot) {
  if (next.status === snapshot.status && next.dismissed === snapshot.dismissed) return;
  snapshot = next;
  emit();
}

/** One `/health` check. Returns true only on a 200; a reject, timeout, or non-2xx is false. */
async function checkHealth(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(HEALTH_URL, { cache: 'no-store', signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

/** Recovery loop: keep probing while `down` until `/health` comes back. */
function scheduleRecoveryPoll() {
  if (pollTimer !== null) return;
  pollTimer = setTimeout(async () => {
    pollTimer = null;
    if (snapshot.status !== 'down') return;
    if (await checkHealth()) {
      setSnapshot({ status: 'up', dismissed: false });
    } else {
      scheduleRecoveryPoll();
    }
  }, POLL_INTERVAL_MS);
}

export const serverStatus = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot(): ServerStatusSnapshot {
    return snapshot;
  },

  /**
   * A request failed in a way that *might* mean the backend is down (network reject,
   * or a 5xx incl. the Vite dev-proxy's 500). Confirms with a `/health` probe before
   * showing anything. Idempotent and never throws — safe to call fire-and-forget.
   */
  async reportSuspectedOutage() {
    if (snapshot.status === 'down' || probing) return;
    probing = true;
    try {
      // `probing` guarantees no other path flipped status during the await.
      if (!(await checkHealth())) {
        setSnapshot({ status: 'down', dismissed: false });
        scheduleRecoveryPoll();
      }
    } finally {
      probing = false;
    }
  },

  /** User closed the card; stays hidden until the server recovers (a new outage re-shows it). */
  dismiss() {
    if (snapshot.status !== 'down' || snapshot.dismissed) return;
    setSnapshot({ status: 'down', dismissed: true });
  },
};
