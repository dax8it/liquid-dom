import {
  Container as GlassContainer,
  Glass as GlassShape,
  Scene,
} from '../scene'
import type { ContainerProps, GlassProps } from './types'

const DEFAULT_CONTAINER = new GlassContainer()
const DEFAULT_GLASS = new GlassShape()

/**
 * Creates a detached copy of a tint object so prop updates do not retain shared
 * references across containers.
 */
function cloneTint(tint: GlassContainer['tint']) {
  return {
    r: tint.r,
    g: tint.g,
    b: tint.b,
    a: tint.a,
  }
}

/**
 * Walks up from a container or glass node to find the owning {@link Scene}.
 *
 * The React layer uses this to decide whether a node has been fully attached to
 * the current renderer scene before starting tracker work.
 */
export function getScene(node: { _parent: unknown } | Scene | null) {
  let current: { _parent: unknown } | Scene | null = node

  while (current) {
    if (current instanceof Scene) {
      return current
    }

    current = current._parent as { _parent: unknown } | Scene | null
  }

  return null
}

/**
 * Moves a child element to the end of a parent without recreating it.
 *
 * This keeps hidden overlay DOM order aligned with React container order while
 * preserving existing nodes and mounted state.
 */
export function appendNodeToEnd(parent: HTMLElement, child: HTMLElement) {
  if (parent.lastChild === child) {
    return
  }

  parent.append(child)
}

/**
 * Creates the hidden overlay wrapper that receives a single container subtree.
 *
 * The element covers the full root area and acts only as a layout and
 * measurement surface for descendant glass proxies.
 */
export function createOverlayGroupElement() {
  const element = document.createElement('div')
  element.style.position = 'absolute'
  element.style.inset = '0'
  element.style.width = '100%'
  element.style.height = '100%'
  element.style.display = 'block'
  return element
}

/**
 * Creates the host element used for React children rendered inside a glass.
 *
 * This node is handed to the renderer as hosted DOM content, separate from the
 * hidden proxy element that controls glass bounds.
 */
export function createGlassContentElement() {
  const element = document.createElement('div')
  element.style.display = 'block'
  element.style.width = '100%'
  element.style.height = '100%'
  return element
}

/**
 * Ensures a container is attached to the scene and ordered as the last scene child.
 *
 * The React layer uses append-at-end semantics to keep renderer ordering aligned
 * with React render order.
 */
export function syncSceneContainer(scene: Scene, container: GlassContainer) {
  if (container._parent !== scene) {
    container.remove()
    scene.add(container)
    return
  }

  const lastChild = scene._children[scene._children.length - 1]
  if (lastChild === container) {
    return
  }

  scene._children = scene._children.filter((child) => child !== container)
  scene._children.push(container)
  scene._notifyMutation()
}

/**
 * Ensures a glass is attached to its container and ordered as the last child.
 *
 * Re-appending on updates keeps equal-`zIndex` ordering consistent with React
 * child order for the owning container.
 */
export function syncContainerGlass(container: GlassContainer, glass: GlassShape) {
  if (glass._parent !== container) {
    glass.remove()
    container.add(glass)
    return
  }

  const lastChild = container._children[container._children.length - 1]
  if (lastChild === glass) {
    return
  }

  container._children = container._children.filter((child) => child !== glass)
  container._children.push(glass)
  getScene(container)?._notifyMutation()
}

/**
 * Copies React `Container` props onto the backing scene container, filling in
 * omitted values from a default instance.
 */
export function applyContainerProps(target: GlassContainer, props: ContainerProps) {
  target.spacing = props.spacing ?? DEFAULT_CONTAINER.spacing
  target.blur = props.blur ?? DEFAULT_CONTAINER.blur
  target.bezelWidth = props.bezelWidth ?? DEFAULT_CONTAINER.bezelWidth
  target.thickness = props.thickness ?? DEFAULT_CONTAINER.thickness
  target.displacementFactor = props.displacementFactor ?? DEFAULT_CONTAINER.displacementFactor
  target.ior = props.ior ?? DEFAULT_CONTAINER.ior
  target.contentIor = props.contentIor ?? DEFAULT_CONTAINER.contentIor
  target.contentDepth = props.contentDepth ?? DEFAULT_CONTAINER.contentDepth
  target.dispersion = props.dispersion ?? DEFAULT_CONTAINER.dispersion
  target.surfaceProfile = props.surfaceProfile ?? DEFAULT_CONTAINER.surfaceProfile
  target.lightDirection = props.lightDirection ?? DEFAULT_CONTAINER.lightDirection
  target.specularStrength = props.specularStrength ?? DEFAULT_CONTAINER.specularStrength
  target.specularWidth = props.specularWidth ?? DEFAULT_CONTAINER.specularWidth
  target.specularFalloff = props.specularFalloff ?? DEFAULT_CONTAINER.specularFalloff
  target.oppositeSpecularStrength =
    props.oppositeSpecularStrength ?? DEFAULT_CONTAINER.oppositeSpecularStrength
  target.specularSharpness = props.specularSharpness ?? DEFAULT_CONTAINER.specularSharpness
  target.specularOpacity = props.specularOpacity ?? DEFAULT_CONTAINER.specularOpacity
  target.reflectionOffset = props.reflectionOffset ?? DEFAULT_CONTAINER.reflectionOffset
  target.tint = props.tint ? cloneTint(props.tint) : cloneTint(DEFAULT_CONTAINER.tint)
  target.zIndex = props.zIndex ?? DEFAULT_CONTAINER.zIndex
}

/**
 * Copies React `Glass` props onto the backing glass node, filling in omitted
 * values from a default instance.
 */
export function applyGlassProps(target: GlassShape, props: GlassProps) {
  target.cornerRadius = props.cornerRadius ?? DEFAULT_GLASS.cornerRadius
  target.cornerTransitionSpeed =
    props.cornerTransitionSpeed ?? DEFAULT_GLASS.cornerTransitionSpeed
  target.pointerEvents = props.pointerEvents ?? DEFAULT_GLASS.pointerEvents
  target.zIndex = props.zIndex ?? DEFAULT_GLASS.zIndex
}
