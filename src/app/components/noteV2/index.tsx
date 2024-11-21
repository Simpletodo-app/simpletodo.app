import { Box, ScrollArea } from '@radix-ui/themes'
import React, { useCallback, useEffect } from 'react'
import { useSelector } from '@legendapp/state/react'

import { TextEditor, isEmpty } from './editor'
import EmptyList from './EmptyList'
import {
  createEmptyNote,
  debouncedCreateOrEditNote,
  notes$,
} from '../../store/notesV2'
import { isTrashNotesProjectId, projects$ } from '../../store/projects'
import NoteBar from './NoteBar'

interface NoteV2Props {
  onToggleFullScreen: () => void
  fullScreen: boolean
}
const NoteV2 = ({ onToggleFullScreen, fullScreen }: NoteV2Props) => {
  const selectedNoteId = useSelector(() => notes$.selectedNoteId.get())
  const note = useSelector(() => notes$.activeNote.get())
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

  return (
    <div className="note-container" style={{ background: 'var(--gray-5)' }}>
      <NoteBar
        onToggleFullScreen={onToggleFullScreen}
        fullScreen={fullScreen}
      />

      {!selectedNoteId && <EmptyList />}

      {selectedNoteId && (
        <ScrollArea>
          <Box py="4" pl="4" pb="9" pr="2" className="note-layout">
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
          </Box>
        </ScrollArea>
      )}
    </div>
  )
}

export default NoteV2
