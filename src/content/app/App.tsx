import { useCallback, useEffect, useState } from 'react'
import { SETTINGS_FORM_INITIAL_VALUES } from '_shared/constants/settings'
import { UI_INITIAL_VALUES } from '_shared/constants/ui'
import { getStorageValue, setStorageValue } from '_shared/functions/chromeStorage'
import { SettingsState } from '_shared/types/settings'
import { State } from '_shared/types/state'
import { Ruler } from './ruler/Ruler'

export const App = () => {
  const [isRulerShown, setIsRulerShown] = useState(false)

  useEffect(() => {
    if (!chrome.storage) return

    const sync = async () => {
      const settingsFromStorage = await getStorageValue<SettingsState>('settings')
      setIsRulerShown((settingsFromStorage ?? UI_INITIAL_VALUES).toggleRuler)
    }
    sync()

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes.settings) {
        const { oldValue, newValue } = changes.settings
        if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return
        setIsRulerShown(newValue.toggleRuler)
      }
    })
  }, [])

  const toggleRuler = useCallback(async () => {
    const state: State = await chrome.storage.local.get()
    const { settings, ui } = state
    if (!settings && !ui) {
      setStorageValue({
        settings: {
          ...SETTINGS_FORM_INITIAL_VALUES,
          toggleRuler: !(state?.settings?.toggleRuler ?? SETTINGS_FORM_INITIAL_VALUES.toggleRuler),
        },
        ui: UI_INITIAL_VALUES,
      })
    } else {
      setStorageValue({
        settings: {
          ...state.settings,
          toggleRuler: !(state?.settings?.toggleRuler ?? SETTINGS_FORM_INITIAL_VALUES.toggleRuler),
        },
      })
    }
  }, [])

  useEffect(() => {
    const onKeyPress = (event: KeyboardEvent) => {
      if (!event.ctrlKey || event.key.toLowerCase() !== 'q') return
      toggleRuler()
    }

    document.addEventListener('keyup', onKeyPress)

    return () => {
      document.removeEventListener('keyup', onKeyPress)
    }
  }, [toggleRuler])

  if (!isRulerShown) return null

  return <Ruler toggleRuler={toggleRuler} />
}
