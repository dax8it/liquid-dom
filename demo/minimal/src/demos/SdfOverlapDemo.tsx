import { useEffect, useRef, useState } from 'react'
import {
  Frame,
  Glass,
  GlassContainer,
  Html,
  LayoutCanvas,
  Transform,
  ZStack,
} from 'liquid-glass-dom/react'
import {
  deleteStoredBackgroundImage,
  loadStoredBackgroundImage,
  saveStoredBackgroundImage,
} from './backgroundImageStore'

const GLASS_WIDTH = 220
const GLASS_HEIGHT = 132
const INITIAL_DISTANCE = -44
const INITIAL_CONTAINER_SPACING = 34
const INITIAL_BLUR = 7
const INITIAL_BEZEL_WIDTH = 18
const INITIAL_DISPLACEMENT_BLUR = 8
const INITIAL_TINT_HEX = '#cfcfcf'
const INITIAL_TINT_OPACITY = 62

export default function SdfOverlapDemo() {
  const [distance, setDistance] = useState(INITIAL_DISTANCE)
  const [containerSpacing, setContainerSpacing] = useState(INITIAL_CONTAINER_SPACING)
  const [blur, setBlur] = useState(INITIAL_BLUR)
  const [bezelWidth, setBezelWidth] = useState(INITIAL_BEZEL_WIDTH)
  const [displacementBlur, setDisplacementBlur] = useState(INITIAL_DISPLACEMENT_BLUR)
  const [tintHex, setTintHex] = useState(INITIAL_TINT_HEX)
  const [tintOpacity, setTintOpacity] = useState(INITIAL_TINT_OPACITY)
  const [showCheckerboard, setShowCheckerboard] = useState(true)
  const [debugDisplacement, setDebugDisplacement] = useState(false)
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null)
  const [backgroundImageName, setBackgroundImageName] = useState('')
  const backgroundImageUrlRef = useRef<string | null>(null)
  const centerOffset = (GLASS_WIDTH + distance) / 2
  const tintColor = hexToRgb(tintHex)

  useEffect(() => {
    let isMounted = true

    loadStoredBackgroundImage()
      .then((storedImage) => {
        if (!isMounted || !storedImage) {
          return
        }

        setBackgroundImage(storedImage.blob, storedImage.name)
      })
      .catch((error: unknown) => {
        console.error(error)
      })

    return () => {
      isMounted = false
      clearBackgroundImageUrl()
    }
  }, [])

  const clearBackgroundImageUrl = () => {
    if (backgroundImageUrlRef.current) {
      URL.revokeObjectURL(backgroundImageUrlRef.current)
      backgroundImageUrlRef.current = null
    }
  }

  const setBackgroundImage = (blob: Blob, name: string) => {
    const nextUrl = URL.createObjectURL(blob)
    clearBackgroundImageUrl()
    backgroundImageUrlRef.current = nextUrl
    setBackgroundImageUrl(nextUrl)
    setBackgroundImageName(name)
  }

  const updateBackgroundImage = (file: File) => {
    setBackgroundImage(file, file.name)
    saveStoredBackgroundImage(file, file.name).catch((error: unknown) => {
      console.error(error)
    })
  }

  const clearBackgroundImage = () => {
    clearBackgroundImageUrl()
    setBackgroundImageUrl(null)
    setBackgroundImageName('')
    deleteStoredBackgroundImage().catch((error: unknown) => {
      console.error(error)
    })
  }

  return (
    <section className="sdf-overlap-demo">
      <LayoutCanvas className="canvas-shell sdf-overlap-canvas-shell" canvasClassName="demo-canvas">
        <ZStack alignment="center">
          {showCheckerboard ? (
            <Html zIndex={-2} sizing="fill">
              <div className="sdf-overlap-checkerboard" />
            </Html>
          ) : null}

          {backgroundImageUrl ? (
            <Html zIndex={-1} sizing="fill">
              <img
                alt=""
                className="sdf-overlap-background-image"
                src={backgroundImageUrl}
              />
            </Html>
          ) : null}

          <Frame maxWidth={Infinity} maxHeight={Infinity}>
            <GlassContainer
              blur={blur}
              spacing={containerSpacing}
              bezelWidth={bezelWidth}
              displacementBlur={displacementBlur}
              thickness={86}
              contentDepth={18}
              debugDisplacement={debugDisplacement}
              tint={{ ...tintColor, a: tintOpacity / 100 }}
              specularOpacity={0.7}
            >
              <ZStack alignment="center">
                <Transform x={-centerOffset}>
                  <OverlapGlass />
                </Transform>
                <Transform x={centerOffset}>
                  <OverlapGlass />
                </Transform>
              </ZStack>
            </GlassContainer>
          </Frame>
        </ZStack>
      </LayoutCanvas>

      <aside className="panel sdf-overlap-controls">
        <Control
          id="sdf-overlap-distance"
          label="Edge distance"
          value={distance}
          min={-GLASS_WIDTH}
          max={180}
          unit="px"
          onChange={setDistance}
        />
        <Control
          id="sdf-container-spacing"
          label="Container spacing"
          value={containerSpacing}
          min={0}
          max={90}
          unit="px"
          onChange={setContainerSpacing}
        />
        <Control
          id="sdf-blur"
          label="Blur"
          value={blur}
          min={0}
          max={80}
          unit="px"
          onChange={setBlur}
        />
        <Control
          id="sdf-bezel-width"
          label="Bezel width"
          value={bezelWidth}
          min={0}
          max={80}
          unit="px"
          onChange={setBezelWidth}
        />
        <Control
          id="sdf-displacement-blur"
          label="Displacement blur"
          value={displacementBlur}
          min={0}
          max={32}
          unit="px"
          onChange={setDisplacementBlur}
        />
        <TintControl
          color={tintHex}
          opacity={tintOpacity}
          onColorChange={setTintHex}
          onOpacityChange={setTintOpacity}
        />
        <Toggle
          id="sdf-checkerboard"
          label="Checkerboard"
          checked={showCheckerboard}
          onChange={setShowCheckerboard}
        />
        <Toggle
          id="sdf-debug-displacement"
          label="Debug displacement"
          checked={debugDisplacement}
          onChange={setDebugDisplacement}
        />
        <BackgroundImageControl
          imageName={backgroundImageName}
          onChange={updateBackgroundImage}
          onClear={clearBackgroundImage}
        />
      </aside>
    </section>
  )
}

function OverlapGlass() {
  return (
    <Glass cornerRadius={42}>
      <Frame width={GLASS_WIDTH} height={GLASS_HEIGHT} />
    </Glass>
  )
}

type ControlProps = {
  id: string
  label: string
  value: number
  min: number
  max: number
  unit: string
  onChange: (value: number) => void
}

function Control({ id, label, value, min, max, unit, onChange }: ControlProps) {
  const [draftValue, setDraftValue] = useState(String(value))

  useEffect(() => {
    setDraftValue(String(value))
  }, [value])

  const updateValue = (nextValue: number) => {
    const clampedValue = Math.min(max, Math.max(min, nextValue))
    onChange(clampedValue)
  }

  return (
    <label className="layout-control sdf-overlap-control" htmlFor={id}>
      <span>{label}</span>
      <output htmlFor={id}>{value}{unit}</output>
      <div className="sdf-overlap-control-row">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step="1"
          value={value}
          onChange={(event) => updateValue(Number(event.currentTarget.value))}
        />
        <input
          aria-label={label}
          className="sdf-overlap-number"
          type="number"
          min={min}
          max={max}
          step="1"
          value={draftValue}
          onBlur={() => setDraftValue(String(value))}
          onChange={(event) => {
            const nextDraftValue = event.currentTarget.value
            setDraftValue(nextDraftValue)

            if (nextDraftValue === '' || nextDraftValue === '-') {
              return
            }

            const nextValue = Number(nextDraftValue)
            if (Number.isFinite(nextValue)) {
              updateValue(nextValue)
            }
          }}
        />
      </div>
    </label>
  )
}

type ToggleProps = {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function Toggle({ id, label, checked, onChange }: ToggleProps) {
  return (
    <label className="sdf-overlap-toggle" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      <span>{label}</span>
    </label>
  )
}

type TintControlProps = {
  color: string
  opacity: number
  onColorChange: (color: string) => void
  onOpacityChange: (opacity: number) => void
}

function TintControl({ color, opacity, onColorChange, onOpacityChange }: TintControlProps) {
  return (
    <div className="layout-control sdf-overlap-tint-control">
      <span id="sdf-tint-label">Glass tint</span>
      <output htmlFor="sdf-tint-color sdf-tint-opacity">{color} / {opacity}%</output>
      <div className="sdf-overlap-tint-row">
        <input
          id="sdf-tint-color"
          type="color"
          value={color}
          aria-labelledby="sdf-tint-label"
          onChange={(event) => onColorChange(event.currentTarget.value)}
        />
        <input
          id="sdf-tint-opacity"
          type="range"
          min={0}
          max={100}
          step={1}
          value={opacity}
          aria-label="Tint opacity"
          onChange={(event) => onOpacityChange(Number(event.currentTarget.value))}
        />
        <input
          aria-label="Tint opacity"
          className="sdf-overlap-number"
          type="number"
          min={0}
          max={100}
          step={1}
          value={opacity}
          onChange={(event) => {
            const nextValue = Number(event.currentTarget.value)

            if (Number.isFinite(nextValue)) {
              onOpacityChange(Math.min(100, Math.max(0, nextValue)))
            }
          }}
        />
      </div>
    </div>
  )
}

type BackgroundImageControlProps = {
  imageName: string
  onChange: (file: File) => void
  onClear: () => void
}

function BackgroundImageControl({ imageName, onChange, onClear }: BackgroundImageControlProps) {
  return (
    <div className="layout-control sdf-overlap-image-control">
      <span id="sdf-background-image-label">Background image</span>
      <output htmlFor="sdf-background-image">{imageName || 'None'}</output>
      <div className="sdf-overlap-image-row">
        <input
          id="sdf-background-image"
          type="file"
          accept="image/*"
          aria-labelledby="sdf-background-image-label"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0]
            event.currentTarget.value = ''

            if (file) {
              onChange(file)
            }
          }}
        />
        <button type="button" onClick={onClear} disabled={!imageName}>
          Clear
        </button>
      </div>
    </div>
  )
}

function hexToRgb(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16)

  return {
    r: ((value >> 16) & 255) / 255,
    g: ((value >> 8) & 255) / 255,
    b: (value & 255) / 255,
  }
}
