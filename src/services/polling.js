/**
 * Visibility-aware polling helper.
 *
 * Every dashboard page used to poll the API on a fixed 4-5 second interval.
 * A single open tab therefore produced 30-40 requests per minute, and several
 * tabs looked like abusive traffic to the API host's bot protection (Vercel
 * answers with a 403 "Security Checkpoint", which the browser reports as a
 * CORS failure because no Access-Control-* headers are attached).
 *
 * This helper keeps the same "live" behaviour with far less traffic:
 *  - ticks are skipped while the tab is hidden,
 *  - the data is refreshed immediately when the tab becomes visible again,
 *  - the returned cleanup removes both the timer and the listener.
 *
 * Usage inside a component:
 *   useEffect(() => startPolling(() => fetchData(false)), []);
 */

// 20s is frequent enough for dashboards while staying well inside sane limits.
export const LIVE_POLL_INTERVAL = 20000;

const hasDocument = () => typeof document !== "undefined";

export default function startPolling(callback, intervalMs = LIVE_POLL_INTERVAL) {
  const tick = () => {
    if (hasDocument() && document.hidden) return;
    callback();
  };

  const handleVisibilityChange = () => {
    if (!document.hidden) tick();
  };

  const timer = setInterval(tick, intervalMs);

  if (hasDocument()) {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  return () => {
    clearInterval(timer);
    if (hasDocument()) {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  };
}
