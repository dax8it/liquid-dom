import { composeTransform, identityMatrix, multiplyMatrices, type Matrix2D } from './matrix'
import type { Point, SurfaceProfile, Transform } from './types'

export type GlassInit = Partial<Transform> & {
  width?: number
  height?: number
  cornerRadius?: number
  cornerTransitionSpeed?: number
}

export type ContainerInit = Partial<Transform> & {
  spacing?: number
  blur?: number
  bezelWidth?: number
  thickness?: number
  displacementFactor?: number
  ior?: number
  dispersion?: number
  surfaceProfile?: SurfaceProfile
  lightDirection?: number
  specularStrength?: number
  specularWidth?: number
  specularSharpness?: number
  specularOpacity?: number
  edgeSaturation?: number
  reflectionOffset?: number
  reflectionSaturation?: number
  tint?: number
  tintOpacity?: number
  zIndex?: number
}

export type GroupInit = Partial<Transform>

type SceneChild = Container | Group
type GroupChild = Container | Group

type ParentNode = Scene | Group | Container

type TraversedContainer = {
  container: Container
  transform: Matrix2D
  traversalIndex: number
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function clonePoint(point?: Point): Point {
  return point ? { x: point.x, y: point.y } : { x: 0, y: 0 }
}

function applyTransformDefaults(target: Transform, options: Partial<Transform> | undefined) {
  if (!options) {
    return
  }

  if (options.x !== undefined) {
    target.x = options.x
  }
  if (options.y !== undefined) {
    target.y = options.y
  }
  if (options.scaleX !== undefined) {
    target.scaleX = options.scaleX
  }
  if (options.scaleY !== undefined) {
    target.scaleY = options.scaleY
  }
  if (options.rotation !== undefined) {
    target.rotation = options.rotation
  }
  if (options.origin !== undefined) {
    target.origin = clonePoint(options.origin)
  }
}

function removeFromParent(node: { _parent: ParentNode | null }) {
  const parent = node._parent
  if (!parent) {
    return
  }

  if (parent instanceof Scene || parent instanceof Group) {
    parent._children = parent._children.filter((child) => child !== node)
  } else {
    parent._children = parent._children.filter((child) => child !== node)
  }

  node._parent = null
}

function ensureNoCycle(parent: Group, child: Group) {
  if (parent === child) {
    throw new Error('A Group cannot be added to itself.')
  }

  let current: ParentNode | null = parent
  while (current) {
    if (current === child) {
      throw new Error('A Group cannot be added to one of its descendants.')
    }
    current = '_parent' in current ? current._parent : null
  }
}

export class Glass implements Transform {
  x = 0
  y = 0
  scaleX = 1
  scaleY = 1
  rotation = 0
  origin: Point = { x: 0, y: 0 }

  width = 0
  height = 0
  cornerRadius = 0
  cornerTransitionSpeed = 120

  _parent: Container | null = null

  constructor(options: GlassInit = {}) {
    applyTransformDefaults(this, options)

    if (options.width !== undefined) {
      this.width = options.width
    }
    if (options.height !== undefined) {
      this.height = options.height
    }
    if (options.cornerRadius !== undefined) {
      this.cornerRadius = options.cornerRadius
    }
    if (options.cornerTransitionSpeed !== undefined) {
      this.cornerTransitionSpeed = options.cornerTransitionSpeed
    }
  }

  remove() {
    removeFromParent(this)
  }
}

export class Container implements Transform {
  x = 0
  y = 0
  scaleX = 1
  scaleY = 1
  rotation = 0
  origin: Point = { x: 0, y: 0 }

  spacing = 42.5
  blur = 3.75
  bezelWidth = 13.75
  thickness = 90
  displacementFactor = 1
  ior = 1.5
  dispersion = 0
  surfaceProfile: SurfaceProfile = 'convex'
  lightDirection = toRadians(-52)
  specularStrength = 1.4
  specularWidth = 0.3
  specularSharpness = 2
  specularOpacity = 0.15
  edgeSaturation = 1.7
  reflectionOffset = 18
  reflectionSaturation = 0.7
  tint = 0.15
  tintOpacity = 0.7
  zIndex = 0

  _parent: Scene | Group | null = null
  _children: Glass[] = []

  constructor(options: ContainerInit = {}) {
    applyTransformDefaults(this, options)

    if (options.spacing !== undefined) {
      this.spacing = options.spacing
    }
    if (options.blur !== undefined) {
      this.blur = options.blur
    }
    if (options.bezelWidth !== undefined) {
      this.bezelWidth = options.bezelWidth
    }
    if (options.thickness !== undefined) {
      this.thickness = options.thickness
    }
    if (options.displacementFactor !== undefined) {
      this.displacementFactor = options.displacementFactor
    }
    if (options.ior !== undefined) {
      this.ior = options.ior
    }
    if (options.dispersion !== undefined) {
      this.dispersion = options.dispersion
    }
    if (options.surfaceProfile !== undefined) {
      this.surfaceProfile = options.surfaceProfile
    }
    if (options.lightDirection !== undefined) {
      this.lightDirection = options.lightDirection
    }
    if (options.specularStrength !== undefined) {
      this.specularStrength = options.specularStrength
    }
    if (options.specularWidth !== undefined) {
      this.specularWidth = options.specularWidth
    }
    if (options.specularSharpness !== undefined) {
      this.specularSharpness = options.specularSharpness
    }
    if (options.specularOpacity !== undefined) {
      this.specularOpacity = options.specularOpacity
    }
    if (options.edgeSaturation !== undefined) {
      this.edgeSaturation = options.edgeSaturation
    }
    if (options.reflectionOffset !== undefined) {
      this.reflectionOffset = options.reflectionOffset
    }
    if (options.reflectionSaturation !== undefined) {
      this.reflectionSaturation = options.reflectionSaturation
    }
    if (options.tint !== undefined) {
      this.tint = options.tint
    }
    if (options.tintOpacity !== undefined) {
      this.tintOpacity = options.tintOpacity
    }
    if (options.zIndex !== undefined) {
      this.zIndex = options.zIndex
    }
  }

  add(child: Glass) {
    removeFromParent(child)
    this._children.push(child)
    child._parent = this
    return child
  }

  remove() {
    removeFromParent(this)
  }
}

export class Group implements Transform {
  x = 0
  y = 0
  scaleX = 1
  scaleY = 1
  rotation = 0
  origin: Point = { x: 0, y: 0 }

  _parent: Scene | Group | null = null
  _children: GroupChild[] = []

  constructor(options: GroupInit = {}) {
    applyTransformDefaults(this, options)
  }

  add(child: Container | Group) {
    if (child instanceof Group) {
      ensureNoCycle(this, child)
    }

    removeFromParent(child)
    this._children.push(child)
    child._parent = this
    return child
  }

  remove() {
    removeFromParent(this)
  }
}

export class Scene {
  _children: SceneChild[] = []

  add(child: Container | Group) {
    if (child instanceof Group) {
      let current: ParentNode | null = this
      while (current) {
        if (current === child) {
          throw new Error('A Group cannot be added to one of its descendants.')
        }
        current = '_parent' in current ? current._parent : null
      }
    }

    removeFromParent(child)
    this._children.push(child)
    child._parent = this
    return child
  }
}

export function flattenContainers(scene: Scene): TraversedContainer[] {
  const result: TraversedContainer[] = []

  function visit(children: SceneChild[], parentTransform: Matrix2D) {
    for (const child of children) {
      const nextTransform = multiplyMatrices(parentTransform, composeTransform(child))
      if (child instanceof Group) {
        visit(child._children, nextTransform)
        continue
      }

      result.push({
        container: child,
        transform: nextTransform,
        traversalIndex: result.length,
      })
    }
  }

  visit(scene._children, identityMatrix())
  return result
}
