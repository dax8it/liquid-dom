import { useLayoutEffect, useRef, type RefObject } from 'react'
import { Glass as GlassShape, type Container as GlassContainer } from '../scene'
import { trackElement, type ElementTracker } from '../track-element'
import { getScene } from './bindings'
import { pollWithAnimationFrame } from './poll'
import type { RootRuntime } from './types'

type UseGlassTrackerParams = {
  runtime: RootRuntime | null
  container: GlassContainer
  glass: GlassShape
  proxyRef: RefObject<HTMLDivElement | null>
}

/**
 * Connects `trackElement()` once a glass proxy is fully ready.
 *
 * The tracker cannot start until:
 * - the root runtime exists
 * - the proxy element has been mounted into the hidden overlay
 * - the backing glass has been attached to the expected container in the active scene
 *
 * Waiting for those conditions avoids races during initial mount, cleanup, and
 * Strict Mode replays.
 */
export function useGlassTracker({
  runtime,
  container,
  glass,
  proxyRef,
}: UseGlassTrackerParams) {
  const trackerRef = useRef<ElementTracker | null>(null)

  useLayoutEffect(() => {
    return pollWithAnimationFrame(
      () => {
        const proxy = proxyRef.current
        return Boolean(
          runtime &&
            proxy &&
            proxy.isConnected &&
            glass._parent === container &&
            getScene(glass) === runtime.scene,
        )
      },
      () => {
        const proxy = proxyRef.current
        if (!runtime || !proxy) {
          return
        }

        const tracker = trackElement({
          renderer: runtime.renderer,
          element: proxy,
          glass,
        })
        trackerRef.current = tracker

        return () => {
          tracker.disconnect()
          if (trackerRef.current === tracker) {
            trackerRef.current = null
          }
        }
      },
    )
  }, [container, glass, proxyRef, runtime])

  return trackerRef
}
