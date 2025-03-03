import { CSSProperties, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RULER_SIZINGS } from '_shared/constants/ui'
import { combineClassNames } from '_shared/functions/commons'
import { checkUnitTypeRatioToPx } from '_shared/functions/units'
import { SessionState } from '_shared/types/session'
import { State } from '_shared/types/state'
import { Setters } from '../App'
import { Draggable } from '../draggable/Draggable'
import styles from './ruler.module.css'

export type AppProps = {
  state: State & { session: SessionState }
  setters: Setters
}

export const Ruler: FC<AppProps> = ({ setters, state }) => {
  const { settings, ui } = state
  const { setUI } = setters

  const [scale, setScale] = useState(window.devicePixelRatio)

  const rulerContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const unitByPx = useMemo(
    () => ({
      mm: checkUnitTypeRatioToPx('mm'),
      cm: checkUnitTypeRatioToPx('cm'),
      in: checkUnitTypeRatioToPx('in'),
      pt: checkUnitTypeRatioToPx('pt'),
      px: 1,
    }),
    []
  )

  useEffect(() => {
    if (!ui.height || !ui.width || !rulerContainerRef.current) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (!width || !height) return

        setTimeout(() => {
          if (Math.floor(width) === ui.width && Math.floor(height) === ui.height) return
          setUI({
            height: Math.floor(height),
            width: Math.floor(width),
          })
        }, 1)
      }
    })

    observer.observe(rulerContainerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [setUI, ui.height, ui.width])

  const drawRuler = useCallback(() => {
    if (!canvasRef.current) return
    if (!ui.width || !ui.height) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    ctx.imageSmoothingEnabled = false
    // Handle devicePixelRatio for crisp lines/text.
    const dpr = scale * 2 || 1

    // Set the actual pixel size of the canvas
    canvas.width = ui.width * dpr
    canvas.height = ui.height * dpr

    // Style width/height so it appears the correct size in the layout
    canvas.style.width = ui.width + 'px'
    canvas.style.height = ui.height + 'px'

    // Scale the drawing context so everything lines up to CSS pixels
    ctx.scale(dpr, dpr)

    // Fill background
    ctx.fillStyle = settings.backgroundColor
    ctx.fillRect(0, 0, ui.width, ui.height)

    // Draw the "primary" axis lines
    const primaryStepPx = settings.primaryUnitStep * unitByPx[settings.primaryUnit]
    ctx.fillStyle = settings.color
    ctx.font = '14px Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'

    ctx.beginPath()
    for (let x = RULER_SIZINGS.marginLeft; x <= ui.width; x += primaryStepPx) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, RULER_SIZINGS.primaryUnitHeight)
    }
    ctx.strokeStyle = settings.color
    ctx.stroke()

    // Draw numeric labels for primary axis
    // Some padding from top if desired
    for (let i = 0; i * primaryStepPx <= ui.width; i++) {
      const x = i * primaryStepPx
      // i === 0 => label "0", else label i * step
      const label = i === 0 ? '0' : String(i * settings.primaryUnitStep)
      ctx.fillText(label, x + RULER_SIZINGS.marginLeft - label.length * 4, RULER_SIZINGS.primaryStepOffsetTop)
    }

    // If we show the secondary unit, draw those lines in the same color or slightly distinct
    if (settings.showSecondaryUnit) {
      const secondaryStepPx = settings.secondaryUnitStep * unitByPx[settings.secondaryUnit]

      ctx.beginPath()
      for (let x = RULER_SIZINGS.marginLeft; x <= ui.width; x += secondaryStepPx) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, RULER_SIZINGS.secondaryUnitHeight)
      }
      // Could optionally use a different strokeStyle if you want them distinct
      ctx.strokeStyle = settings.color
      ctx.stroke()
    }

    // Lastly, show unit labels in bottom-left corner or anywhere you like
    const unitsLabel = settings.showSecondaryUnit
      ? `${settings.primaryUnit} (${settings.secondaryUnit})`
      : settings.primaryUnit
    ctx.fillText(unitsLabel, RULER_SIZINGS.marginLeft, ui.height - RULER_SIZINGS.unitsInfoOffsetBottom)

    ctx.translate(0.5, 0.5)
    ctx.translate(-0.5, -0.5)
  }, [
    scale,
    settings.backgroundColor,
    settings.color,
    settings.primaryUnit,
    settings.primaryUnitStep,
    settings.secondaryUnit,
    settings.secondaryUnitStep,
    settings.showSecondaryUnit,
    ui.height,
    ui.width,
    unitByPx,
  ])

  useEffect(() => {
    if (!canvasRef.current) return

    window.requestAnimationFrame(drawRuler)
  }, [
    ui.width,
    ui.height,
    settings.color,
    settings.backgroundColor,
    settings.primaryUnit,
    settings.primaryUnitStep,
    settings.secondaryUnit,
    settings.secondaryUnitStep,
    settings.showSecondaryUnit,
    unitByPx,
    scale,
    drawRuler,
  ])

  const rulerStyle: CSSProperties = useMemo(() => {
    return {
      width: ui.width,
      height: ui.height,
      outlineColor: settings.color,
      // scale: 1 / scale,
    }
  }, [settings.color, ui.height, ui.width])

  useEffect(() => {
    const resizeHandler = () => {
      console.log({ 'window.devicePixelRatio': window.devicePixelRatio })
      setScale(window.devicePixelRatio)
    }
    window.addEventListener('resize', resizeHandler)

    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [])

  return (
    <Draggable state={state} setters={setters}>
      <div className={styles.container}>
        <div
          ref={rulerContainerRef}
          className={combineClassNames(
            styles.ruler,
            +settings.rotationDegree !== 0 && +settings.rotationDegree !== 360 && styles.resizingDisabled
          )}
          style={rulerStyle}
        >
          <canvas ref={canvasRef} />
        </div>
      </div>
    </Draggable>
  )
}
