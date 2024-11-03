// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
// Disable no-unused-vars, broken for spread args
import { contextBridge, ipcRenderer } from 'electron'
import set from 'lodash/set'

const createRendererInvoke = (arr: string[]) =>
  arr.reduce((acc, path) => {
    set(acc, path, (...args: unknown[]) => ipcRenderer.invoke(path, ...args))
    return acc
  }, {})

const services = createRendererInvoke([
  // notes services
  'notes.create',
  'notes.update',
  'notes.getById',
  'notes.getAll',
  'notes.deleteById',
  'notes.triggerSubNoteCreation',
  'notes.getSubNotes',
  'notes.count',
  'notes.search',

  // projects services
  'projects.getAll',
  'projects.create',
  'projects.update',
  'projects.deleteById',
])

const { store } = createRendererInvoke(['store.set', 'store.get']) as {
  store: unknown
}

const electronHandler = {
  services,
  store,
}

contextBridge.exposeInMainWorld('electron', electronHandler)

export type ElectronHandler = typeof electronHandler
