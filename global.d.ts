import NotesService from './src/main/services/Notes'
import { ElectronHandler } from './src/preload'
import { ClassAttributes, HTMLAttributes } from 'react'
import { getUserData, setUserData } from './src/main/store/store'
import ProjectsService from './src/main/services/Projects'

// https://stackoverflow.com/a/61358913/5836034
export type Promisify<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends (...args: any) => any
    ? (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>>
    : T[K]
}

type Services = {
  notes: Promisify<{
    create: NotesService['create']
    update: NotesService['update']
    getById: NotesService['getById']
    getSubNotes: NotesService['getSubNotes']
    getAll: NotesService['getAll']
    deleteById: NotesService['deleteById']
    triggerSubNoteCreation: NotesService['triggerSubNoteCreation']
    count: NotesService['count']
    search: NotesService['search']
  }>
  projects: Promisify<{
    getAll: ProjectsService['getAll']
    create: ProjectsService['create']
    update: ProjectsService['update']
    deleteById: ProjectsService['deleteById']
  }>
}

type Store = Promisify<{
  set: typeof setUserData
  get: typeof getUserData
}>

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler & { services: Services; store: Store }
  }

  type HTMLProps<T> = ClassAttributes<T> & HTMLAttributes<T>

  type Index = number
}

export {}
