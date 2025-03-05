import { Dispatch, useEffect } from 'react'
import { SETTINGS_FORM_INITIAL_VALUES } from '_shared/constants/settings'
import { UI_INITIAL_VALUES } from '_shared/constants/ui'
import { setChromeLocalStorageValue } from '_shared/functions/chromeStorage'
import { State } from '_shared/types/state'
import { Setters } from './App'

export const useSyncWithChromeStorage = (
  { setSettings, setUI }: Setters,
  setIsSyncedWithChromeStorage: Dispatch<React.SetStateAction<boolean>>
) => {
  return useEffect(() => {
    if (!chrome.storage) return

    const initialSyncWithStorage = async () => {
      const state: State = await chrome.storage.local.get()
      const { settings: settingsFromStorage, ui: uiFromStorage } = state
      if (!settingsFromStorage && !uiFromStorage) {
        await setChromeLocalStorageValue({ settings: SETTINGS_FORM_INITIAL_VALUES, ui: UI_INITIAL_VALUES })
      } else {
        setSettings({ ...SETTINGS_FORM_INITIAL_VALUES, ...settingsFromStorage }, true)
        setUI({ ...UI_INITIAL_VALUES, ...uiFromStorage }, true)
      }
      setIsSyncedWithChromeStorage(true)
    }

    initialSyncWithStorage()

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') return
      const diff = changes as State
      console.log({ changes, areaName })

      const { settings: settingsUpdateFromStorage } = changes
      if (diff.settings) {
        const { oldValue: oldSettingsInStorage, newValue: newSettingsInStorage } = settingsUpdateFromStorage
        if (JSON.stringify(oldSettingsInStorage) !== JSON.stringify(newSettingsInStorage)) {
          setSettings(newSettingsInStorage)
        }
      }

      // if (diff.ui) {
      //     console.log({ "diff.ui": diff.ui });

      //     const { oldValue: oldUIInStorage, newValue: newUIInStorage } = uiUpdateFromStorage
      //     if (JSON.stringify(oldUIInStorage) !== JSON.stringify(newUIInStorage)) {
      //         setUI(newUIInStorage)
      //     }
      // }
    })
  }, [setIsSyncedWithChromeStorage, setSettings, setUI])
}
