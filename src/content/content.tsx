import { createRoot } from 'react-dom/client'
import { App } from './app/App'

function initReactApp() {
  const container = document.createElement('div')
  container.id = 'ruler-extension-root'

  document.body.appendChild(container)

  const root = createRoot(container /* or shadow */)
  root.render(<App />)
}

initReactApp()
