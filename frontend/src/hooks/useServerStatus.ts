import { useSyncExternalStore } from 'react';
import { serverStatus } from '../services/server-status';

/** React binding for the global server-reachability store. */
export function useServerStatus() {
  const snapshot = useSyncExternalStore(serverStatus.subscribe, serverStatus.getSnapshot);
  return {
    isDown: snapshot.status === 'down',
    dismissed: snapshot.dismissed,
    dismiss: serverStatus.dismiss,
  };
}
