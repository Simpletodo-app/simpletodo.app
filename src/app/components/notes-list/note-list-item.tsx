import React, { useState } from 'react'
import { Flex, Box, Text, Separator, Badge } from '@radix-ui/themes'
import { CardStackIcon } from '@radix-ui/react-icons'
import { cn } from '../../../app/utils'
import {
  deleteNote,
  notes$,
  selectNoteItem,
  NoteListItem as NoteListItemType,
  restoreNote,
} from '../../store/notesV2'
import { ObservableObject } from '@legendapp/state'
import { format } from 'date-fns'
import ItemContextMenu from './item-context-menu'
import {
  isAllNotesProjectId,
  isTrashNotesProjectId,
  projects$,
} from '../../store/projects'
import ConfirmDelete from './confirm-delete'

type NoteListItemProps = {
  note$: ObservableObject<NoteListItemType>
}

const NoteListItem = ({ note$ }: NoteListItemProps) => {
  const [open, setOpen] = useState(false)
  const id = note$.id.peek()
  const hideSeparator = notes$.lastNoteId.get() === id
  const isActive = notes$.selectedNoteId.get() === id
  const belongsToAProject = !!note$.projectId.peek()
  const selectedProjectId = projects$.selectedProjectId.get()
  const isAllNotesSelected = isAllNotesProjectId(selectedProjectId)
  const isTrashNotesSelected = isTrashNotesProjectId(selectedProjectId)

  const project = projects$.projects
    .get()
    .find((item) => item.id === note$.projectId.peek())

  return (
    <>
      <div>
        <ItemContextMenu
          onDelete={() =>
            isTrashNotesSelected ? setOpen(true) : deleteNote(id)
          }
          onOpen={() => selectNoteItem(id)}
          showRestore={isTrashNotesSelected}
          onRestore={() => {
            if (!isTrashNotesSelected) return
            restoreNote(id)
          }}
        >
          <Box
            className={cn(
              'notes-list-item',
              'p-2 mb-2 rounded-lg w-full',
              isActive && 'active'
            )}
            asChild
          >
            <button onClick={() => selectNoteItem(id)}>
              <Text
                className="truncate-note-list-item-title"
                align="left"
                size="2"
                as="div"
              >
                {note$.title.get()}
              </Text>
              <Flex align="center" justify="between">
                <Flex gap="1" align="center">
                  <Text size="1" color="gray">
                    {format(new Date(note$.createdAt.peek()), 'MMM d, yyyy')}
                  </Text>
                  {belongsToAProject &&
                    (isAllNotesSelected || isTrashNotesSelected) && (
                      <Badge color="gray" variant="soft" size="1">
                        {project?.title}
                      </Badge>
                    )}
                </Flex>
                <div>
                  {Boolean(note$.hasSubNotes.peek()) && (
                    <CardStackIcon width="12" height="12" />
                  )}
                </div>
              </Flex>
            </button>
          </Box>
        </ItemContextMenu>
        {/* TODO(theo): Delete this and use css to handle this */}
        {!hideSeparator && <Separator size="4" />}
      </div>

      <ConfirmDelete
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          deleteNote(id, true)
        }}
      />
    </>
  )
}

export default NoteListItem
