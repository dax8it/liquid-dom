import { useLayoutEffect, type MutableRefObject } from 'react'
import { Glass as GlassShape, type Container as GlassContainer } from '../scene'
import type { ElementTracker } from '../track-element'
import { applyGlassProps, syncContainerGlass } from './bindings'
import type { GlassProps, RootRuntime } from './types'

type UseGlassBindingParams = {
  container: GlassContainer
  glass: GlassShape
  props: GlassProps
  runtime: RootRuntime | null
  hasContent: boolean
  contentElement: HTMLDivElement
  trackerRef: MutableRefObject<ElementTracker | null>
}

/**
 * Keeps a React `Glass` component synchronized with its backing glass node.
 *
 * This hook handles scene attachment, prop updates, hosted-content assignment,
 * and teardown. It also triggers tracker refreshes after relevant changes so
 * the measured proxy DOM stays mapped to the current glass node.
 */
export function useGlassBinding({
  container,
  glass,
  props,
  runtime,
  hasContent,
  contentElement,
  trackerRef,
}: UseGlassBindingParams) {
  useLayoutEffect(() => {
    if (!runtime) {
      return
    }

    syncContainerGlass(container, glass)

    return () => {
      trackerRef.current?.disconnect()
      trackerRef.current = null
      glass.clearContent()
      glass.remove()
    }
  }, [container, glass, runtime, trackerRef])

  useLayoutEffect(() => {
    applyGlassProps(glass, props)
    glass.setContent(hasContent ? contentElement : null)

    if (runtime) {
      syncContainerGlass(container, glass)
    }

    trackerRef.current?.update()
  }, [
    container,
    contentElement,
    glass,
    hasContent,
    props.cornerRadius,
    props.cornerTransitionSpeed,
    props.pointerEvents,
    props.zIndex,
    runtime,
    trackerRef,
  ])
}
