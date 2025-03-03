import { useEffect, useMemo, useState } from 'react'
import { SETTINGS_FORM_INITIAL_VALUES } from '_shared/constants/settings'
import { UI_INITIAL_VALUES } from '_shared/constants/ui'
import { setChromeLocalStorageValue } from '_shared/functions/chromeStorage'
import { SettingsState } from '_shared/types/settings'
import { UIState } from '_shared/types/ui'
import { Ruler } from './ruler/Ruler'
import { useSyncWithChromeStorage } from './useSyncWithChromeStorage'

export type Setters = {
  setSettings: (newSettings: Partial<SettingsState>) => void
  setUI: (newUI: Partial<UIState>) => void
}

export const App = () => {
  const [settings, setSettings] = useState(SETTINGS_FORM_INITIAL_VALUES)
  const [ui, setUI] = useState(UI_INITIAL_VALUES)
  const [isSyncedWithChromeStorage, setIsSyncedWithChromeStorage] = useState(false)

  const setters = useMemo(() => {
    return {
      setSettings: (newSettings: Partial<SettingsState>) => {
        setSettings((prev) => {
          const newState: SettingsState = {
            ...prev,
            ...newSettings,
          }
          setChromeLocalStorageValue({ settings: newState })
          return newState
        })
      },
      setUI: (newUI: Partial<UIState>) => {
        setUI((prev) => {
          const newState: UIState = {
            ...prev,
            ...newUI,
          }
          setChromeLocalStorageValue({ ui: newState })
          return newState
        })
      },
    }
  }, [])

  const state = useMemo(() => {
    return { settings, ui }
  }, [settings, ui])

  useSyncWithChromeStorage(setters, setIsSyncedWithChromeStorage)

  useEffect(() => {
    const onKeyPress = (event: KeyboardEvent) => {
      if (!event.ctrlKey || event.key.toLowerCase() !== 'q') return
      setters.setSettings({ showRuler: !settings.showRuler })
    }

    document.addEventListener('keyup', onKeyPress)

    return () => {
      document.removeEventListener('keyup', onKeyPress)
    }
  }, [setSettings, setters, settings.showRuler, state.settings.showRuler])

  if (!settings.showRuler || !isSyncedWithChromeStorage) return null

  return <Ruler state={state} setters={setters} />
}
