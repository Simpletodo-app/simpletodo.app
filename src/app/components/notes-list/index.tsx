import React from 'react'
import { For, useObserve, useSelector } from '@legendapp/state/react'

import {
  Flex,
  Separator,
  IconButton,
  Tooltip,
  ScrollArea,
  Heading,
} from '@radix-ui/themes'
import { Pencil2Icon } from '@radix-ui/react-icons'
import NoteListItem from './note-list-item'
import { createEmptyNote, fetchNotes, notes$ } from '../../store/notesV2'

import {
  getProjectFromId,
  isTrashNotesProjectId,
  projects$,
} from '../../store/projects'
import { useUserData } from '../user-data-provider'

const NotesList = () => {
  const { lastOpenedNoteId, lastOpenedProjectId } = useUserData()
  const canCreateNewNote = useSelector(() => notes$.canCreateNewNote.get())
  const currentProjectTitle = useSelector(() => {
    const projectId = projects$.selectedProjectId.get()
    if (projectId) {
      return getProjectFromId(projectId).title.get()
    }
  })

  const isTrashNotesSelected = useSelector(() =>
    isTrashNotesProjectId(projects$.selectedProjectId.get())
  )

  useObserve(() => {
    const selectedProjectId = projects$.selectedProjectId.get()
    let projectId = selectedProjectId
    if (!projectId) {
      projectId = lastOpenedProjectId
    }
    fetchNotes(projectId, lastOpenedNoteId)
  })

  return (
    <Flex gap="2" justify="between" height="100%" wrap="nowrap">
      <Flex direction="column" className="min-w-[290px]" py="4" gap="2">
        <Flex justify="between">
          <Heading weight="medium" size="3">
            {currentProjectTitle}
          </Heading>
          {!isTrashNotesSelected && (
            <Tooltip content="New todo list (⌘+N)">
              <IconButton
                variant="ghost"
                onClick={createEmptyNote}
                disabled={!canCreateNewNote}
              >
                <Pencil2Icon width="18" height="18" />
              </IconButton>
            </Tooltip>
          )}
        </Flex>

        <ScrollArea
          className="notes-list-scroll-area"
          style={{ height: '90vh' }}
        >
          <Flex direction="column" gap="1">
            <For each={notes$.notes}>
              {(item) => {
                return <NoteListItem note$={item} />
              }}
            </For>
          </Flex>
        </ScrollArea>
      </Flex>
      <Separator orientation="vertical" size="4" />
    </Flex>
  )
}

export default NotesList
