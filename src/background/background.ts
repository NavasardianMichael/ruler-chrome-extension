import { SESSION_INITIAL_VALUES } from '_shared/constants/session'
import { SETTINGS_FORM_INITIAL_VALUES } from '_shared/constants/settings'
import { UI_INITIAL_VALUES } from '_shared/constants/ui'
import { setChromeStorageValue } from '_shared/functions/chromeStorage'

chrome.runtime.onInstalled.addListener(() => {
  setChromeStorageValue(SESSION_INITIAL_VALUES, 'session')
  setChromeStorageValue(
    {
      settings: SETTINGS_FORM_INITIAL_VALUES,
      ui: UI_INITIAL_VALUES,
    },
    'local'
  )
})
