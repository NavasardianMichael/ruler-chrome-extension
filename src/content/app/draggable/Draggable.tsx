import { CSSProperties, FC, MouseEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import styles from './draggable.module.css'

// A simple debounce function
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
}

export const Draggable: FC<DraggableContainerProps> = ({ children, initialX = 100, initialY = 100 }) => {
  // Current position of the container
  const [position, setPosition] = useState({ x: initialX, y: initialY })
  // Whether the container is currently being dragged
  const [isDragging, setIsDragging] = useState(false)
  // The offset between the mouse and the container's top-left corner
  const dragOffset = useRef({ x: 0, y: 0 })
  const RESIZE_HANDLE_SIZE = 16 // pixels
  const draggableRef = useRef<HTMLDivElement>(null)

  // Start dragging and record the initial offset
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const rect = draggableRef?.current?.getBoundingClientRect()
    if (!rect) return

    // Check if the mousedown is in the resize area.
    const isInResizeArea = e.clientX > rect.right - RESIZE_HANDLE_SIZE && e.clientY > rect.bottom - RESIZE_HANDLE_SIZE

    if (isInResizeArea) {
      // If the click is in the resize area, do not start dragging.
      return
    }
    setIsDragging(true)
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
  }

  // Stop dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Create a debounced mousemove handler so that position updates are throttled
  const debouncedMouseMove = useMemo(() => {
    const fn = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      })
    }
    return debounce(fn as () => unknown, 0) // Adjust debounce delay (in ms) as needed
  }, [])

  // Attach global mousemove and mouseup events when dragging starts
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', debouncedMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    } else {
      document.removeEventListener('mousemove', debouncedMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    // Cleanup on unmount or when isDragging changes
    return () => {
      document.removeEventListener('mousemove', debouncedMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, debouncedMouseMove])

  // Styling for the draggable container
  const containerStyle: CSSProperties = useMemo(
    () => ({
      left: position.x,
      top: position.y,
    }),
    [position.x, position.y]
  )

  return (
    <div ref={draggableRef} style={containerStyle} className={styles.draggable} onMouseDown={handleMouseDown}>
      {children}
    </div>
  )
}
