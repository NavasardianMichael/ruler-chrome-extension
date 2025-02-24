import { FC, Fragment } from 'react'
import {
  REST_FIELDS_TEMPLATES,
  REST_FIELD_NAMES,
  UNITS_TYPES_PROPS,
  UNIT_TYPES_SELECTIONS_TEMPLATES,
  UNIT_TYPE_FIELD_NAMES,
  UNIT_TYPE_SELECTION_TEMPLATE,
} from '_shared/constants/settings'
import { combineClassNames } from '_shared/functions/commons'
import { SettingsCommonProps } from '../Settings'
import styles from '../settings.module.css'

export const Units: FC<SettingsCommonProps> = ({ handleInputChange, handleUnitTypeChange, settings }) => {
  return (
    <>
      {UNIT_TYPES_SELECTIONS_TEMPLATES.map((unitTypeTemplate) => {
        const isSecondaryField = unitTypeTemplate.unitType.fieldName === UNIT_TYPE_FIELD_NAMES.secondaryUnit

        return (
          <Fragment key={unitTypeTemplate.unitType.fieldName}>
            {isSecondaryField && (
              <div className={combineClassNames(styles.flex, styles.spaceSM)}>
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
                <div className={combineClassNames(styles.flex, styles.column, styles.spaceSM)}>
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
                <div className={combineClassNames(styles.flex, styles.column, styles.spaceSM)}>
                  <label htmlFor={unitTypeTemplate.unitStep.fieldName}>{unitTypeTemplate.unitStep.label}</label>
                  <div>
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
          </Fragment>
        )
      })}
    </>
  )
}
