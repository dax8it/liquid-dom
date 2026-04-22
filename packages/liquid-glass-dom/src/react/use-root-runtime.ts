import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Renderer } from '../renderer'
import { Scene } from '../scene'
import type { RootContextValue, RootRuntime } from './types'

/**
 * Creates and owns the renderer runtime for {@link Root}.
 *
 * The hook is responsible for:
 * - creating the scene and renderer once
 * - mounting the renderer canvas into the root host
 * - keeping `maxDpr` in sync with prop updates
 * - driving continuous rendering with `requestAnimationFrame`
 */
export function useRootRuntime(maxDpr?: number): RootContextValue {
  const canvasHostRef = useRef<HTMLDivElement | null>(null)
  const overlayHostRef = useRef<HTMLDivElement | null>(null)
  const [runtime, setRuntime] = useState<RootRuntime | null>(null)

  useLayoutEffect(() => {
    const canvasHost = canvasHostRef.current
    if (!canvasHost) {
      return
    }

    const scene = new Scene()
    const renderer = new Renderer({
      scene,
      maxDpr,
    })

    renderer.canvas.style.position = 'absolute'
    renderer.canvas.style.inset = '0'
    renderer.canvas.style.width = '100%'
    renderer.canvas.style.height = '100%'
    renderer.canvas.style.display = 'block'

    canvasHost.append(renderer.canvas)
    setRuntime({ scene, renderer })

    return () => {
      renderer.destroy()
      renderer.canvas.remove()
    }
  }, [])

  useLayoutEffect(() => {
    if (!runtime) {
      return
    }

    runtime.renderer.maxDpr = maxDpr ?? 2
  }, [runtime, maxDpr])

  useEffect(() => {
    if (!runtime) {
      return
    }

    let frameId = 0
    const frame = () => {
      runtime.renderer.render()
      frameId = requestAnimationFrame(frame)
    }

    frameId = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [runtime])

  return useMemo(
    () => ({
      runtime,
      canvasHostRef,
      overlayHostRef,
    }),
    [runtime],
  )
}
