import { Dispatch, useEffect } from 'react'
import { SESSION_INITIAL_VALUES } from '_shared/constants/session'
import { SETTINGS_FORM_INITIAL_VALUES } from '_shared/constants/settings'
import { UI_INITIAL_VALUES } from '_shared/constants/ui'
import { setChromeStorageValue } from '_shared/functions/chromeStorage'
import { SessionState } from '_shared/types/session'
import { State } from '_shared/types/state'
import { Setters } from './App'

export const useSyncWithChromeStorage = (
  { setSettings, setUI, setSession }: Setters,
  setIsSyncedWithChromeStorage: Dispatch<React.SetStateAction<boolean>>
) => {
  return useEffect(() => {
    if (!chrome.storage) return

    const initialSyncWithStorage = async () => {
      const localStorageState: State = await chrome.storage.local.get()
      const { settings: settingsFromStorage, ui: uiFromStorage } = localStorageState
      if (!settingsFromStorage && !uiFromStorage) {
        await setChromeStorageValue({ settings: SETTINGS_FORM_INITIAL_VALUES, ui: UI_INITIAL_VALUES }, 'local')
      } else {
        setSettings({ ...SETTINGS_FORM_INITIAL_VALUES, ...settingsFromStorage })
        setUI({ ...UI_INITIAL_VALUES, ...uiFromStorage })
      }

      const sessionStorageState: SessionState = await chrome.storage.session.get()
      if (!sessionStorageState) {
        await setChromeStorageValue(sessionStorageState, 'session')
      } else {
        setSession({ ...SESSION_INITIAL_VALUES })
      }

      setIsSyncedWithChromeStorage(true)
    }

    initialSyncWithStorage()

    chrome.storage.onChanged.addListener((changes, areaName) => {
      console.log({ changes, areaName })

      if (areaName === 'local') {
        const diff = changes as State
        const { settings: settingsUpdateFromStorage } = changes
        if (diff.settings) {
          const { oldValue: oldSettingsInStorage, newValue: newSettingsInStorage } = settingsUpdateFromStorage
          if (JSON.stringify(oldSettingsInStorage) !== JSON.stringify(newSettingsInStorage)) {
            setSettings(newSettingsInStorage)
          }
        }
      } else if (areaName === 'session') {
        if (changes.showRuler != null) {
          const { oldValue: oldSessionInStorage, newValue: newSessionInStorage } = changes
          if (JSON.stringify(oldSessionInStorage) !== JSON.stringify(newSessionInStorage)) {
            setSettings(newSessionInStorage.newValue)
          }
        }
      }

      // if (diff.ui) {
      //     const { oldValue: oldUIInStorage, newValue: newUIInStorage } = uiUpdateFromStorage
      //     if (JSON.stringify(oldUIInStorage) !== JSON.stringify(newUIInStorage)) {
      //         setUI(newUIInStorage)
      //     }
      // }
    })
  }, [setIsSyncedWithChromeStorage, setSession, setSettings, setUI])
}
