import { useSelector } from '@legendapp/state/react'
import { Pencil2Icon } from '@radix-ui/react-icons'
import { IconButton, Tooltip } from '@radix-ui/themes'
import { isTrashNotesProjectId, projects$ } from '../../store/projects'
import { createEmptyNote, notes$ } from '../../store/notesV2'
import React from 'react'

const NewNoteListIconButton = () => {
  const canCreateNewNote = useSelector(() => notes$.canCreateNewNote.get())
  const isTrashNotesSelected = useSelector(() =>
    isTrashNotesProjectId(projects$.selectedProjectId.get())
  )
  return (
    !isTrashNotesSelected && (
      <Tooltip content="New todo list (⌘+N)">
        <IconButton
          variant="ghost"
          onClick={createEmptyNote}
          disabled={!canCreateNewNote}
        >
          <Pencil2Icon width="18" height="18" />
        </IconButton>
      </Tooltip>
    )
  )
}

export default NewNoteListIconButton
