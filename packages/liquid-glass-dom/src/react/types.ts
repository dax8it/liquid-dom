import type { CSSProperties, MutableRefObject, ReactNode } from 'react'
import type { Renderer } from '../renderer'
import {
  Container as GlassContainer,
  Scene,
  type ContainerInit,
  type GlassInit,
} from '../scene'

export type PlacementMode = 'root' | 'backdrop' | 'container-overlay' | 'glass-content'

export type RootRuntime = {
  scene: Scene
  renderer: Renderer
}

export type RootContextValue = {
  runtime: RootRuntime | null
  canvasHostRef: MutableRefObject<HTMLDivElement | null>
  overlayHostRef: MutableRefObject<HTMLDivElement | null>
}

/**
 * Props for {@link Root}.
 */
export type RootProps = {
  /**
   * Declarative layout content for the liquid glass scene.
   *
   * This subtree is not rendered visibly in the normal DOM. Instead, `Container`
   * and `Glass` use it as a hidden layout tree that measures your React DOM and
   * maps that layout into glass shapes on the canvas.
   */
  children?: ReactNode
  /**
   * DOM content rendered behind the glass effect.
   *
   * Use this for the page or scene background that should be sampled into the
   * liquid glass backdrop.
   */
  backdrop?: ReactNode
  /**
   * Class name applied to the outer wrapper element that owns the canvas and
   * hidden overlay.
   */
  className?: string
  /**
   * Inline styles applied to the outer wrapper element.
   *
   * The root wrapper should usually define the overall width and height of the
   * rendered glass scene.
   */
  style?: CSSProperties
  /**
   * Upper bound for device pixel ratio used by the renderer's internal buffers.
   *
   * Lower values reduce GPU cost. Higher values improve sharpness on dense
   * displays.
   */
  maxDpr?: number
}

/**
 * Props for {@link Container}.
 *
 * A `Container` establishes one hidden layout subtree for a group of `Glass`
 * children. Any regular HTML wrappers inside it can use flexbox, grid, or
 * absolute positioning, and that layout will drive the corresponding glass
 * shapes on the canvas.
 *
 * The styling props on this type control the shared look of the glasses in that
 * container, such as blur, tint, thickness, and other optical settings.
 */
export type ContainerProps = Pick<
  ContainerInit,
  | 'spacing'
  | 'blur'
  | 'bezelWidth'
  | 'thickness'
  | 'displacementFactor'
  | 'ior'
  | 'contentIor'
  | 'contentDepth'
  | 'dispersion'
  | 'surfaceProfile'
  | 'lightDirection'
  | 'specularStrength'
  | 'specularWidth'
  | 'specularFalloff'
  | 'oppositeSpecularStrength'
  | 'specularSharpness'
  | 'specularOpacity'
  | 'reflectionOffset'
  | 'tint'
  | 'zIndex'
> & {
  /**
   * Hidden layout content used to position descendant {@link Glass} components.
   *
   * This subtree is mounted into an invisible overlay above the canvas for
   * measurement only. Its layout is used to size and position the glass shapes,
   * but the overlay itself is not what the user sees.
   */
  children?: ReactNode
}

/**
 * Props for {@link Glass}.
 *
 * A `Glass` renders a hidden proxy element into the container overlay. The
 * proxy element's measured layout determines the screen-space bounds of the
 * visible glass shape on the canvas.
 *
 * `className` and `style` apply to that hidden proxy element. `children` do not
 * render into the proxy. Instead, they become the hosted DOM content rendered
 * inside the glass itself.
 */
export type GlassProps = Pick<
  GlassInit,
  'cornerRadius' | 'cornerTransitionSpeed' | 'pointerEvents' | 'zIndex'
> & {
  /**
   * DOM content rendered inside the glass.
   *
   * This content appears within the glass effect rather than in the hidden
   * layout overlay.
   */
  children?: ReactNode
  /**
   * Class name applied to the hidden proxy element that drives this glass
   * element's layout.
   */
  className?: string
  /**
   * Inline styles applied to the hidden proxy element that drives this glass
   * element's layout.
   *
   * Use this to set width, height, margins, positioning, and other normal DOM
   * layout styles that should determine the glass bounds.
   */
  style?: CSSProperties
}

export type ContainerContextValue = GlassContainer | null
