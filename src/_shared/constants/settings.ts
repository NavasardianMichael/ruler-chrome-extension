import { SettingsState, UnitType } from '_shared/types/settings'

export const UNIT_TYPES = {
  mm: 'mm',
  cm: 'cm',
  in: 'in',
  pt: 'pt',
  px: 'px',
} as const

export const UNIT_CONVERSION_FACTORS_BY_PX: Record<UnitType, number> = {
  mm: 96 / 25.4, // Base unit
  cm: (96 / 25.4) * 10, // 1 cm = 10 mm
  in: 96, // 1 inch = 25.4 mm
  pt: 96 / 72, // 1 point = 0.3528 mm
  px: 1, // 1 pixel ≈ 0.2646 mm (based on 96 DPI)
}

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
      minStep: 5,
      maxStep: 500,
    },
    [UNIT_TYPES.px]: {
      label: 'Pixels',
      value: UNIT_TYPES.px,
      minStep: 5,
      maxStep: 500,
    },
  },
  allTypes: [UNIT_TYPES.mm, UNIT_TYPES.cm, UNIT_TYPES.in, UNIT_TYPES.pt, UNIT_TYPES.px],
}

export const MIN_STEPS_NUMBERS_TO_PAINT: Record<UnitType, number> = {
  mm: 5,
  cm: 1,
  in: 1,
  pt: 50,
  px: 50,
}

export const ROTATION_DEGREE_PROPS = {
  minStep: 0,
  maxStep: 360,
}

export const UNIT_TYPE_SELECTION_TEMPLATE = UNITS_TYPES_PROPS.allTypes.map(
  (uniType) => UNITS_TYPES_PROPS.byType[uniType]
)

export const UNIT_TYPE_FIELD_NAMES = {
  primaryUnit: 'primaryUnit',
  secondaryUnit: 'secondaryUnit',
} as const

export const UNIT_STEP_FIELD_NAMES = {
  primaryUnitStep: 'primaryUnitStep',
  secondaryUnitStep: 'secondaryUnitStep',
} as const

export const COLOR_FIELD_NAMES = {
  background: 'backgroundColor',
  color: 'color',
} as const

export const REST_FIELD_NAMES = {
  toggleRuler: 'toggleRuler',
  showSecondaryUnit: 'showSecondaryUnit',
  rotationDegree: 'rotationDegree',
} as const

export const BINARY_FIELD_NAMES = [REST_FIELD_NAMES.toggleRuler, REST_FIELD_NAMES.showSecondaryUnit] as const

export const SETTINGS_FORM_INITIAL_VALUES: SettingsState = {
  toggleRuler: true,
  primaryUnit: UNIT_TYPES.cm,
  showSecondaryUnit: true,
  secondaryUnit: UNIT_TYPES.mm,
  primaryUnitStep: UNITS_TYPES_PROPS.byType[UNIT_TYPES.cm].minStep,
  secondaryUnitStep: UNITS_TYPES_PROPS.byType[UNIT_TYPES.mm].minStep,
  backgroundColor: '#fcf4a1',
  color: '#000000',
  rotationDegree: 0,
}

export const UNIT_TYPES_SELECTIONS_TEMPLATES = [
  {
    unitType: {
      fieldName: UNIT_TYPE_FIELD_NAMES.primaryUnit,
      label: 'Choose Primary Unit Type',
    },
    unitStep: {
      fieldName: UNIT_STEP_FIELD_NAMES.primaryUnitStep,
      label: 'Choose Primary Unit Step',
    },
  },
  {
    unitType: {
      fieldName: UNIT_TYPE_FIELD_NAMES.secondaryUnit,
      label: 'Choose Secondary Unit Type',
    },
    unitStep: {
      fieldName: UNIT_STEP_FIELD_NAMES.secondaryUnitStep,
      label: 'Choose Secondary Unit Step',
    },
  },
]

export const COLORS_SELECTIONS_TEMPLATES = [
  {
    name: COLOR_FIELD_NAMES.background,
    label: 'Choose Background Color',
  },
  {
    name: COLOR_FIELD_NAMES.color,
    label: 'Choose Text Color',
  },
]

export const REST_FIELDS_TEMPLATES = {
  toggleRuler: {
    name: REST_FIELD_NAMES.toggleRuler,
    label: 'Show/Hide Ruler',
  },
  showSecondaryUnit: {
    name: REST_FIELD_NAMES.showSecondaryUnit,
    label: 'Show Secondary Unit',
  },
  rotationDegree: {
    name: REST_FIELD_NAMES.rotationDegree,
    label: 'Choose Rotation Degree',
  },
}
