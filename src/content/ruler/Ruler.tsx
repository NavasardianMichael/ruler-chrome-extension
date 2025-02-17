import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import {
  COLOR_FIELD_NAMES,
  SETTINGS_FORM_INITIAL_VALUES,
  UNIT_STEP_FIELD_NAMES,
  UNIT_TYPE_FIELD_NAMES,
} from '_shared/constants/settings'
import { UI_INITIAL_VALUES } from '_shared/constants/ui'
import { useSyncWithStorage } from '_shared/hooks/useSyncWithStorage'
import styles from './ruler.module.css'

export const Ruler = () => {
  const [settings, setSettings] = useState(SETTINGS_FORM_INITIAL_VALUES)
  const [ui, setUI] = useState(UI_INITIAL_VALUES)

  const rulerElementRef = useRef<HTMLDivElement>(null)
  const resizeTimeoutRef = useRef<NodeJS.Timeout>(null)

  useSyncWithStorage({ settings })
  useSyncWithStorage({ ui })

  const setUIProps = (newProps: Partial<typeof ui>) => {
    setUI((prev) => ({
      ...prev,
      ...newProps,
    }))
  }

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current)
        }
        resizeTimeoutRef.current = setTimeout(() => {
          setUIProps({
            height,
            width,
          })
        }, 200)
      }
    })
    observer.observe(rulerElementRef.current as HTMLDivElement)
  }, [])

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
  }, [settings])

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
        repeating-linear-gradient(to right, ${color} 0px 1px, transparent 1px ${settings[UNIT_STEP_FIELD_NAMES.primaryUnitStep]}${settings[UNIT_TYPE_FIELD_NAMES.primaryUnit]})
      `,
    }
  }, [settings])

  return (
    <div ref={rulerElementRef} className={styles.ruler} style={rulerStyle}>
      <div className={styles.primaryAxis} style={primaryAxisStyle}>
        Primary Axis
      </div>
      <div className={styles.secondaryAxis} style={secondaryAxisStyle}>
        Secondary Axis
      </div>
    </div>
  )
}
