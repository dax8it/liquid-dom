export type Point = {
  x: number
  y: number
}

export interface Transform {
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotation: number
  origin: Point
}

export type SurfaceProfile = 'convex' | 'concave' | 'lip'
