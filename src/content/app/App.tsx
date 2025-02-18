import { useEffect, useState } from 'react'
import { Ruler } from './ruler/Ruler'

export const App = () => {
  const [isRulerShown, setIsRulerShown] = useState(false)

  useEffect(() => {
    const onKeyPress = (event: KeyboardEvent) => {
      if (!event.ctrlKey || event.key.toLowerCase() !== 'q') return
      setIsRulerShown((prev) => !prev)
    }

    document.addEventListener('keyup', onKeyPress)

    return () => {
      document.removeEventListener('keyup', onKeyPress)
    }
  }, [])

  if (!isRulerShown) return null

  return <Ruler />
}
