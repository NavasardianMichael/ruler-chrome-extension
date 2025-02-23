import { FC } from 'react'
import { REST_FIELDS_TEMPLATES, REST_FIELD_NAMES, ROTATION_DEGREE_PROPS } from '_shared/constants/settings'
import { combineClassNames } from '_shared/functions/commons'
import { SettingsCommonProps } from '../Settings'
import styles from '../settings.module.css'

export const Rotation: FC<SettingsCommonProps> = ({ handleInputChange, settings }) => {
  return (
    <div className={combineClassNames(styles.flex, styles.column, styles.spaceXS)}>
      <label htmlFor={REST_FIELDS_TEMPLATES.rotationDegree.name}>{REST_FIELDS_TEMPLATES.rotationDegree.label}</label>
      <div>
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
  )
}
