import { CSSProperties, FC, MouseEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { UIState } from '_shared/types/ui'
import { AppProps } from '../ruler/Ruler'
import styles from './draggable.module.css'

function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number): T {
  let timeout: number | null = null
  const debounced = (...args: unknown[]) => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = window.setTimeout(() => {
      func(...args)
    }, wait)
  }
  return debounced as T
}

type Props = {
  children: ReactNode
} & AppProps

const RESIZE_HANDLE_SIZE = 16

export const Draggable: FC<Props> = ({ state, setters, children }) => {
  const { settings, ui } = state
  const { setSettings, setUI } = setters

  const [isDragging, setIsDragging] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const dragOffset = useRef({ left: 0, top: 0 })
  const draggableRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()

    const rect = draggableRef.current?.getBoundingClientRect()
    if (!rect) return

    const isInResizeArea = e.clientX > rect.right - RESIZE_HANDLE_SIZE && e.clientY > rect.bottom - RESIZE_HANDLE_SIZE

    if (isInResizeArea) {
      return
    }

    setIsDragging(true)
    dragOffset.current = {
      left: e.clientX - ui.left,
      top: e.clientY - ui.top,
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const debouncedMouseMove = useMemo(() => {
    const fn = async (e: MouseEvent) => {
      setUI({
        left: e.clientX - dragOffset.current.left,
        top: e.clientY - dragOffset.current.top,
      })
    }
    return debounce(fn as () => unknown, 0)
  }, [setUI])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', debouncedMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    } else {
      document.removeEventListener('mousemove', debouncedMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', debouncedMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, debouncedMouseMove])

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      event.preventDefault()
      event.stopImmediatePropagation()

      const state: Pick<UIState, 'left' | 'top'> = { left: ui.left, top: ui.top }
      switch (event.key) {
        case 'ArrowUp':
          state.top -= 1
          break
        case 'ArrowDown':
          state.top += 1
          break
        case 'ArrowLeft':
          state.left -= 1
          break
        case 'ArrowRight':
          state.left += 1
          break
        case 'Delete':
          setSettings({ showRuler: !settings.showRuler })
          return
        default:
          return
      }
      setUI(state)
    }

    if (!isFocused) {
      window.removeEventListener('keydown', handleKeyDown)
      return
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFocused, setSettings, setUI, settings.showRuler, ui.left, ui.top])

  const containerStyle: CSSProperties = useMemo(
    () => ({
      left: ui.left,
      top: ui.top,
      transform: `rotate(${settings.rotationDegree}deg)`,
    }),
    [settings.rotationDegree, ui.left, ui.top]
  )

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  return (
    <div
      ref={draggableRef}
      className={styles.draggable}
      style={containerStyle}
      onMouseDown={handleMouseDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={0}
    >
      {children}
    </div>
  )
}
