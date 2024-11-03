import { Menu, MenuItem, app } from 'electron'

// hide menu bar dev tools when app is packaged
// copied from https://stackoverflow.com/a/74654460
export const setupMenuBar = () => {
  const menu = Menu.getApplicationMenu() // get default menu

  // build a new menu based on default one
  const newmenu = Menu.buildFromTemplate(
    menu.items.map((item) => {
      // overwrite viewmenu item
      const viewMenu = 'viewmenu' as MenuItem['role']
      if (item.role === viewMenu && app.isPackaged) {
        return removeReloadAndDevMenuItems(item)
      }

      return item
    })
  )

  Menu.setApplicationMenu(newmenu)
}

const removeReloadAndDevMenuItems = (viewMenu: MenuItem) => {
  // create new submenu
  const newviewSub = Menu.buildFromTemplate(
    viewMenu.submenu.items.slice(4) // cut first 4 item (4th is separator)
  )
  // replace this item's submenu with the new submenu
  return Object.assign({}, viewMenu, { submenu: newviewSub })
}
