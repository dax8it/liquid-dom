const FLOATS_PER_VEC4 = 4
const BYTES_PER_FLOAT = Float32Array.BYTES_PER_ELEMENT

// Keeps WGSL vec4-lane structs and TypeScript buffer writes on the same schema.
type Vec4Definition<Fields extends readonly string[]> = {
  readonly type: 'vec4f'
  readonly fields: Fields
}

type StructDefinition = Record<string, Vec4Definition<readonly string[]>>

type StructValues<Definition extends StructDefinition> = {
  [Lane in keyof Definition]: Record<Definition[Lane]['fields'][number], number>
}

export type GpuStructLayout<Definition extends StructDefinition> = {
  readonly floatCount: number
  readonly byteSize: number
  createArray(count?: number): Float32Array
  wgsl(name: string): string
  write(target: Float32Array, values: StructValues<Definition>): void
  writeAt(target: Float32Array, index: number, values: StructValues<Definition>): void
}

export function vec4<const Fields extends readonly string[]>(...fields: Fields): Vec4Definition<Fields> {
  if (fields.length > FLOATS_PER_VEC4) {
    throw new Error('A vec4 layout lane cannot contain more than four fields.')
  }

  return {
    type: 'vec4f',
    fields,
  }
}

export function structLayout<const Definition extends StructDefinition>(
  definition: Definition,
): GpuStructLayout<Definition> {
  const lanes = Object.keys(definition) as Array<keyof Definition & string>
  const floatCount = lanes.length * FLOATS_PER_VEC4
  const byteSize = floatCount * BYTES_PER_FLOAT
  const writeAt = (target: Float32Array, index: number, values: StructValues<Definition>) => {
    const baseOffset = index * floatCount
    if (baseOffset < 0 || baseOffset + floatCount > target.length) {
      throw new RangeError('GPU struct write is outside the target buffer.')
    }

    target.fill(0, baseOffset, baseOffset + floatCount)
    for (let laneIndex = 0; laneIndex < lanes.length; laneIndex += 1) {
      const lane = lanes[laneIndex]
      const fields = definition[lane].fields
      const laneValues = values[lane] as Record<string, number>
      const laneOffset = baseOffset + laneIndex * FLOATS_PER_VEC4

      for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex += 1) {
        target[laneOffset + fieldIndex] = laneValues[fields[fieldIndex]]
      }
    }
  }

  return {
    floatCount,
    byteSize,

    createArray(count = 1) {
      return new Float32Array(Math.max(count, 1) * floatCount)
    },

    wgsl(name: string) {
      const members = lanes.map((lane) => `  ${lane}: vec4f,`).join('\n')
      return `struct ${name} {\n${members}\n};`
    },

    write(target: Float32Array, values: StructValues<Definition>) {
      writeAt(target, 0, values)
    },

    writeAt,
  }
}
