import React from 'react'
import { For, useObserve, useSelector } from '@legendapp/state/react'

import {
  Flex,
  IconButton,
  Tooltip,
  ScrollArea,
  Heading,
} from '@radix-ui/themes'
import NoteListItem from './note-list-item'
import { fetchNotes, notes$, toggleViewSubNotes } from '../../store/notesV2'

import { getProjectFromId, projects$ } from '../../store/projects'
import { useUserData } from '../user-data-provider'
import { SideNavIcon } from '../noteV2/SideNavIcon'
import NewNoteListIconButton from './new-note-list-icon-button'
import { CardStackIcon } from '@radix-ui/react-icons'

type NotesListProps = {
  onToggleFullScreen: () => void
}

const NotesList = ({ onToggleFullScreen }: NotesListProps) => {
  const { lastOpenedNoteId, lastOpenedProjectId } = useUserData()
  const currentProjectTitle = useSelector(() => {
    const projectId = projects$.selectedProjectId.get()
    if (projectId) {
      return getProjectFromId(projectId).title.get()
    }
  })
  const viewingSubNotes = useSelector(() => notes$.viewSubNotes.get())

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
      <Flex
        direction="column"
        className="min-w-[290px] w-[290px]"
        pt="2"
        py="4"
        gap="2"
      >
        <Flex pr="2" align="start">
          <Heading weight="medium" size="3" className="app-region flex-1 ">
            <span className="truncate-to-one-line">{currentProjectTitle}</span>
          </Heading>
          <Flex gap="4" align="center">
            <Tooltip content="Toggle past completed tasks">
              <IconButton
                color={viewingSubNotes ? 'indigo' : undefined}
                variant="ghost"
                onClick={() => toggleViewSubNotes()}
              >
                <CardStackIcon width="18" height="18" />
              </IconButton>
            </Tooltip>
            <NewNoteListIconButton />
            <Tooltip content="Hide todo lists">
              <IconButton variant="ghost" onClick={onToggleFullScreen}>
                <SideNavIcon />
              </IconButton>
            </Tooltip>
          </Flex>
        </Flex>

        <ScrollArea
          className="notes-list-scroll-area"
          style={{ height: '90vh' }}
        >
          <Flex direction="column" gap="1" pr="2">
            <For each={notes$.notes}>
              {(item) => {
                return <NoteListItem note$={item} />
              }}
            </For>
          </Flex>
        </ScrollArea>
      </Flex>
    </Flex>
  )
}

export default NotesList
