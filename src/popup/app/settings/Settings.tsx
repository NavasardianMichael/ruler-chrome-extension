import {
  ChangeEventHandler,
  FocusEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { SESSION_INITIAL_VALUES } from '_shared/constants/session'
import {
  BINARY_FIELD_NAMES,
  REST_FIELD_NAMES,
  SETTINGS_FORM_INITIAL_VALUES,
  UNITS_TYPES_PROPS,
  UNIT_TYPE_FIELD_NAMES,
  UNIT_TYPE_SELECTION_TEMPLATE,
} from '_shared/constants/settings'
import { UI_INITIAL_VALUES } from '_shared/constants/ui'
import { getChromeStorageValue, setChromeStorageValue } from '_shared/functions/chromeStorage'
import { SessionState } from '_shared/types/session'
import { SettingsState, UnitStepFieldName, UnitType, UnitTypeFieldName } from '_shared/types/settings'
import { Colors } from './sections/Colors'
import { Rotation } from './sections/Rotation'
import { Toggle } from './sections/Toggle'
import { Units } from './sections/Units'
import styles from './settings.module.css'

export type SettingsCommonProps = {
  handleInputChange: ChangeEventHandler<HTMLInputElement>
  handleSessionInputChange: ChangeEventHandler<HTMLInputElement>
  handleUnitTypeChange: ChangeEventHandler<HTMLSelectElement>
  handleInputBlur: FocusEventHandler<HTMLInputElement>
  settings: SettingsState
  session: SessionState
}

export const Settings = () => {
  const [settings, setSettings] = useState(SETTINGS_FORM_INITIAL_VALUES)
  const [session, setSession] = useState(SESSION_INITIAL_VALUES)
  const [isSyncedWithChromeStorage, setIsSyncedWithChromeStorage] = useState(false)

  useEffect(() => {
    const syncChromeStorageToLocalState = async () => {
      const settingsFromStorage = await getChromeStorageValue<SettingsState>('settings', 'local')
      setSettings({ ...SETTINGS_FORM_INITIAL_VALUES, ...settingsFromStorage })
      setIsSyncedWithChromeStorage(true)
    }
    syncChromeStorageToLocalState()
  }, [])

  const handleUnitTypeChange: ChangeEventHandler<HTMLSelectElement> = useCallback((event) => {
    const name = event.target.name as UnitTypeFieldName
    const isSecondary = name === UNIT_TYPE_FIELD_NAMES.secondaryUnit
    const value = event.target.value as UnitType
    setSettings((prev) => {
      const result = {
        ...prev,
        [name]: value,
      }
      if (isSecondary) {
        result.secondaryUnitStep = UNITS_TYPES_PROPS.byType[value].minStep
      } else {
        result.primaryUnitStep = UNITS_TYPES_PROPS.byType[value].primaryMinStep
      }
      setChromeStorageValue({ settings: result }, 'local')
      return result
    })
  }, [])

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const { name, value, min, max } = event.target

      setSettings((prev) => {
        const newState = {
          ...prev,
          [name]: typeof name == 'boolean' && BINARY_FIELD_NAMES.includes(name) ? !prev[name] : value,
        }
        if (
          name === REST_FIELD_NAMES.showSecondaryUnit &&
          !prev.showSecondaryUnit &&
          settings.primaryUnit === settings.secondaryUnit
        ) {
          const randomUnit = UNIT_TYPE_SELECTION_TEMPLATE.find((unit) => unit.value !== settings.primaryUnit)
          if (randomUnit) newState.secondaryUnit = randomUnit.value
        }

        if (!isNaN(+min) && !isNaN(+max)) {
          if (+value < +min) newState[name as UnitStepFieldName] = +min
          if (+value > +max) newState[name as UnitStepFieldName] = +max
        }

        setChromeStorageValue({ settings: newState }, 'local')
        return newState
      })
    },
    [settings.primaryUnit, settings.secondaryUnit]
  )

  const handleSessionInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    const { name, value } = event.target
    console.log({ name, value })

    setSession((prev) => {
      const newState = {
        ...prev,
        [name]: typeof name == 'boolean' && BINARY_FIELD_NAMES.includes(name) ? !prev[name] : value,
      }
      console.log({ newState })

      setChromeStorageValue({ settings: newState }, 'session')
      return newState
    })
  }, [])

  const handleInputBlur: FocusEventHandler<HTMLInputElement> = useCallback((event) => {
    if (event.target.value !== '') return
    const name = event.target.name as UnitTypeFieldName

    setSettings((prev) => {
      const newState = {
        ...prev,
        [name]: SETTINGS_FORM_INITIAL_VALUES[name],
      }
      setChromeStorageValue({ settings: newState }, 'local')
      return newState
    })
  }, [])

  const commonsProps = useMemo(() => {
    return {
      handleInputChange,
      handleSessionInputChange,
      handleUnitTypeChange,
      handleInputBlur,
      settings,
      session,
    }
  }, [handleInputBlur, handleInputChange, handleSessionInputChange, handleUnitTypeChange, session, settings])

  const handleResetSettingsClick: MouseEventHandler<HTMLButtonElement> = () => {
    setSettings(SETTINGS_FORM_INITIAL_VALUES)
    setChromeStorageValue(
      {
        settings: SETTINGS_FORM_INITIAL_VALUES,
        ui: UI_INITIAL_VALUES,
      },
      'local'
    )
  }

  if (!isSyncedWithChromeStorage) return null

  return (
    <main className={styles.settings}>
      <Toggle {...commonsProps} />
      <Units {...commonsProps} />
      <Rotation {...commonsProps} />
      <Colors {...commonsProps} />
      <button className={styles.resetBtn} onClick={handleResetSettingsClick}>
        Reset Settings
      </button>
    </main>
  )
}
