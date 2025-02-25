import { ChangeEventHandler, MouseEventHandler, useCallback, useEffect, useMemo, useState } from 'react'
import {
  BINARY_FIELD_NAMES,
  REST_FIELD_NAMES,
  SETTINGS_FORM_INITIAL_VALUES,
  UNITS_TYPES_PROPS,
  UNIT_TYPE_FIELD_NAMES,
  UNIT_TYPE_SELECTION_TEMPLATE,
} from '_shared/constants/settings'
import { UI_INITIAL_VALUES } from '_shared/constants/ui'
import { getStorageValue, setStorageValue } from '_shared/functions/chromeStorage'
import { BinaryFieldName, SettingsState, UnitType, UnitTypeFieldName } from '_shared/types/settings'
import { Colors } from './sections/Colors'
import { Rotation } from './sections/Rotation'
import { Toggle } from './sections/Toggle'
import { Units } from './sections/Units'
import styles from './settings.module.css'

export type SettingsCommonProps = {
  handleInputChange: ChangeEventHandler<HTMLInputElement>
  handleUnitTypeChange: ChangeEventHandler<HTMLSelectElement>
  settings: SettingsState
}

export const Settings = () => {
  const [settings, setSettings] = useState(SETTINGS_FORM_INITIAL_VALUES)
  const [isSyncedWithChromeStorage, setIsSyncedWithChromeStorage] = useState(false)

  useEffect(() => {
    const syncChromeStorageToLocalState = async () => {
      const settingsFromStorage = await getStorageValue<SettingsState>('settings')
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
      if (
        !isSecondary &&
        (prev.primaryUnitStep < UNITS_TYPES_PROPS.byType[value].minStep ||
          prev.primaryUnitStep > UNITS_TYPES_PROPS.byType[value].maxStep)
      ) {
        result.primaryUnitStep = UNITS_TYPES_PROPS.byType[value].minStep
      }
      if (
        isSecondary &&
        (prev.secondaryUnitStep < UNITS_TYPES_PROPS.byType[value].minStep ||
          prev.secondaryUnitStep > UNITS_TYPES_PROPS.byType[value].maxStep)
      ) {
        result.secondaryUnitStep = UNITS_TYPES_PROPS.byType[value].minStep
      }
      setStorageValue({ settings: result })
      return result
    })
  }, [])

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const { name, value } = event.target

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
        setStorageValue({ settings: newState })
        return newState
      })
    },
    [settings.primaryUnit, settings.secondaryUnit]
  )

  const commonsProps = useMemo(() => {
    return {
      handleInputChange,
      handleUnitTypeChange,
      settings,
    }
  }, [handleInputChange, handleUnitTypeChange, settings])

  const handleResetSettingsClick: MouseEventHandler<HTMLButtonElement> = () => {
    setSettings(SETTINGS_FORM_INITIAL_VALUES)
    setStorageValue({
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
