/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

console.log(
  '👋 This message is being logged by "renderer.ts", included via Vite'
)

document.body.addEventListener('click', (event) => {
  const target = event.target as HTMLAnchorElement
  if (target.tagName.toLowerCase() === 'a') {
    event.preventDefault()
    const shouldIgnoreMetaKey = target.getAttribute('data-ignore-meta-key')
    if (event.metaKey || event.ctrlKey || shouldIgnoreMetaKey) {
      window.open(target.href, '_blank')
    }
  }
})

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import './index.scss'
import '@radix-ui/themes/styles.css'
import ThemeProvider from './app/components/theme-provider'
import { enableReactTracking } from '@legendapp/state/config/enableReactTracking'
import UserDataProvider from './app/components/user-data-provider'
import { configureObservablePersistence } from '@legendapp/state/persist'
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage'

// This makes React components automatically track get() calls to re-render
enableReactTracking({ auto: true })

// Global configuration
configureObservablePersistence({
  pluginLocal: ObservablePersistLocalStorage,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserDataProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </UserDataProvider>
  </React.StrictMode>
)
