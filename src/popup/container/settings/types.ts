import { UNIT_STEP_FIELD_NAMES, UNIT_TYPE_FIELD_NAMES, UNIT_TYPES } from "./constants";

export type UnitType = (typeof UNIT_TYPES)[keyof typeof UNIT_TYPES]

export type UnitTypeFieldName = (typeof UNIT_TYPE_FIELD_NAMES)[keyof typeof UNIT_TYPE_FIELD_NAMES]

export type UnitStepFieldName = (typeof UNIT_STEP_FIELD_NAMES)[keyof typeof UNIT_STEP_FIELD_NAMES]

export type SettingsForm = Record<UnitTypeFieldName, UnitType> &
    Record<UnitStepFieldName, number> & {
        showSecondaryField: boolean;
    };