import { CSSProperties, FC, MouseEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { SETTINGS_FORM_INITIAL_VALUES } from '_shared/constants/settings'
import { UI_INITIAL_VALUES } from '_shared/constants/ui'
import { getStorageValue, setStorageValue } from '_shared/functions/chromeStorage'
import { State } from '_shared/types/state'
import { UIState } from '_shared/types/ui'
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

interface DraggableContainerProps {
  children: ReactNode
  initialX?: number
  initialY?: number
  toggleRuler: () => Promise<void>
}

export const Draggable: FC<DraggableContainerProps> = ({ children, toggleRuler, initialX = 100, initialY = 100 }) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY })
  const [isDragging, setIsDragging] = useState(false)
  const [containerRotationDegree, setContainerRotationDegree] = useState(0)
  const [isSyncedWithChromeStorage, setIsSyncedWithChromeStorage] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const RESIZE_HANDLE_SIZE = 16
  const draggableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chrome.storage) return

    const sync = async () => {
      const state: State = await chrome.storage.local.get()
      const { settings, ui } = state
      if (!settings && !ui) {
        await setStorageValue({ settings: SETTINGS_FORM_INITIAL_VALUES, ui: UI_INITIAL_VALUES })
      } else {
        setContainerRotationDegree(settings.rotationDegree ?? SETTINGS_FORM_INITIAL_VALUES.rotationDegree)
        setPosition({
          x: ui?.left ?? UI_INITIAL_VALUES.left,
          y: ui?.top ?? UI_INITIAL_VALUES.top,
        })
      }
      setIsSyncedWithChromeStorage(true)
    }

    sync()

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes.settings) {
        const { oldValue, newValue } = changes.settings
        if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return
        setContainerRotationDegree(+newValue.rotationDegree)
      }

      if (areaName === 'local' && changes.ui) {
        const { oldValue, newValue } = changes.ui
        if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return
        setPosition({
          x: newValue.left,
          y: newValue.top,
        })
      }
    })
  }, [])

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()

    const rect = draggableRef?.current?.getBoundingClientRect()
    if (!rect) return

    const isInResizeArea = e.clientX > rect.right - RESIZE_HANDLE_SIZE && e.clientY > rect.bottom - RESIZE_HANDLE_SIZE

    if (isInResizeArea) {
      return
    }

    setIsDragging(true)
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const debouncedMouseMove = useMemo(() => {
    const fn = async (e: MouseEvent) => {
      const newState = {
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      }
      setPosition(newState)

      const uiFromStorage = await getStorageValue<UIState>('ui')

      await setStorageValue({
        ui: {
          ...UI_INITIAL_VALUES,
          ...uiFromStorage,
          top: newState.y,
          left: newState.x,
        },
      })
    }
    return debounce(fn as () => unknown, 0)
  }, [])

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

      let state = { x: 0, y: 0 }
      setPosition((prev) => {
        state = { ...prev }
        switch (event.key) {
          case 'ArrowUp':
            state.y = prev.y - 1
            return state
          case 'ArrowDown':
            state.y = prev.y + 1
            return state
          case 'ArrowLeft':
            state.x = prev.x - 1
            return state
          case 'ArrowRight':
            state.x = prev.x + 1
            return state
          case 'Delete':
            toggleRuler()
            return state
          default:
            return prev
        }
      })
      const uiFromStorage = await getStorageValue<UIState>('ui')

      await setStorageValue({
        ui: {
          ...UI_INITIAL_VALUES,
          ...uiFromStorage,
          top: state.y,
          left: state.x,
        },
      })
    }

    if (!isFocused) {
      window.removeEventListener('keydown', handleKeyDown)
      return
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFocused])

  const containerStyle: CSSProperties = useMemo(
    () => ({
      left: position.x,
      top: position.y,
      transform: `rotate(${containerRotationDegree}deg)`,
    }),
    [containerRotationDegree, position.x, position.y]
  )

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  return (
    <div
      ref={draggableRef}
      style={containerStyle}
      className={styles.draggable}
      onMouseDown={handleMouseDown}
      hidden={!isSyncedWithChromeStorage}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={0}
    >
      {children}
    </div>
  )
}
