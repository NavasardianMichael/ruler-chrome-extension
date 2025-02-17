import { ChangeEventHandler, useState } from 'react'
import {
  COLORS_SELECTIONS_TEMPLATES,
  SETTINGS_FORM_INITIAL_VALUES,
  UNITS_TYPES_PROPS,
  UNIT_STEP_FIELD_NAMES,
  UNIT_TYPES_SELECTIONS_TEMPLATES,
  UNIT_TYPE_SELECTION_TEMPLATE,
} from '_shared/constants/settings'
import { useSyncWithStorage } from '_shared/hooks/useSyncWithStorage'
import { UnitType, UnitTypeFieldName } from '_shared/types/settings'
import styles from './settings.module.css'

export const Settings = () => {
  const [settings, setSettings] = useState(SETTINGS_FORM_INITIAL_VALUES)

  useSyncWithStorage({ settings })

  const handleUnitTypeChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const name = event.target.name as UnitTypeFieldName
    const value = event.target.value as UnitType
    setSettings((prev) => {
      const result = {
        ...prev,
        [name]: value,
      }
      if (
        prev[UNIT_STEP_FIELD_NAMES.primaryUnitStep] < UNITS_TYPES_PROPS.byType[value].minStep ||
        prev[UNIT_STEP_FIELD_NAMES.primaryUnitStep] > UNITS_TYPES_PROPS.byType[value].maxStep
      ) {
        result[UNIT_STEP_FIELD_NAMES.primaryUnitStep] = UNITS_TYPES_PROPS.byType[value].minStep
      }
      if (
        prev[UNIT_STEP_FIELD_NAMES.secondaryUnitStep] < UNITS_TYPES_PROPS.byType[value].minStep ||
        prev[UNIT_STEP_FIELD_NAMES.secondaryUnitStep] > UNITS_TYPES_PROPS.byType[value].maxStep
      ) {
        result[UNIT_STEP_FIELD_NAMES.secondaryUnitStep] = UNITS_TYPES_PROPS.byType[value].minStep
      }
      return result
    })
  }

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name, value } = event.target
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <main className={styles.settings}>
      <div className={styles.unitsSelection}>
        {UNIT_TYPES_SELECTIONS_TEMPLATES.map((unitTypeTemplate) => {
          return (
            <div className={styles.unitSelection}>
              <div className={styles.unitTypeSelection}>
                <label htmlFor={unitTypeTemplate.unitType.fieldName}>{unitTypeTemplate.unitType.label}</label>
                <select
                  id={unitTypeTemplate.unitType.fieldName}
                  name={unitTypeTemplate.unitType.fieldName}
                  onChange={handleUnitTypeChange}
                  value={settings[unitTypeTemplate.unitType.fieldName]}
                >
                  {UNIT_TYPE_SELECTION_TEMPLATE.map((unit) => {
                    return (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div className={styles.unitStepSelection}>
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
            </div>
          )
        })}
      </div>
      <div className={styles.colorsSelection}>
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
