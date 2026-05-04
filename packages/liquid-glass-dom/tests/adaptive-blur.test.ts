import { describe, expect, it } from 'vitest'
import { chooseAdaptiveBlurLevel } from '../src/renderer/adaptive-blur'

describe('adaptive blur level selection', () => {
  it('skips blur for zero radius', () => {
    expect(chooseAdaptiveBlurLevel(0, 4)).toEqual({
      skip: true,
      level: 0,
      scale: 1,
      effectiveRadius: 0,
    })
  })

  it('keeps an 8px radius at full resolution', () => {
    expect(chooseAdaptiveBlurLevel(8, 4)).toEqual({
      skip: false,
      level: 0,
      scale: 1,
      effectiveRadius: 8,
    })
  })

  it('moves a 16px radius to the first downsample level', () => {
    expect(chooseAdaptiveBlurLevel(16, 4)).toEqual({
      skip: false,
      level: 1,
      scale: 2,
      effectiveRadius: 8,
    })
  })

  it('clamps very large radii to the available chain', () => {
    expect(chooseAdaptiveBlurLevel(4096, 3)).toEqual({
      skip: false,
      level: 3,
      scale: 8,
      effectiveRadius: 512,
    })
  })

  it('treats non-finite radii as a skipped blur', () => {
    expect(chooseAdaptiveBlurLevel(Number.NaN, 4)).toEqual({
      skip: true,
      level: 0,
      scale: 1,
      effectiveRadius: 0,
    })
  })
})
