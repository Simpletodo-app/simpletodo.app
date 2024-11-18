import { ID, IDField, Note } from '../../common/types'

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

export const organizeNotesByParent = (notes: Note[]) => {
  const parentNotes = notes
    .filter((note) => !note.parentNoteId)
    .map((note) => ({ ...note, subNotes: [] }))
  const subNotes = notes.filter((note) => note.parentNoteId)

  subNotes.forEach((note) => {
    const parentNote = parentNotes.find(
      (parentNote) => parentNote.id === note.parentNoteId
    )
    if (parentNote) {
      parentNote.subNotes.push(note)
    }
  })

  return parentNotes.reduce((acc, note) => {
    const { subNotes, ...rest } = note
    acc.push(...[rest, ...subNotes])
    return acc
  }, [] as Note[])
}

export function sum(a: number, b: number) {
  return a + b
}
