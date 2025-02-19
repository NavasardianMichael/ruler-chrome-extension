import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  COLOR_FIELD_NAMES,
  SETTINGS_FORM_INITIAL_VALUES,
  UNIT_STEP_FIELD_NAMES,
  UNIT_TYPE_FIELD_NAMES,
} from '_shared/constants/settings'
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
  const resizeTimeoutRef = useRef<NodeJS.Timeout>(null)

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

  const state = useMemo(
    () => ({
      settings,
      ui,
    }),
    [settings, ui]
  )
  useSyncLocalStateToChromeStorage(state)

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (!isSyncedWithChromeStorage) return
      for (const entry of entries) {
        const { width, height } = entry.target.getBoundingClientRect()

        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current)
        }
        resizeTimeoutRef.current = setTimeout(() => {
          if (!height || !width) return
          console.log({
            height: Math.round(height),
            width: Math.round(width),
          })
          setUIProps({
            height: Math.round(height),
            width: Math.round(width),
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
      console.log({ changes, areaName })
      if (areaName === 'local' && changes.settings) {
        const newValue = changes.settings.newValue
        setSettings(newValue)
      }
    })
  }, [])

  const rulerStyle: CSSProperties = useMemo(() => {
    const color = settings[COLOR_FIELD_NAMES.color]
    return {
      width: ui.width,
      height: ui.height,
      backgroundColor: settings[COLOR_FIELD_NAMES.background],
      color,
      borderColor: settings[COLOR_FIELD_NAMES.color],
    }
  }, [settings, ui.height, ui.width])

  const primaryAxisStyle: CSSProperties = useMemo(() => {
    const color = settings[COLOR_FIELD_NAMES.color]
    return {
      background: `
        repeating-linear-gradient(to right, ${color} 0px 1px, transparent 1px ${settings[UNIT_STEP_FIELD_NAMES.primaryUnitStep]}${settings[UNIT_TYPE_FIELD_NAMES.primaryUnit]})
      `,
    }
  }, [settings])

  const secondaryAxisStyle: CSSProperties = useMemo(() => {
    const color = settings[COLOR_FIELD_NAMES.color]
    return {
      background: `
        repeating-linear-gradient(to right, ${color} 0px 1px, transparent 1px ${settings[UNIT_STEP_FIELD_NAMES.secondaryUnitStep]}${settings[UNIT_TYPE_FIELD_NAMES.secondaryUnit]})
      `,
    }
  }, [settings])

  return (
    <Draggable>
      <div className={styles.container} hidden={!isSyncedWithChromeStorage}>
        <div
          ref={rulerElementRef}
          className={combineClassNames(styles.ruler, !isSyncedWithChromeStorage && styles.hidden)}
          style={rulerStyle}
        >
          <div className={combineClassNames(styles.axis, styles.primary)} style={primaryAxisStyle}></div>
          <div className={combineClassNames(styles.steps)}>
            {/* {
              settings.
            } */}
          </div>

          <div className={combineClassNames(styles.axis, styles.secondary)} style={secondaryAxisStyle}></div>
        </div>
      </div>
    </Draggable>
  )
}
