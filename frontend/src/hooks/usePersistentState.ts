import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

/**
 * A `useState` drop-in that persists its value to `sessionStorage` under `key`.
 *
 * Restores the stored value on mount (falling back to `defaultValue`), and writes
 * back on every change. Because `sessionStorage` is scoped per browser tab, each
 * open tab keeps its own independent value that survives a page refresh but resets
 * when the tab is closed.
 *
 * All storage access is wrapped in try/catch so a missing, corrupt, or unavailable
 * store degrades gracefully to `defaultValue`.
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable — ignore */
    }
  }, [key, value]);

  return [value, setValue];
}
