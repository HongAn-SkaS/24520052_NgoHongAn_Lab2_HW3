
/**
 * Creates a countdown timer that recalculates remaining time
 * from an absolute deadline to prevent accumulated drift.
 *
 * @param {number} durationMs - Countdown duration in milliseconds.
 * @param {(remaining: number) => void} onTick - Called with remaining time.
 * @returns {() => void} Cleanup function.
 */
export function createAntiDriftTimer(durationMs, onTick) {
  const targetTime = Date.now() + Math.max(0, durationMs);
  let rafId = 0;
  let stopped = false;

  function tick() {
    if (stopped) {
      return;
    }

    const remaining = Math.max(0, targetTime - Date.now());

    onTick(remaining);

    if (remaining > 0 && !stopped) {
      rafId = requestAnimationFrame(tick);
    }
  }

  rafId = requestAnimationFrame(tick);

  return function stop() {
    stopped = true;
    cancelAnimationFrame(rafId);
  };
}
