import { CSSProperties, MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SETTINGS_FORM_INITIAL_VALUES, UNIT_CONVERSION_FACTORS_BY_PX } from '_shared/constants/settings'
import { UI_INITIAL_VALUES } from '_shared/constants/ui'
import { getStorageValue } from '_shared/functions/chromeStorage'
import { combineClassNames } from '_shared/functions/commons'
import RotateIcon from '_shared/icons/rotate.svg'
import { useSyncLocalStateToChromeStorage } from '_shared/hooks/useSyncLocalStateToChromeStorage'
import { SettingsState } from '_shared/types/settings'
import { UIState } from '_shared/types/ui'
import { Draggable } from '../draggable/Draggable'
import styles from './ruler.module.css'

function getAngleBetweenPoints(x1: number, y1: number, x2: number, y2: number): number {
  const deltaX = x2 - x1
  const deltaY = y2 - y1

  // Get the angle in radians
  const angleRadians = Math.atan2(deltaY, deltaX)

  // Convert to degrees
  const angleDegrees = (angleRadians * 180) / Math.PI

  // angleDegrees may be negative, depending on the quadrant.
  // If you want a 0–360 range instead:
  return (angleDegrees + 360) % 360
}

export const Ruler = () => {
  const [settings, setSettings] = useState(SETTINGS_FORM_INITIAL_VALUES)
  const [ui, setUI] = useState(UI_INITIAL_VALUES)
  const [isSyncedWithChromeStorage, setIsSyncedWithChromeStorage] = useState(false)
  const [isRotating, setIsRotating] = useState(false)

  const rulerElementRef = useRef<HTMLDivElement>(null)

  useSyncLocalStateToChromeStorage({
    settings,
    ui,
  })

  const setUIProps = useCallback((newProps: Partial<typeof ui>) => {
    setUI((prev) => {
      const newState = {
        ...prev,
        ...newProps,
      }
      if (JSON.stringify(newState) === JSON.stringify(prev)) return prev
      return newState
    })
  }, [])

  useEffect(() => {
    const syncChromeStorageToLocalState = async () => {
      const settingsFromStorage = await getStorageValue<SettingsState>('settings')
      const uiFromStorage = await getStorageValue<UIState>('ui')
      setSettings({ ...SETTINGS_FORM_INITIAL_VALUES, ...settingsFromStorage })
      setUI({ ...UI_INITIAL_VALUES, ...uiFromStorage })
      setIsSyncedWithChromeStorage(true)
    }
    syncChromeStorageToLocalState()
  }, [])

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (!isSyncedWithChromeStorage) return
      for (const entry of entries) {
        const { width, height } = entry.target.getBoundingClientRect()
        // console.log({ width, height })

        setTimeout(() => {
          if (!height || !width) return
          console.log({
            height: height,
            width: width,
          })
          setUIProps({
            height: Math.floor(height),
            width: Math.floor(width),
          })
        }, 0)
      }
    })
    observer.observe(rulerElementRef.current as HTMLDivElement)

    return () => {
      observer?.disconnect()
    }
  }, [isSyncedWithChromeStorage, setUIProps])

  useEffect(() => {
    if (!chrome.storage) return
    chrome.storage.onChanged.addListener((changes, areaName) => {
      console.log(changes, areaName)
      if (areaName === 'local' && changes.settings) {
        const newSettings = changes.settings.newValue
        const newUI = changes.ui.newValue
        setSettings(newSettings)
        setUI(newUI)
      }
    })
  }, [])

  const rulerStyle: CSSProperties = useMemo(() => {
    return {
      width: ui.width,
      height: ui.height,
      backgroundColor: settings.backgroundColor,
      color: settings.color,
      borderColor: settings.color,
      // transform: `rotate(${settings.rotationDegree}deg)`,
    }
  }, [settings, ui.height, ui.width])

  const primaryAxisStyle: CSSProperties = useMemo(() => {
    const color = settings.color
    return {
      background: `
        repeating-linear-gradient(
          to right, 
          ${color} 0px 1px, 
          transparent 1px ${settings.primaryUnitStep}${settings.primaryUnit})
      `,
    }
  }, [settings])

  const secondaryAxisStyle: CSSProperties = useMemo(() => {
    const color = settings.color
    return {
      background: `
        repeating-linear-gradient(
          to right, 
          ${color} 0px 1px, 
          transparent 1px ${settings.secondaryUnitStep}${settings.secondaryUnit})
      `,
    }
  }, [settings])

  const primaryUnitStepsToPaint = useMemo(() => {
    const stepsCount = Math.ceil(
      ui.width / UNIT_CONVERSION_FACTORS_BY_PX[settings.primaryUnit] / settings.primaryUnitStep
    )
    const steps = new Array(stepsCount).fill(undefined).map((_, i) => i++)
    return steps
  }, [settings.primaryUnit, settings.primaryUnitStep, ui.width])

  useEffect(() => {
    const mouseMoveHandler = (e: MouseEvent) => {
      e.stopPropagation()
      if (!containerRef.current || !rotationButtonRef.current) return
      const mouseX = e.clientX
      const mouseY = e.clientY
      const { left, bottom } = rotationButtonRef.current.getBoundingClientRect()
      const angleFromButton = getAngleBetweenPoints(ui.left + ui.width / 2, ui.top + ui.height / 2, left, bottom)
      const turretAngle =
        Math.atan2(mouseX - ui.left - ui.width / 2, -(mouseY - ui.top - ui.height / 2)) * (360 / Math.PI)
      console.log({ turretAngle, angleFromButton })

      setUIProps({ rotationDegree: turretAngle - angleFromButton + 90 })
    }

    const handleRotationMouseUp = (e: MouseEvent) => {
      e.stopPropagation()
      setIsRotating(false)
    }

    if (!isRotating) {
      document.removeEventListener('mousemove', mouseMoveHandler)
      document.removeEventListener('mouseup', handleRotationMouseUp)
      return
    }
    document.addEventListener('mousemove', mouseMoveHandler)
    document.addEventListener('mouseup', handleRotationMouseUp)

    return () => {
      document.removeEventListener('mousemove', mouseMoveHandler)
      document.removeEventListener('mouseup', handleRotationMouseUp)
    }
  }, [isRotating, setUIProps, ui.height, ui.left, ui.top, ui.width])

  const handleRotationMouseDown: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    setIsRotating(true)
  }
  console.log({ 'ui.rotationDegree': ui.rotationDegree })

  const containerRef = useRef<HTMLDivElement>(null)
  const rotationButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <Draggable>
      <div className={styles.container} ref={containerRef} style={{ rotate: `${ui.rotationDegree}deg` }}>
        <div
          ref={rulerElementRef}
          className={combineClassNames(styles.ruler, !isSyncedWithChromeStorage && styles.hidden)}
          style={rulerStyle}
          hidden={!isSyncedWithChromeStorage}
        >
          <div className={combineClassNames(styles.axis, styles.primary)} style={primaryAxisStyle}></div>

          <div
            className={combineClassNames(styles.steps)}
            style={{ gap: `calc(${settings.primaryUnitStep}${settings.primaryUnit} - 1px)` }}
          >
            {primaryUnitStepsToPaint.map((stepNumber) => {
              return (
                <span
                  key={stepNumber}
                  className={styles.step}
                  style={{
                    color: settings.color,
                    left: `calc(${stepNumber * settings.primaryUnitStep}${settings.primaryUnit} - 1px)`,
                  }}
                >
                  {stepNumber}
                </span>
              )
            })}
          </div>

          <h1 className={styles.presentational} style={{ color: settings.color }}>
            ©2025 | navasardianmichael@gmail.com
          </h1>

          <div className={combineClassNames(styles.axis, styles.secondary)} style={secondaryAxisStyle}></div>
        </div>
        <button
          ref={rotationButtonRef}
          className={combineClassNames(styles.rotationBtn, isRotating && styles.active)}
          onMouseDown={handleRotationMouseDown}
        >
          <RotateIcon />
        </button>
      </div>
    </Draggable>
  )
}
