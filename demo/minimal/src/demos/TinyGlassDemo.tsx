import { useEffect, useRef, useState } from 'react'
import { Container, Glass, Html, Renderer, Scene } from 'liquid-glass-dom'

const INITIAL_GLASS_WIDTH = 320
const GLASS_HEIGHT = 188

export default function TinyGlassDemo() {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const glassRef = useRef<Glass | null>(null)
  const glassContentRef = useRef<Html | null>(null)
  const [glassWidth, setGlassWidth] = useState(INITIAL_GLASS_WIDTH)

  useEffect(() => {
    const glass = glassRef.current
    const glassContent = glassContentRef.current
    if (!glass || !glassContent) {
      return
    }

    glass.width = glassWidth
    glassContent.width = glassWidth
  }, [glassWidth])

  useEffect(() => {
    const mount = stageRef.current
    if (!mount) {
      return
    }

    const scene = new Scene()

    const backdropElement = document.createElement('div')
    backdropElement.className = 'tiny-backdrop'
    backdropElement.innerHTML = `
      <div class="tiny-backdrop-copy">
        <span class="eyebrow">html backdrop</span>
        <h1>Liquid glass</h1>
        <p>Scene-level HTML sits behind one glass panel.</p>
      </div>
    `
    const backdrop = scene.add(new Html({
      zIndex: -1,
      element: backdropElement,
    }))

    const container = new Container({
      x: 116,
      y: 196,
      blur: 9,
      spacing: 24,
      bezelWidth: 17,
      thickness: 86,
      contentDepth: 18,
      tint: { r: 0.12, g: 0.16, b: 0.18, a: 0.62 },
      zIndex: 0,
    })

    const glass = new Glass({
      width: glassWidth,
      height: GLASS_HEIGHT,
      cornerRadius: 54,
    })

    const glassContentElement = document.createElement('div')
    glassContentElement.className = 'tiny-glass-content'
    glassContentElement.innerHTML = `
      <span>html inside glass</span>
      <strong>Resizable content panel</strong>
      <p>The slider changes the glass width and this HTML layer follows it.</p>
    `
    const glassContent = new Html({
      width: glassWidth,
      height: GLASS_HEIGHT,
      element: glassContentElement,
    })

    glass.add(glassContent)
    container.add(glass)
    scene.add(container)

    glassRef.current = glass
    glassContentRef.current = glassContent

    const renderer = new Renderer({ scene })
    renderer.canvas.className = 'demo-canvas'
    mount.append(renderer.canvas)

    const syncBackdropSize = () => {
      const bounds = mount.getBoundingClientRect()
      backdrop.width = bounds.width
      backdrop.height = bounds.height
    }
    const resizeObserver = new ResizeObserver(syncBackdropSize)
    resizeObserver.observe(mount)
    syncBackdropSize()

    let frameId = 0
    const frame = () => {
      renderer.render()
      frameId = requestAnimationFrame(frame)
    }
    frame()

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      renderer.destroy()
      glassRef.current = null
      glassContentRef.current = null
    }
  }, [])

  return (
    <section className="tiny-demo">
      <div ref={stageRef} className="canvas-shell tiny-canvas-shell" />

      <aside className="panel tiny-controls">
        <label htmlFor="tiny-glass-width">Glass width</label>
        <div className="tiny-width-readout">{glassWidth}px</div>
        <input
          id="tiny-glass-width"
          type="range"
          min="220"
          max="520"
          step="1"
          value={glassWidth}
          onChange={(event) => setGlassWidth(Number(event.currentTarget.value))}
        />
      </aside>
    </section>
  )
}
