import { useContext, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Glass as GlassShape } from '../scene'
import { createGlassContentElement } from './bindings'
import {
  ContainerContext,
  PlacementContext,
  RootContext,
  usePlacement,
  useRootContext,
} from './context'
import type { ContainerProps, GlassProps, RootProps } from './types'
import { useContainerBinding } from './use-container-binding'
import { useGlassBinding } from './use-glass-binding'
import { useGlassContentRoot } from './use-glass-content-root'
import { useGlassTracker } from './use-glass-tracker'
import { useRootRuntime } from './use-root-runtime'

export type { ContainerProps, GlassProps, RootProps } from './types'

/**
 * Mounts the liquid-glass scene into a React tree.
 *
 * `Root` creates the renderer, owns the canvas, starts the render loop, and
 * sets up the hidden overlay used to measure layout for descendant
 * {@link Container} and {@link Glass} components.
 *
 * It manages three DOM domains:
 * - `backdrop` renders behind the effect and becomes the sampled glass backdrop.
 * - `Container` children render into a hidden overlay used only for layout and measurement.
 * - `Glass` children render inside the visible glass content hosts.
 */
export function Root({
  children,
  backdrop,
  className,
  style,
  maxDpr,
}: RootProps) {
  const rootContext = useRootRuntime(maxDpr)

  return (
    <RootContext.Provider value={rootContext}>
      <div className={className} style={{ position: 'relative', ...style }}>
        <div
          ref={rootContext.canvasHostRef}
          style={{
            position: 'absolute',
            inset: 0,
          }}
        />
        <div
          ref={rootContext.overlayHostRef}
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            visibility: 'hidden',
          }}
        />
        <div style={{ display: 'none' }}>
          <PlacementContext.Provider value="root">{children}</PlacementContext.Provider>
        </div>
        {rootContext.runtime
          ? createPortal(
              <PlacementContext.Provider value="backdrop">{backdrop}</PlacementContext.Provider>,
              rootContext.runtime.renderer.htmlRoot,
            )
          : null}
      </div>
    </RootContext.Provider>
  )
}

/**
 * Groups a set of glasses under shared visual styling and a shared hidden layout subtree.
 *
 * Render normal React DOM wrappers inside `Container` to lay out descendant
 * {@link Glass} components with flexbox, grid, or absolute positioning. The
 * measured DOM layout is mirrored into glass shapes on the canvas.
 */
export function Container(props: ContainerProps) {
  usePlacement('Container', 'root')
  const root = useRootContext('Container')
  const { attached, container, overlayGroup } = useContainerBinding(root, props)

  if (!attached) {
    return null
  }

  return createPortal(
    <ContainerContext.Provider value={container}>
      <PlacementContext.Provider value="container-overlay">
        {props.children}
      </PlacementContext.Provider>
    </ContainerContext.Provider>,
    overlayGroup,
  )
}

/**
 * Renders one glass shape whose bounds are driven by a hidden proxy element.
 *
 * The component itself inserts an invisible DOM node into the surrounding
 * `Container` overlay. That proxy node uses normal browser layout, and its
 * measured position and size are tracked into the canvas-rendered glass shape.
 *
 * Any React children passed to `Glass` render inside the glass as hosted DOM
 * content, not inside the hidden proxy node.
 */
export function Glass({ children, className, style, ...props }: GlassProps) {
  usePlacement('Glass', 'container-overlay')
  const root = useRootContext('Glass')
  const container = useContext(ContainerContext)
  if (!container) {
    throw new Error('<Glass> must be rendered inside a <Container>.')
  }

  const glass = useMemo(() => new GlassShape(), [])
  const proxyRef = useRef<HTMLDivElement | null>(null)
  const contentElement = useMemo(createGlassContentElement, [])
  const trackerRef = useGlassTracker({
    runtime: root.runtime,
    container,
    glass,
    proxyRef,
  })
  const hasContent = useGlassContentRoot({
    children,
    contentElement,
    rootContext: root,
  })

  useGlassBinding({
    container,
    glass,
    props,
    runtime: root.runtime,
    hasContent,
    contentElement,
    trackerRef,
  })

  return <div ref={proxyRef} className={className} style={style} />
}
