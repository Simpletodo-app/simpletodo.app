import { ID, IDField, Note, NoteListItem } from '../../common/types'

export const toIdAndIndexMap = <T extends IDField>(items: Array<T>) => {
  const map = new Map<ID, number>()
  items.forEach((item, index) => {
    map.set(item.id, index)
  })
  return map
}

let newModelIdCount = 0
export const getNewModelId = () => --newModelIdCount

export const isNewModelId = (id: ID) => id < 0

export const organizeNotesByParent = (notes: NoteListItem[]) => {
  // Separate notes into parentNotes and subNotes
  const parentNotes = notes
    .filter((note) => !note.parentNoteId)
    .map((note) => ({ ...note, subNotes: [] }))

  const subNotes = notes.filter((note) => note.parentNoteId)

  // Create a map for faster lookup of parent notes
  const parentMap = new Map<ID, NoteListItem & { subNotes: NoteListItem[] }>()
  parentNotes.forEach((note) => parentMap.set(note.id, note))

  // Add subNotes to their respective parent notes
  subNotes.forEach((note) => {
    const parentNote = parentMap.get(note.parentNoteId)
    if (parentNote) {
      parentNote.subNotes.push(note)
    }
  })

  // Flatten parent notes and subnotes, while ensuring all notes are included
  return notes.reduce((acc, note) => {
    if (parentMap.has(note.id)) {
      const { subNotes, ...rest } = parentMap.get(note.id)
      acc.push(rest, ...subNotes)
    } else if (!parentMap.has(note.parentNoteId)) {
      // Include notes with a parentNoteId that does not exist in the list
      acc.push({ ...note, hasNoExistingParentNote: true })
    }
    return acc
  }, [] as NoteListItem[])
}
