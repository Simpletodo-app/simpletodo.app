/* eslint-disable no-useless-catch */
import { ipcMain } from 'electron'
import { getUserData, setUserData } from './store'

/**
 * This function registers store functions in ipcMain
 * e.g:
 * IPCMain.handler('store.set', (params)=> ...)
 * IPCMain.handler('store.get', (params)=> ...)
 * and renderer (see preoload.ts):
 * {
 *   store: {set: (params)=>ipcRender.invoke('store.set', params)}
 * }
 *
 * Usage in Renderer
 *
 * window.electron.store.set(...params)
 * window.electron.store.get(...params)
 *
 */
const applyStore = () => {
  // remove any existing handler before registering a new one- https://stackoverflow.com/a/75143441/5836034
  ipcMain.removeHandler('store.set')
  ipcMain.handle('store.set', async (_, ...args: unknown[]) => {
    try {
      // @ts-expect-error: setUserData is a function that accepts arguments
      return setUserData(...args)
    } catch (err) {
      throw err
    }
  })

  ipcMain.removeHandler('store.get')
  ipcMain.handle('store.get', async (_, ...args: unknown[]) => {
    try {
      // @ts-expect-error: geetUserData is a function that accepts arguments
      return getUserData(...args)
    } catch (err) {
      throw err
    }
  })
}

export default applyStore
