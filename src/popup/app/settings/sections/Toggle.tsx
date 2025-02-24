import { FC } from 'react'
import { REST_FIELDS_TEMPLATES, REST_FIELD_NAMES } from '_shared/constants/settings'
import { combineClassNames } from '_shared/functions/commons'
import { SettingsCommonProps } from '../Settings'
import styles from '../settings.module.css'

export const Toggle: FC<SettingsCommonProps> = ({ handleInputChange, settings }) => {
  return (
    <div className={combineClassNames(styles.flex, styles.spaceSM)}>
      <label htmlFor={REST_FIELDS_TEMPLATES.toggleRuler.name}>{REST_FIELDS_TEMPLATES.toggleRuler.label}</label>
      <div className={styles.switch}>
        <input
          type="checkbox"
          id={REST_FIELD_NAMES.toggleRuler}
          name={REST_FIELD_NAMES.toggleRuler}
          onChange={handleInputChange}
          checked={settings.toggleRuler}
          value={settings.toggleRuler ? 'on' : 'off'}
        />
        <span className={styles.slider}></span>
      </div>
    </div>
  )
}
