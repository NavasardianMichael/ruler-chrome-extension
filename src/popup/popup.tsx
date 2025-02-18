import { createRoot } from 'react-dom/client'
import { App } from './container/App'

const rootElement = document.getElementById('popup-root') as HTMLElement
const root = createRoot(rootElement)
root.render(<App />)
