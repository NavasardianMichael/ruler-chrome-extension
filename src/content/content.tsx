import { createRoot } from 'react-dom/client'
import { App } from './app/App'

function initReactApp() {
  // 1. Create a container in the DOM
  const container = document.createElement('div')
  container.id = 'ruler-extension-root'

  // 2. Optionally, use a shadow DOM to avoid conflicts with site styles
  // const shadow = container.attachShadow({ mode: 'open' })

  // 3. Append to body (or somewhere else on the page)
  document.body.appendChild(container)

  // 4. Create and render your React app
  const root = createRoot(container /* or shadow */)
  root.render(<App />)
}

// Run the function once the page is ready (or immediately if you don't need to wait)
initReactApp()
