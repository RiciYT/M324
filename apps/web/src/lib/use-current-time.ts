import { useEffect, useMemo, useState } from "react";

const DEFAULT_INTERVAL_MS = 1000;

export function useCurrentTime({
  enabled = true,
  intervalMs = DEFAULT_INTERVAL_MS,
  serverNow,
}: {
  enabled?: boolean;
  intervalMs?: number;
  serverNow?: string;
} = {}): Date {
  const clock = useMemo(() => createServerSyncedClock(serverNow), [serverNow]);
  const [now, setNow] = useState(() => clock());

  useEffect(() => {
    setNow(clock());

    if (!(enabled && intervalMs > 0)) {
      return;
    }

    const intervalId = globalThis.setInterval(() => {
      setNow(clock());
    }, intervalMs);

    return () => globalThis.clearInterval(intervalId);
  }, [clock, enabled, intervalMs]);

  return now;
}

function createServerSyncedClock(serverNow: string | undefined) {
  if (!serverNow) {
    return () => new Date();
  }

  const baseClientMs = Date.now();
  const baseServerMs = new Date(serverNow).getTime();

  return () => new Date(baseServerMs + Date.now() - baseClientMs);
}
