import { COLOR_FIELD_NAMES, UNIT_STEP_FIELD_NAMES, UNIT_TYPES, UNIT_TYPE_FIELD_NAMES } from '_shared/constants/settings'

export type UnitType = (typeof UNIT_TYPES)[keyof typeof UNIT_TYPES]

export type UnitTypeFieldName = (typeof UNIT_TYPE_FIELD_NAMES)[keyof typeof UNIT_TYPE_FIELD_NAMES]

export type UnitStepFieldName = (typeof UNIT_STEP_FIELD_NAMES)[keyof typeof UNIT_STEP_FIELD_NAMES]

export type ColorFieldName = (typeof COLOR_FIELD_NAMES)[keyof typeof COLOR_FIELD_NAMES]

export type SettingsState = Record<UnitTypeFieldName, UnitType> &
  Record<UnitStepFieldName, number> &
  Record<ColorFieldName, string> & {
    showSecondaryUnit: boolean
    rotationDegree: number
  }
