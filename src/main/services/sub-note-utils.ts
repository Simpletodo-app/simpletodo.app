/**
 * Sub note utils is used to manage how we create and update sub notes
 */

import { extractItems } from '../../common/dom-utils'
import { ID } from '../../common/types'
import DBService from './DB'
import NotesService from './Notes'

const getDB = () => {
  return new DBService('main').connect()
}

export const createSubNoteFlow = (noteId: ID) => {
  const db = getDB()
  const notesService = new NotesService()

  const createSubNoteTransaction = db.transaction((noteId: ID) => {
    const note = notesService.getById(noteId)
    if (!note) {
      return
    }

    const { checkedHtmlContent, uncheckedHtmlContent } = extractItems(
      note.htmlContent
    )

    // create a new note
    const newNote = notesService.create({
      htmlContent: uncheckedHtmlContent,
      hasSubNotes: 1,
      projectId: note.projectId,
    })

    // update the current note to have the checked items only
    notesService.update(note.id, {
      htmlContent: checkedHtmlContent,
    })
    // update current note and other notes pointing to it to be a subnote of the new note
    notesService.update(
      note.id,
      {
        parentNoteId: newNote.id,
        hasSubNotes: 0,
      },
      'OR parentNoteId = @id'
    )

    return newNote
  })

  return createSubNoteTransaction(noteId)
}
