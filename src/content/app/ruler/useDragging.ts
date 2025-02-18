import { useCallback, useEffect, useMemo, useRef, useState } from "react"

function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
    let timeout: number | null = null;
    const debounced = (...args: any[]) => {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = window.setTimeout(() => {
            func(...args);
        }, wait);
    };
    return debounced as T;
}

type Args = {
    initialX: number
    initialY: number
}

export const useDragging = ({ initialX, initialY }: Args) => {
    // Current position of the container
    const [position, setPosition] = useState({ x: initialX, y: initialY })
    // Whether the container is currently being dragged
    const [isDragging, setIsDragging] = useState(false)
    // The offset between the mouse and the container's top-left corner
    const dragOffset = useRef({ x: 0, y: 0 })

    // Start dragging and record the initial offset
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        setIsDragging(true)
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        }
    }, [])

    // Stop dragging
    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
    }, [])

    // Create a debounced mousemove handler so that position updates are throttled
    const debouncedMouseMove = useMemo(() => {
        return debounce((e: MouseEvent) => {
            console.log({ e });

            setPosition({
                x: e.clientX - dragOffset.current.x,
                y: e.clientY - dragOffset.current.y,
            })
        }, 0) // Adjust debounce delay (in ms) as needed
    }, [])

    // Attach global mousemove and mouseup events when dragging starts
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', debouncedMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            return
        }

        document.removeEventListener('mousemove', debouncedMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)

        // Cleanup on unmount or when isDragging changes
        return () => {
            document.removeEventListener('mousemove', debouncedMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, debouncedMouseMove])

    // Styling for the draggable container
    return useMemo(() => ({
        position,
        handleMouseDown,
        handleMouseUp
    }), [])
}