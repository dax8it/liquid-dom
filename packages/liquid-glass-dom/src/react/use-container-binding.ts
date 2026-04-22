import { useLayoutEffect, useMemo, useState } from 'react'
import { Container as GlassContainer } from '../scene'
import {
  appendNodeToEnd,
  applyContainerProps,
  createOverlayGroupElement,
  syncSceneContainer,
} from './bindings'
import type { ContainerProps, RootContextValue } from './types'

/**
 * Owns the lifetime of one React `Container` binding.
 *
 * The hook creates the backing scene container, creates the full-size hidden
 * overlay group used for the container's layout subtree, attaches both when the
 * root runtime is ready, and keeps visual props synchronized as React props
 * change.
 */
export function useContainerBinding(root: RootContextValue, props: ContainerProps) {
  const container = useMemo(() => new GlassContainer(), [])
  const overlayGroup = useMemo(createOverlayGroupElement, [])
  const [attached, setAttached] = useState(false)

  useLayoutEffect(() => {
    const runtime = root.runtime
    const overlayHost = root.overlayHostRef.current
    if (!runtime || !overlayHost) {
      return
    }

    appendNodeToEnd(overlayHost, overlayGroup)
    syncSceneContainer(runtime.scene, container)
    setAttached(true)

    return () => {
      overlayGroup.remove()
      container.remove()
    }
  }, [container, overlayGroup, root.runtime, root.overlayHostRef])

  useLayoutEffect(() => {
    const runtime = root.runtime
    const overlayHost = root.overlayHostRef.current

    applyContainerProps(container, props)

    if (runtime) {
      syncSceneContainer(runtime.scene, container)
    }
    if (overlayHost) {
      appendNodeToEnd(overlayHost, overlayGroup)
    }
  }, [
    container,
    overlayGroup,
    props.spacing,
    props.blur,
    props.bezelWidth,
    props.thickness,
    props.displacementFactor,
    props.ior,
    props.contentIor,
    props.contentDepth,
    props.dispersion,
    props.surfaceProfile,
    props.lightDirection,
    props.specularStrength,
    props.specularWidth,
    props.specularFalloff,
    props.oppositeSpecularStrength,
    props.specularSharpness,
    props.specularOpacity,
    props.reflectionOffset,
    props.tint?.r,
    props.tint?.g,
    props.tint?.b,
    props.tint?.a,
    props.zIndex,
    root.runtime,
    root.overlayHostRef,
  ])

  return {
    attached,
    container,
    overlayGroup,
  }
}
