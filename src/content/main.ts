import styles from './styles.module.css'

type State = {
  isCtrlDown: boolean
  anchorElement: HTMLElement | null
  targetElement: HTMLElement | null
}

const state: State = {
  isCtrlDown: false,
  anchorElement: null,
  targetElement: null,
}

const highlightElement = (element: HTMLElement) => {
  if (!element) return
  element.classList.add(styles.highlighted)
}

const unHighlightElement = (element: HTMLElement) => {
  if (!element) return
  element.classList.remove(styles.highlighted)
}
const pinElement = (element: HTMLElement) => {
  if (!element) return
  element.classList.add(styles.pinned)
}

const unPinElement = (element: HTMLElement) => {
  if (!element) return
  element.classList.remove(styles.pinned)
}

const removeLines = () => {
  Array.from(document.querySelectorAll(styles.line)).forEach((lineElement) => {
    lineElement.remove()
  })
}

const paintLines = (x1: number, y1: number, x2: number, y2: number) => {
  const fragment = document.createDocumentFragment()

  if (x1 !== x2) {
    const horizontalLine = document.createElement('div')
    horizontalLine.classList.add(styles.line)
    horizontalLine.style.top = `${y1}px`
    horizontalLine.style.left = `${x1}px`
    horizontalLine.style.width = `${x2 - x1}px`
    fragment.appendChild(horizontalLine)
    console.log({ horizontalLine })
  }

  if (y1 !== y2) {
    const verticalLine = document.createElement('div')
    verticalLine.classList.add(styles.line)
    verticalLine.style.left = `${x1}px`
    verticalLine.style.top = `${y1}px`
    verticalLine.style.height = `${y2 - y1}px`
    fragment.appendChild(verticalLine)
    console.log({ verticalLine })
  }

  if (!fragment.children.length) return

  document.body.appendChild(fragment)
}

const initRuler = (anchorElement: HTMLElement, targetElement: HTMLElement) => {
  const {
    left: anchorLeft,
    top: anchorTop,
    height: anchorHeight,
    width: anchorWidth,
  } = anchorElement.getBoundingClientRect()
  const {
    left: targetLeft,
    top: targetTop,
    height: targetHeight,
    width: targetWidth,
  } = targetElement.getBoundingClientRect()

  const isTargetFromRight = anchorLeft < targetLeft
  const sameHorizontalLine = anchorLeft === targetLeft
  const isTargetFromTop = anchorTop > targetTop
  const sameVerticalLine = anchorTop === targetTop
  console.log({ targetElement, anchorElement })

  const x1 =
    sameHorizontalLine || isTargetFromRight
      ? anchorLeft + anchorWidth
      : anchorLeft
  const x2 =
    sameHorizontalLine || isTargetFromRight
      ? targetLeft
      : targetLeft + targetWidth
  const y1 = sameVerticalLine
    ? anchorTop
    : isTargetFromTop
    ? targetTop + targetHeight
    : anchorTop + anchorHeight
  const y2 = sameVerticalLine || isTargetFromTop ? anchorTop : targetTop
  console.log({ x1, x2, y1, y2 })

  paintLines(x1, x2, y1, y2)
}

const mouseOverTargetElementHandler = (event: MouseEvent) => {
  unHighlightElement(state.targetElement!)
  state.targetElement = null
  removeLines()

  const element = event.target as HTMLElement
  state.targetElement = element
  highlightElement(state.targetElement)

  initRuler(state.anchorElement!, state.targetElement)
}

const clickTargetElementHandler = (event: MouseEvent) => {
  const element = event.target as HTMLElement
  unHighlightElement(state.anchorElement!)
  unPinElement(state.anchorElement!)

  pinElement(element)
  state.anchorElement = element

  unHighlightElement(state.targetElement!)
  state.targetElement = null
  removeLines()

  document.removeEventListener('mouseover', mouseOverAnchorElementHandler)
  document.addEventListener('mouseover', mouseOverTargetElementHandler)
}

const mouseOverAnchorElementHandler = (event: MouseEvent) => {
  unHighlightElement(state.anchorElement as HTMLElement)

  unHighlightElement(state.targetElement!)
  state.targetElement = null
  removeLines()

  const element = event.target as HTMLElement
  state.anchorElement = element
  highlightElement(state.anchorElement)

  document.addEventListener('click', clickTargetElementHandler)
}

const keyDownHandler = (event: KeyboardEvent) => {
  if (event.key !== 'Control' || state.isCtrlDown) return
  state.isCtrlDown = true
  document.addEventListener('mouseover', mouseOverAnchorElementHandler)
}

const keyUpHandler = (event: KeyboardEvent) => {
  if (event.ctrlKey) return
  state.isCtrlDown = false
  document.removeEventListener('mouseover', mouseOverAnchorElementHandler)
  document.removeEventListener('mouseover', mouseOverTargetElementHandler)
  document.removeEventListener('click', clickTargetElementHandler)

  unHighlightElement(state.anchorElement!)
  unPinElement(state.anchorElement!)
  state.anchorElement = null

  unHighlightElement(state.targetElement!)
  state.targetElement = null
  removeLines()
}

const init = () => {
  document.addEventListener('keydown', keyDownHandler)
  document.addEventListener('keyup', keyUpHandler)
}

if (
  document.readyState === 'complete' ||
  document.readyState === 'interactive'
) {
  init()
} else {
  document.addEventListener('DOMContentLoaded', init)
}
