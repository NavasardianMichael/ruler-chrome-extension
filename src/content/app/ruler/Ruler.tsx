import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { SETTINGS_FORM_INITIAL_VALUES, UNIT_CONVERSION_FACTORS_BY_PX } from '_shared/constants/settings'
import { UI_INITIAL_VALUES } from '_shared/constants/ui'
import { getStorageValue } from '_shared/functions/chromeStorage'
import { combineClassNames } from '_shared/functions/commons'
import { useSyncLocalStateToChromeStorage } from '_shared/hooks/useSyncLocalStateToChromeStorage'
import { SettingsState } from '_shared/types/settings'
import { UIState } from '_shared/types/ui'

import { Draggable } from '../draggable/Draggable'
import styles from './ruler.module.css'

export const Ruler = () => {
  const [settings, setSettings] = useState(SETTINGS_FORM_INITIAL_VALUES)
  const [ui, setUI] = useState(UI_INITIAL_VALUES)
  const [isSyncedWithChromeStorage, setIsSyncedWithChromeStorage] = useState(false)
  
  const rulerElementRef = useRef<HTMLDivElement>(null)
  
  const syncLocalStateToChromeStorage = useSyncLocalStateToChromeStorage()
  
  const setUIProps = useCallback((newProps: Partial<typeof ui>) => {
    setUI((prev) => {
      const newState = {
        ...prev,
        ...newProps,
      }
      if (JSON.stringify(newState) === JSON.stringify(prev)) return prev
      syncLocalStateToChromeStorage({ui: newState})
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
    if (!ui.height || !ui.width || (ui.rotationDegree !== 0 && ui.rotationDegree !== 360)) return
    if (!isSyncedWithChromeStorage) return
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.target.getBoundingClientRect()
        setTimeout(() => {
      if(Math.floor(width) === ui.width && Math.floor(height) === ui.height) return
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
  }, [isSyncedWithChromeStorage, setUIProps, ui.height, ui.rotationDegree, ui.width])

  useEffect(() => {
    if (!chrome.storage) return
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes.settings) {
        const {oldValue, newValue }= changes.settings
        
        if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return
        console.log('chrome.storage.onChanged: ')
        console.log({oldValue,newValue, });
        setSettings(newValue)
      }
    })
  }, [])

  const containerStyle: CSSProperties = useMemo(() => {
    return {
      transform: `rotate(${settings.rotationDegree}deg)`,
    }
  }, [ settings.rotationDegree])
  
  const rulerStyle: CSSProperties = useMemo(() => {
    return {
      width: ui.width,
      height: ui.height,
      backgroundColor: settings.backgroundColor,
      color: settings.color,
      outlineColor: settings.color,
    }
  }, [settings.color,settings.backgroundColor, ui.height, ui.width])

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

  return (
    <Draggable>
      <div className={styles.container} hidden={!isSyncedWithChromeStorage} style={containerStyle}>
        <div
          ref={rulerElementRef}
          className={combineClassNames(
            styles.ruler,
            !isSyncedWithChromeStorage && styles.hidden,
            settings.rotationDegree !== 0 && settings.rotationDegree !== 360 && styles.resizingDisabled
          )}
          style={rulerStyle}
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
      </div>
    </Draggable>
  )
}
