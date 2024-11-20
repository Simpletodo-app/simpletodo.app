import { app, BrowserWindow, shell } from 'electron'
import path from 'path'
import DBService from './main/services/DB'
import applyServices from './main/services/apply'
import applyStore from './main/store/apply'
import { setupMenuBar } from './main/utils'
import { updateElectronApp } from 'update-electron-app'

updateElectronApp()

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

const createWindow = () => {
  // initialize db
  new DBService('main').connect()

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 500,
    minWidth: 550,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 10, y: 10 },
    // expose window controlls in Windows/Linux
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: !app.isPackaged,
    },
    icon: '/app/images/appicons/icon.png',
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    )
  }

  // setup IPC handlers for exposed services
  applyServices()

  // setup IPC handlers for exposed store
  applyStore()

  // Open the DevTools.
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools()
  }

  // open links in external browser
  mainWindow.webContents.setWindowOpenHandler((details) => {
    const url = details.url
    if (['file:'].includes(new URL(url).protocol)) return

    shell.openExternal(url)
    return { action: 'deny' }
  })

  // setup menu bar
  setupMenuBar()

  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

let mainWindow: BrowserWindow

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0 && !mainWindow) {
    mainWindow = createWindow()
  }
})
