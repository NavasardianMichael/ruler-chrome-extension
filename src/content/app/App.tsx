import { useEffect, useMemo, useState } from 'react'
import { SESSION_INITIAL_VALUES } from '_shared/constants/session'
import { SETTINGS_FORM_INITIAL_VALUES } from '_shared/constants/settings'
import { UI_INITIAL_VALUES } from '_shared/constants/ui'
import { setChromeStorageValue } from '_shared/functions/chromeStorage'
import { SessionState } from '_shared/types/session'
import { SettingsState } from '_shared/types/settings'
import { UIState } from '_shared/types/ui'
import { Ruler } from './ruler/Ruler'
import { useSyncWithChromeStorage } from './useSyncWithChromeStorage'

export type Setters = {
  setSettings: (newSettings: Partial<SettingsState>) => void
  setUI: (newUI: Partial<UIState>) => void
  setSession: (newSession: Partial<SessionState>) => void
}

export const App = () => {
  const [settings, setSettings] = useState(SETTINGS_FORM_INITIAL_VALUES)
  const [ui, setUI] = useState(UI_INITIAL_VALUES)
  const [session, setSession] = useState(SESSION_INITIAL_VALUES)
  const [isSyncedWithChromeStorage, setIsSyncedWithChromeStorage] = useState(false)

  const setters = useMemo(() => {
    return {
      setSettings: (newSettings: Partial<SettingsState>) => {
        setSettings((prev) => {
          const newState: SettingsState = {
            ...prev,
            ...newSettings,
          }
          setChromeStorageValue({ settings: newState }, 'local')
          return newState
        })
      },
      setUI: (newUI: Partial<UIState>) => {
        setUI((prev) => {
          const newState: UIState = {
            ...prev,
            ...newUI,
          }
          setChromeStorageValue({ ui: newState }, 'local')
          return newState
        })
      },
      setSession: (newSession: Partial<SessionState>) => {
        setSession((prev) => {
          const newState: SessionState = {
            ...prev,
            ...newSession,
          }
          setChromeStorageValue({ newState }, 'session')
          return newState
        })
      },
    }
  }, [])

  const state = useMemo(() => {
    return { settings, ui, session }
  }, [session, settings, ui])

  useSyncWithChromeStorage(setters, setIsSyncedWithChromeStorage)

  useEffect(() => {
    const onKeyPress = (event: KeyboardEvent) => {
      if (!event.ctrlKey || event.key.toLowerCase() !== 'q') return
      setters.setSession({ showRuler: !session.showRuler })
    }

    document.addEventListener('keyup', onKeyPress)

    return () => {
      document.removeEventListener('keyup', onKeyPress)
    }
  }, [session.showRuler, setSettings, setters, state.session.showRuler])

  if (!session.showRuler || !isSyncedWithChromeStorage) return null

  return <Ruler state={state} setters={setters} />
}
