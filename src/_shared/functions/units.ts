import { UnitType } from "_shared/types/settings"

export const checkUnitTypeRatioToPx = (unitType: UnitType): number => {
    const precisionFactor = 1
    const tempElement = document.createElement('div')
    tempElement.style.width = `${precisionFactor}${unitType}`
    document.body.appendChild(tempElement)
    const widthIndPx = tempElement.getBoundingClientRect().width
    tempElement.remove()
    return widthIndPx / precisionFactor
}