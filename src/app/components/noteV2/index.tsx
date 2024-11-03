import {
  Box,
  Button,
  Flex,
  IconButton,
  ScrollArea,
  Tooltip,
} from '@radix-ui/themes'
import React, { useCallback, useEffect } from 'react'
import { useSelector } from '@legendapp/state/react'

import { TextEditor, isEmpty } from './editor'
import EmptyList from './EmptyList'
import {
  createEmptyNote,
  createSubNote,
  debouncedCreateOrEditNote,
  notes$,
} from '../../store/notesV2'
import { CardStackIcon } from '@radix-ui/react-icons'
import { hasCompletedTodos } from '../../../common/dom-utils'
import SubNotes from './SubNotes'
import { isTrashNotesProjectId, projects$ } from '../../store/projects'
import { SideNavIcon } from './SideNavIcon'

interface NoteV2Props {
  onToggleFullScreen: () => void
  fullScreen?: boolean
}
const NoteV2 = ({ onToggleFullScreen }: NoteV2Props) => {
  const selectedNoteId = useSelector(() => notes$.selectedNoteId.get())
  const note = useSelector(() => notes$.activeNote.get())
  const hasCompletedTodo = useSelector(() => {
    const html = notes$.activeNote.htmlContent.get()
    return html ? hasCompletedTodos(html) : false
  })
  const isTrashNotesSelected = useSelector(() =>
    isTrashNotesProjectId(projects$.selectedProjectId.get())
  )

  const handleOnKeyDownEvent = useCallback((e: KeyboardEvent) => {
    if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
      createEmptyNote()
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleOnKeyDownEvent)
    return () => {
      document.removeEventListener('keydown', handleOnKeyDownEvent)
    }
  }, [])

  if (!selectedNoteId) {
    return <EmptyList />
  }

  return (
    <ScrollArea className="note-container" style={{ height: '100vh' }}>
      <Box py="4" pr="2" className="note-layout">
        <Flex justify="between" gap="1">
          <Tooltip content="Show todo lists">
            <IconButton variant="ghost" onClick={onToggleFullScreen}>
              <SideNavIcon />
            </IconButton>
          </Tooltip>
          {!isTrashNotesSelected && (
            <Tooltip content="This will move completed tasks to a past list">
              <Button
                size="1"
                onClick={() => {
                  createSubNote(note?.id)
                }}
                disabled={!hasCompletedTodo}
              >
                <CardStackIcon width="16" height="16" />
                Move completed tasks
              </Button>
            </Tooltip>
          )}
        </Flex>
        <TextEditor
          noteId={note?.id}
          content={note?.htmlContent || ''}
          onChange={(v) => {
            if (!isEmpty(v) && note.htmlContent !== v) {
              debouncedCreateOrEditNote(note?.id, v)
            }
          }}
          editable={!isTrashNotesSelected}
        />

        <SubNotes />
      </Box>
    </ScrollArea>
  )
}

export default NoteV2
