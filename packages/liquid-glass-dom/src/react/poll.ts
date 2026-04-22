/**
 * Re-runs a readiness check on animation frames until it succeeds, then invokes
 * `onReady`.
 *
 * Several React-layer integrations have to wait until a DOM node is mounted and
 * connected in its final location. This helper centralizes that retry loop and
 * returns a cleanup function for both the polling phase and the ready phase.
 */
export function pollWithAnimationFrame(
  isReady: () => boolean,
  onReady: () => void | (() => void),
) {
  let frameId = 0
  let cancelled = false
  let cleanup: void | (() => void)

  const tick = () => {
    if (cancelled) {
      return
    }

    if (!isReady()) {
      frameId = requestAnimationFrame(tick)
      return
    }

    cleanup = onReady()
  }

  tick()

  return () => {
    cancelled = true
    cancelAnimationFrame(frameId)
    cleanup?.()
  }
}
