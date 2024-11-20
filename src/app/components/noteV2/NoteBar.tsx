import { Flex, IconButton, Tooltip } from '@radix-ui/themes'
import React from 'react'
import { SideNavIcon } from './SideNavIcon'
import { CardStackIcon, ResetIcon, TrashIcon } from '@radix-ui/react-icons'
import NewNoteListIconButton from '../notes-list/new-note-list-icon-button'
import { useSelector } from '@legendapp/state/react'
import { isTrashNotesProjectId, projects$ } from '../../store/projects'
import {
  createSubNote,
  deleteNote,
  notes$,
  restoreNote,
} from '../../store/notesV2'
import { hasCompletedTodos } from '../../../common/dom-utils'
import ConfirmDelete from '../notes-list/confirm-delete'
type NoteBarProps = {
  onToggleFullScreen: () => void
  fullScreen: boolean
}
const NoteBar = ({ onToggleFullScreen, fullScreen }: NoteBarProps) => {
  const [open, setOpen] = React.useState(false)
  const note = useSelector(() => notes$.activeNote.get())
  const isTrashNotesSelected = useSelector(() =>
    isTrashNotesProjectId(projects$.selectedProjectId.get())
  )
  const hasCompletedTodo = useSelector(() => {
    const html = notes$.activeNote.htmlContent.get()
    return html ? hasCompletedTodos(html) : false
  })
  const id = note?.id
  const isSubNote = !note?.parentNoteId

  return (
    <Flex p="4" direction="column" style={{ background: 'var(--accent-2)' }}>
      <Flex justify="between">
        <Flex gap="4" style={{ visibility: fullScreen ? 'unset' : 'hidden' }}>
          <NewNoteListIconButton />
          <Tooltip content="Show todo lists">
            <IconButton variant="ghost" onClick={onToggleFullScreen}>
              <SideNavIcon />
            </IconButton>
          </Tooltip>
        </Flex>

        <Flex gap="4">
          <Tooltip content="This will move completed tasks to a past list">
            <IconButton
              variant="ghost"
              size="2"
              onClick={() => {
                createSubNote(note?.id)
              }}
              disabled={isSubNote || !hasCompletedTodo || isTrashNotesSelected}
            >
              <CardStackIcon width="18" height="18" />
            </IconButton>
          </Tooltip>
          <Tooltip content="Delete">
            <IconButton
              variant="ghost"
              size="2"
              onClick={() => {
                isTrashNotesSelected ? setOpen(true) : deleteNote(id)
              }}
              disabled={!id}
            >
              <TrashIcon width="18" height="18" />
            </IconButton>
          </Tooltip>

          {isTrashNotesSelected && (
            <Tooltip content="Restore">
              <IconButton
                variant="ghost"
                size="2"
                onClick={() => {
                  if (!isTrashNotesSelected) return
                  restoreNote(note.id)
                }}
              >
                <ResetIcon width="18" height="18" />
              </IconButton>
            </Tooltip>
          )}
        </Flex>
      </Flex>
      <ConfirmDelete
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          deleteNote(id, true)
        }}
      />
    </Flex>
  )
}

export default NoteBar
