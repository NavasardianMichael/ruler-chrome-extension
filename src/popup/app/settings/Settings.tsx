import {
  ChangeEventHandler,
  FocusEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  BINARY_FIELD_NAMES,
  REST_FIELD_NAMES,
  SETTINGS_FORM_INITIAL_VALUES,
  UNITS_TYPES_PROPS,
  UNIT_TYPE_FIELD_NAMES,
  UNIT_TYPE_SELECTION_TEMPLATE,
} from '_shared/constants/settings'
import { UI_INITIAL_VALUES } from '_shared/constants/ui'
import { getChromeLocalStorageValue, setChromeLocalStorageValue } from '_shared/functions/chromeStorage'
import { BinaryFieldName, SettingsState, UnitStepFieldName, UnitType, UnitTypeFieldName } from '_shared/types/settings'
import { Colors } from './sections/Colors'
import { Rotation } from './sections/Rotation'
import { Toggle } from './sections/Toggle'
import { Units } from './sections/Units'
import styles from './settings.module.css'

export type SettingsCommonProps = {
  handleInputChange: ChangeEventHandler<HTMLInputElement>
  handleUnitTypeChange: ChangeEventHandler<HTMLSelectElement>
  handleInputBlur: FocusEventHandler<HTMLInputElement>
  settings: SettingsState
}

export const Settings = () => {
  const [settings, setSettings] = useState(SETTINGS_FORM_INITIAL_VALUES)
  const [isSyncedWithChromeStorage, setIsSyncedWithChromeStorage] = useState(false)

  useEffect(() => {
    const syncChromeStorageToLocalState = async () => {
      const settingsFromStorage = await getChromeLocalStorageValue<SettingsState>('settings')
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
      setChromeLocalStorageValue({ settings: result })
      return result
    })
  }, [])

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const { name, value, min, max } = event.target

      setSettings((prev) => {
        const newState = {
          ...prev,
          [name]: BINARY_FIELD_NAMES.includes(name as BinaryFieldName) ? !prev[name as BinaryFieldName] : value,
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

        setChromeLocalStorageValue({ settings: newState })
        return newState
      })
    },
    [settings.primaryUnit, settings.secondaryUnit]
  )

  const handleInputBlur: FocusEventHandler<HTMLInputElement> = useCallback((event) => {
    if (event.target.value !== '') return
    const name = event.target.name as UnitTypeFieldName
    console.log({ smth: SETTINGS_FORM_INITIAL_VALUES[name], name })

    setSettings((prev) => {
      const newState = {
        ...prev,
        [name]: SETTINGS_FORM_INITIAL_VALUES[name],
      }
      setChromeLocalStorageValue({ settings: newState })
      return newState
    })
  }, [])

  const commonsProps = useMemo(() => {
    return {
      handleInputChange,
      handleUnitTypeChange,
      handleInputBlur,
      settings,
    }
  }, [handleInputBlur, handleInputChange, handleUnitTypeChange, settings])

  const handleResetSettingsClick: MouseEventHandler<HTMLButtonElement> = () => {
    setSettings(SETTINGS_FORM_INITIAL_VALUES)
    setChromeLocalStorageValue({
      settings: SETTINGS_FORM_INITIAL_VALUES,
      ui: UI_INITIAL_VALUES,
    })
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
