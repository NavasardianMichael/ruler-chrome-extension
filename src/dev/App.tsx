import { useEffect, useMemo, useState } from 'react'
import { SETTINGS_FORM_INITIAL_VALUES } from '_shared/constants/settings'
import { UI_INITIAL_VALUES } from '_shared/constants/ui'
import { Ruler } from 'content/app/ruler/Ruler'
import { SettingsState } from '_shared/types/settings'
import { UIState } from '_shared/types/ui'

export type Setters = {
  setSettings: (newSettings: Partial<SettingsState>) => void
  setUI: (newUI: Partial<UIState>) => void
}

export const App = () => {
  const [settings, setSettings] = useState(SETTINGS_FORM_INITIAL_VALUES)
  const [ui, setUI] = useState(UI_INITIAL_VALUES)

  const setters = useMemo(() => {
    return {
      setSettings: (newSettings: Partial<SettingsState>) => {
        return setSettings((prev) => ({ ...prev, ...newSettings }))
      },
      setUI: (newUI: Partial<UIState>) => {
        return setUI((prev) => ({ ...prev, ...newUI }))
      },
    }
  }, [])

  const state = useMemo(() => {
    return { settings, ui }
  }, [settings, ui])

  useEffect(() => {
    const onKeyPress = (event: KeyboardEvent) => {
      console.log({ event })

      if (!event.ctrlKey || event.key.toLowerCase() !== 'q') return
      setters.setSettings({ toggleRuler: !settings.toggleRuler })
    }

    document.addEventListener('keyup', onKeyPress)

    return () => {
      document.removeEventListener('keyup', onKeyPress)
    }
  }, [setSettings, setters, settings.toggleRuler, state.settings.toggleRuler])

  console.log(settings.toggleRuler)
  if (!settings.toggleRuler) return null

  return <Ruler state={state} setters={setters} />
}
