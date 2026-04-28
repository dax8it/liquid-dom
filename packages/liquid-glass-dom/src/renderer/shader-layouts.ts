import { structLayout, vec4 } from './gpu-layout'

// Source of truth for renderer-side GPU struct layout: these schemas generate
// WGSL declarations and provide the typed writers used by WebGPU buffer uploads.
export const BlurParamsLayout = structLayout({
  params: vec4('directionX', 'directionY', 'radius'),
})

export const GlobalsLayout = structLayout({
  canvas: vec4('width', 'height'),
  shape: vec4('smoothing', 'bezelWidth', 'shapeCount', 'surfaceProfile'),
  glass: vec4('thickness', 'displacementFactor', 'ior', 'dispersion'),
  content: vec4('ior', 'depth'),
  lighting: vec4('x', 'y'),
  specular: vec4('strength', 'width', 'sharpness', 'opacity'),
  specularSecondary: vec4('oppositeStrength', 'falloff', 'reflectionOffset'),
  tint: vec4('r', 'g', 'b', 'a'),
})

export const ShapeDataLayout = structLayout({
  inverse0: vec4('a', 'c', 'e', 'minimumScale'),
  inverse1: vec4('b', 'd', 'f', 'cornerRadius'),
  geometry: vec4('halfWidth', 'halfHeight', 'cornerTransitionSpeed'),
  contentRange: vec4('start', 'count'),
})

export const ContentDataLayout = structLayout({
  inverse0: vec4('a', 'c', 'e', 'copiedWidth'),
  inverse1: vec4('b', 'd', 'f', 'copiedHeight'),
  atlasRect: vec4('u', 'v', 'uScale', 'vScale'),
})

export const BackdropMetricsBoundsLayout = structLayout({
  bounds: vec4('minX', 'minY', 'maxX', 'maxY'),
})

export const HtmlCompositeParamsLayout = structLayout({
  canvas: vec4('width', 'height', 'uScale', 'vScale'),
  inverse0: vec4('a', 'c', 'e', 'copiedWidth'),
  inverse1: vec4('b', 'd', 'f', 'copiedHeight'),
})
