import { SettingsState } from '_shared/types/settings'

export const UNIT_TYPES = {
  mm: 'mm',
  cm: 'cm',
  in: 'in',
  pt: 'pt',
  px: 'px',
} as const

export const UNITS_TYPES_PROPS = {
  byType: {
    [UNIT_TYPES.mm]: {
      label: 'Millimeters',
      value: UNIT_TYPES.mm,
      minStep: 1,
      maxStep: 100,
    },
    [UNIT_TYPES.cm]: {
      label: 'Centimeters',
      value: UNIT_TYPES.cm,
      minStep: 1,
      maxStep: 10,
    },
    [UNIT_TYPES.in]: {
      label: 'Inches',
      value: UNIT_TYPES.in,
      minStep: 1,
      maxStep: 10,
    },
    [UNIT_TYPES.pt]: {
      label: 'Points',
      value: UNIT_TYPES.pt,
      minStep: 1,
      maxStep: 10,
    },
    [UNIT_TYPES.px]: {
      label: 'Pixels',
      value: UNIT_TYPES.px,
      minStep: 5,
      maxStep: 200,
    },
  },
  allTypes: [UNIT_TYPES.mm, UNIT_TYPES.cm, UNIT_TYPES.in, UNIT_TYPES.pt, UNIT_TYPES.px],
}

export const UNIT_TYPE_SELECTION_TEMPLATE = UNITS_TYPES_PROPS.allTypes.map(
  (uniType) => UNITS_TYPES_PROPS.byType[uniType]
)

export const UNIT_TYPE_FIELD_NAMES = {
  primaryUnit: 'primary-unit',
  secondaryUnit: 'secondary-unit',
} as const

export const UNIT_STEP_FIELD_NAMES = {
  primaryUnitStep: 'primary-unit-step',
  secondaryUnitStep: 'secondary-unit-step',
} as const

export const COLOR_FIELD_NAMES = {
  background: 'background-color',
  color: 'color',
} as const

export const SETTINGS_FORM_INITIAL_VALUES: SettingsState = {
  [UNIT_TYPE_FIELD_NAMES.primaryUnit]: UNIT_TYPES.cm,
  [UNIT_TYPE_FIELD_NAMES.secondaryUnit]: UNIT_TYPES.mm,
  [UNIT_STEP_FIELD_NAMES.primaryUnitStep]: UNITS_TYPES_PROPS.byType[UNIT_TYPES.cm].minStep,
  [UNIT_STEP_FIELD_NAMES.secondaryUnitStep]: UNITS_TYPES_PROPS.byType[UNIT_TYPES.mm].minStep,
  showSecondaryField: true,
  [COLOR_FIELD_NAMES.background]: '#fcf4a1',
  [COLOR_FIELD_NAMES.color]: '#000',
}

export const UNIT_TYPES_SELECTIONS_TEMPLATES = [
  {
    unitType: {
      fieldName: UNIT_TYPE_FIELD_NAMES.primaryUnit,
      label: 'Choose Ruler Primary Unit  Type',
    },
    unitStep: {
      fieldName: UNIT_STEP_FIELD_NAMES.primaryUnitStep,
      label: 'Choose Ruler Primary Unit Step',
    },
  },
  {
    unitType: {
      fieldName: UNIT_TYPE_FIELD_NAMES.secondaryUnit,
      label: 'Choose Ruler Secondary Unit Type',
    },
    unitStep: {
      fieldName: UNIT_STEP_FIELD_NAMES.secondaryUnitStep,
      label: 'Choose Ruler Secondary Unit Step',
    },
  },
]

export const COLORS_SELECTIONS_TEMPLATES = [
  {
    name: COLOR_FIELD_NAMES.background,
    label: 'Choose the Background Color of the Ruler',
  },
  {
    name: COLOR_FIELD_NAMES.color,
    label: 'Choose the Color of the Ruler',
  },
]
