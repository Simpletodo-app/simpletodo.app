import { ipcMain } from 'electron'
import NotesService from './Notes'
import ProjectsService from './Projects'

const servicesInstance = [new NotesService(), new ProjectsService()]

/**
 * This function registers all services in ipcMain
 * e.g:
 * IPCMain.handler('notes.create', (params)=> NoteService.create(params))
 * and renderer (see preoload.ts):
 * {
 *   notes: {create: (params)=>ipcRender.invoke('notes:create', params)}
 * }
 *
 * Usage in Renderer
 *
 * window.electron.services.notes.create(params)
 *
 */
const applyServices = () => {
  servicesInstance.forEach((service) => {
    service.getExposedMethods().forEach((method) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: service[method] is a function
      if (typeof service[method] === 'function') {
        const handlerName = `${service.serviceName}.${method}`
        // remove any existing handler - https://stackoverflow.com/a/75143441/5836034
        ipcMain.removeHandler(handlerName)

        // set new handler
        ipcMain.handle(handlerName, async (_, ...args: unknown[]) => {
          // eslint-disable-next-line no-useless-catch
          try {
            // @ts-expect-error: service[method] is a function
            return service[method](...args)
          } catch (err) {
            throw err
          }
        })
      }
    })
  })
}

export default applyServices
