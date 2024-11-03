import { Plugin, PluginKey } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import { Mark } from '@tiptap/pm/model'

import { ActionsPluginProps, ActionsView } from './ActionsPluginView'

export type LinkActionsPluginProps = ActionsPluginProps

type LinkActionsViewProps = LinkActionsPluginProps & {
  view: EditorView
}

class LinkActionsView extends ActionsView {
  public shouldShow: Exclude<LinkActionsPluginProps['shouldShow'], null> = ({
    view,
    state,
    from,
    to,
  }) => {
    const { selection } = state
    const { $from } = selection

    // When selection's start and end position are equal, it means the selection
    // is a cursor selection
    const isCursorSelection = from === to

    // Link mark is present on the selection
    const hasLinkMark = $from
      .marks()
      .some((mark: Mark) => mark.type.name === 'link')

    // When clicking on a element inside the link actions menu the editor "blur" event
    // is called and the link actions menu item is focussed. In this case we should
    // consider the menu as part of the editor and keep showing the menu
    const isChildOfMenu = this.element.contains(document.activeElement)

    const hasEditorFocus = view.hasFocus() || isChildOfMenu

    if (
      !isCursorSelection ||
      !hasEditorFocus ||
      !this.editor.isEditable ||
      !hasLinkMark
    ) {
      return false
    }

    return true
  }

  constructor(linkActionsViewProps: LinkActionsViewProps) {
    super(linkActionsViewProps)
  }
}

// Plugin to show link actions on click
export const LinkActionsPlugin = (options: LinkActionsPluginProps) => {
  return new Plugin({
    key:
      typeof options.pluginKey === 'string'
        ? new PluginKey(options.pluginKey)
        : options.pluginKey,
    view: (view) => new LinkActionsView({ view, ...options }),
  })
}
