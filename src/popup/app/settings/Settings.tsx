import { ChangeEventHandler, useEffect, useState } from 'react'
import {
  COLORS_SELECTIONS_TEMPLATES,
  REST_FIELDS_TEMPLATES,
  REST_FIELD_NAMES,
  ROTATION_DEGREE_PROPS,
  SETTINGS_FORM_INITIAL_VALUES,
  UNITS_TYPES_PROPS,
  UNIT_TYPES_SELECTIONS_TEMPLATES,
  UNIT_TYPE_FIELD_NAMES,
  UNIT_TYPE_SELECTION_TEMPLATE,
} from '_shared/constants/settings'
import { getStorageValue } from '_shared/functions/chromeStorage'
import { combineClassNames } from '_shared/functions/commons'
import { useSyncLocalStateToChromeStorage } from '_shared/hooks/useSyncLocalStateToChromeStorage'
import { SettingsState, UnitType, UnitTypeFieldName } from '_shared/types/settings'
import styles from './settings.module.css'

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

  useSyncLocalStateToChromeStorage({ settings })

  const handleUnitTypeChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const name = event.target.name as UnitTypeFieldName
    const value = event.target.value as UnitType
    setSettings((prev) => {
      const result = {
        ...prev,
        [name]: value,
      }
      if (
        prev.primaryUnitStep < UNITS_TYPES_PROPS.byType[value].minStep ||
        prev.primaryUnitStep > UNITS_TYPES_PROPS.byType[value].maxStep
      ) {
        result.primaryUnitStep = UNITS_TYPES_PROPS.byType[value].minStep
      }
      if (
        prev.secondaryUnitStep < UNITS_TYPES_PROPS.byType[value].minStep ||
        prev.secondaryUnitStep > UNITS_TYPES_PROPS.byType[value].maxStep
      ) {
        result.secondaryUnitStep = UNITS_TYPES_PROPS.byType[value].minStep
      }
      return result
    })
  }

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name, value } = event.target
    console.log({ name, value })
    setSettings((prev) => ({
      ...prev,
      [name]: name === REST_FIELD_NAMES.showSecondaryUnit ? !prev.showSecondaryUnit : value,
    }))
  }

  if (!isSyncedWithChromeStorage) return null

  return (
    <main className={styles.settings}>
      <div className={combineClassNames(styles.settingsBlock, styles.unitsSelection)}>
        {UNIT_TYPES_SELECTIONS_TEMPLATES.map((unitTypeTemplate) => {
          const isSecondaryField = unitTypeTemplate.unitType.fieldName === UNIT_TYPE_FIELD_NAMES.secondaryUnit

          return (
            <div
              className={combineClassNames(styles.unitSettingsBlock, styles.unitSelection)}
              key={unitTypeTemplate.unitType.fieldName}
            >
              {isSecondaryField && (
                <div className={styles.showSecondaryFieldSection}>
                  <input
                    type="checkbox"
                    id={REST_FIELD_NAMES.showSecondaryUnit}
                    name={REST_FIELD_NAMES.showSecondaryUnit}
                    onChange={handleInputChange}
                    checked={settings.showSecondaryUnit}
                    value={settings.secondaryUnit}
                  ></input>
                  <label htmlFor={REST_FIELD_NAMES.showSecondaryUnit}>
                    {REST_FIELDS_TEMPLATES.showSecondaryUnit.label}
                  </label>
                </div>
              )}

              {isSecondaryField && !settings.showSecondaryUnit ? null : (
                <>
                  <div className={combineClassNames(styles.unitSettingsBlock, styles.unitTypeSelection)}>
                    <label htmlFor={unitTypeTemplate.unitType.fieldName}>{unitTypeTemplate.unitType.label}</label>
                    <select
                      id={unitTypeTemplate.unitType.fieldName}
                      name={unitTypeTemplate.unitType.fieldName}
                      onChange={handleUnitTypeChange}
                      value={settings[unitTypeTemplate.unitType.fieldName]}
                    >
                      {UNIT_TYPE_SELECTION_TEMPLATE.map((unit) => {
                        return (
                          <option key={`${unitTypeTemplate.unitType.fieldName}-${unit.value}`} value={unit.value}>
                            {unit.label}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  <div className={combineClassNames(styles.unitSettingsBlock, styles.unitStepSelection)}>
                    <label htmlFor={unitTypeTemplate.unitStep.fieldName}>{unitTypeTemplate.unitStep.label}</label>
                    <div className={styles.unitFields}>
                      <input
                        type="range"
                        name={unitTypeTemplate.unitStep.fieldName}
                        value={settings[unitTypeTemplate.unitStep.fieldName]}
                        onChange={handleInputChange}
                        min={UNITS_TYPES_PROPS.byType[settings[unitTypeTemplate.unitType.fieldName]].minStep}
                        max={UNITS_TYPES_PROPS.byType[settings[unitTypeTemplate.unitType.fieldName]].maxStep}
                      />
                      <input
                        type="number"
                        id={unitTypeTemplate.unitStep.fieldName}
                        name={unitTypeTemplate.unitStep.fieldName}
                        value={settings[unitTypeTemplate.unitStep.fieldName]}
                        onChange={handleInputChange}
                        min={UNITS_TYPES_PROPS.byType[settings[unitTypeTemplate.unitType.fieldName]].minStep}
                        max={UNITS_TYPES_PROPS.byType[settings[unitTypeTemplate.unitType.fieldName]].maxStep}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
      <hr />
      <div className={combineClassNames(styles.settingsBlock, styles.rotationDegreeSelection)}>
        <label htmlFor={REST_FIELDS_TEMPLATES.rotationDegree.name}>{REST_FIELDS_TEMPLATES.rotationDegree.label}</label>
        <div className={styles.rotationFields}>
          <input
            type="range"
            name={REST_FIELDS_TEMPLATES.rotationDegree.name}
            value={settings[REST_FIELD_NAMES.rotationDegree]}
            onChange={handleInputChange}
            min={ROTATION_DEGREE_PROPS.minStep}
            max={ROTATION_DEGREE_PROPS.maxStep}
          />
          <input
            type="number"
            id={REST_FIELDS_TEMPLATES.rotationDegree.name}
            name={REST_FIELDS_TEMPLATES.rotationDegree.name}
            value={settings.rotationDegree}
            onChange={handleInputChange}
            min={ROTATION_DEGREE_PROPS.minStep}
            max={ROTATION_DEGREE_PROPS.maxStep}
          />
        </div>
      </div>
      <hr />
      <div className={combineClassNames(styles.settingsBlock, styles.colorsSelection)}>
        {COLORS_SELECTIONS_TEMPLATES.map((colorTemplate) => {
          return (
            <div className={styles.colorSelection}>
              <label htmlFor={colorTemplate.name}>{colorTemplate.label}</label>
              <input
                type="color"
                id={colorTemplate.name}
                name={colorTemplate.name}
                value={settings[colorTemplate.name]}
                onChange={handleInputChange}
              />
            </div>
          )
        })}
      </div>
    </main>
  )
}
