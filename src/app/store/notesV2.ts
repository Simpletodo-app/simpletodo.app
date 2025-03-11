import {
  observable,
  computed,
  ObservableObject,
  ObservableComputed,
  observe,
} from '@legendapp/state'
import {
  ID,
  IDField,
  Note,
  NoteListItem,
  SearchResult,
} from '../../common/types'
import {
  getNewModelId,
  isNewModelId,
  organizeNotesByParent,
  toIdAndIndexMap,
} from './utils'
import debounce from 'lodash/debounce'
import { UNTITLED_NOTE_TITLE } from '../../common/config'
import pick from 'lodash/pick'
import {
  isAllNotesProjectId,
  isTrashNotesProjectId,
  projects$,
  trashNotesProject,
  updateProjectNoteCount,
} from './projects'
import {
  highlightMatches,
  highlightTitle,
} from '../components/search-input/utils'

const FIELDS_TO_BE_FETCHED: Array<keyof NoteListItem> = [
  'id',
  'title',
  'projectId',
  'createdAt',
  'hasSubNotes',
  'parentNoteId',
]

export type SearchResultItem = SearchResult & {
  projectTitle?: string
  markedTitle: string
  markedTextContent: string
}

type NotesStore = {
  notes: NoteListItem[]
  isFetching: boolean
  firstNoteId: IDField['id'] | undefined
  _notesIdIndexMap: ObservableComputed<Map<IDField['id'], Index>>

  selectedNoteId: ID
  selectedNoteListItem: ObservableComputed<NoteListItem | undefined>

  // this is what is currently active in the editor
  // using selectedNoteId to fetch the full note from DB
  activeNote: Note | undefined

  canCreateNewNote: ObservableComputed<boolean>

  searchResults: SearchResultItem[]

  /**
   * If `all` is passed, show all sub notes
   * If an ID is passed, show only that sub note
   * If undefined, show no sub notes
   */
  viewSubNotes?: 'all' | ID | undefined
}

export const notes$: ObservableObject<NotesStore> = observable({
  notes: [] as NoteListItem[],
  isFetching: false,
  firstNoteId: undefined,
  _notesIdIndexMap: computed(() => {
    return toIdAndIndexMap(notes$.notes.get())
  }),

  selectedNoteId: undefined,
  activeNote: undefined,

  selectedNoteListItem: computed(() => {
    const selectedNoteId = notes$.selectedNoteId.get()
    if (selectedNoteId) {
      const index = getNoteIdIndex(selectedNoteId)
      const note = notes$.notes[index]
      return note
    }
  }),

  canCreateNewNote: computed(() => {
    const hasEmptyNote = notes$.notes
      .get()
      .some((note) => isNewModelId(note.id))
    return !hasEmptyNote
  }),

  searchResults: [] as SearchResultItem[],
  viewSubNotes: undefined,
})

const sanitizeProjectId = (projectId: ID | undefined) => {
  if (isAllNotesProjectId(projectId) || isTrashNotesProjectId(projectId)) {
    return undefined
  }

  return projectId
}

const getDummyEmptyNote = (id = getNewModelId()) =>
  ({
    title: UNTITLED_NOTE_TITLE,
    id,
    createdAt: new Date().toISOString(),
  } as NoteListItem)

/**
 * Watchers
 */

observe(notes$.selectedNoteId, ({ value: id }) => {
  if (isNewModelId(id)) {
    notes$.activeNote.set(getDummyEmptyNote(id as number) as Note)
  } else {
    fetchNote(id)
  }
})

observe(notes$.notes, ({ value: notes }) => {
  notes$.firstNoteId.set(notes[0]?.id)
})

/**
 * UI handlers
 */
export const selectNoteItem = (id: ID, isASubNote?: boolean) => {
  notes$.selectedNoteId.set(id)
  // in case you are selecting a sub note when the sub notes are not visible
  // we show the sub note in the list view
  if (isASubNote) {
    notes$.viewSubNotes.set(id)
  }

  const fn = async () => {
    await window.electron.store.set('lastOpenedNoteId', id)
  }

  if (!isNewModelId(id)) {
    fn()
  }
}

export const getNoteIdIndex = (id: ID) => {
  const map = notes$._notesIdIndexMap.get()
  return map.get(id)
}

export const getSelectedNoteIndex = () => {
  const selectedNoteId = notes$.selectedNoteId.get()
  const map = notes$._notesIdIndexMap.get()
  return map.get(selectedNoteId)
}

export const createEmptyNote = async () => {
  if (
    !notes$.canCreateNewNote.peek() ||
    isTrashNotesProjectId(projects$.selectedProjectId.peek())
  ) {
    return
  }

  const id = getNewModelId()
  console.log('creating empty note', id)

  notes$.notes.unshift(getDummyEmptyNote(id) as NoteListItem)

  selectNoteItem(id)
}

export const toggleViewSubNotes = (subNoteId?: ID) => {
  if (subNoteId) {
    notes$.viewSubNotes.set(subNoteId)
    return
  }

  if (notes$.viewSubNotes.peek() === 'all') {
    notes$.viewSubNotes.set(undefined)
    return
  } else {
    notes$.viewSubNotes.set('all')
  }
}
/**
 * end UI handlers
 */

/**
 * DB handlers
 */

const saveNewNote = async (
  changes: Pick<Note, 'htmlContent' | 'id'>,
  shouldSelectNoteAfterCreation = true
) => {
  console.log('create a new note', changes)
  const input = {
    ...pick(changes, 'htmlContent'),
    projectId: sanitizeProjectId(projects$.selectedProjectId.get()),
  }
  try {
    const note = await window.electron.services.notes.create(input)
    const index = getNoteIdIndex(changes.id)
    notes$.notes[index].set(note)
    if (shouldSelectNoteAfterCreation) {
      selectNoteItem(note.id)
    }
    updateProjectNoteCount(input.projectId, 1)
    return note
  } catch (err) {
    console.error(err)
  }
}

export const createOrEditNote = async (
  id: ID,
  htmlContent: string,
  isASubNote?: boolean
) => {
  if (isNewModelId(id)) {
    return await saveNewNote({
      htmlContent,
      id,
    } as Note)
  }

  console.log('updating note for id:', id)

  try {
    const note = await window.electron.services.notes.update(id, {
      htmlContent,
    })
    if (isASubNote) {
      // don't do anything for sub note, as we are only updating the note content
      return note
    }
    const index = getNoteIdIndex(note.id)
    notes$.notes[index].set(note)
    notes$.activeNote.set(note)
    return note
  } catch (err) {
    console.error(err)
  }
}
export const debouncedCreateOrEditNote = debounce(createOrEditNote, 500)

// if projectId is empty or undefined it means fetch all notes
export const fetchNotes = async (
  projectId: ID | undefined,
  defaultSelectedNoteId?: number
) => {
  notes$.isFetching.set(true)
  console.log('fetching notes', projectId)
  try {
    const notes = await window.electron.services.notes.getAll(
      sanitizeProjectId(projectId),
      {
        fields: FIELDS_TO_BE_FETCHED,
        deleted: isTrashNotesProjectId(projectId),
      }
    )

    notes$.notes.set(organizeNotesByParent(notes))

    // after fetching notes, select the passed
    // default selected note id or use the first note
    const toBeSelectedNote = defaultSelectedNoteId
      ? notes.find((note) => note.id === defaultSelectedNoteId)
      : notes[0]

    const toBeSelectedNoteId = toBeSelectedNote?.id || notes[0]?.id

    // if no note is found, create an empty note
    if (!toBeSelectedNoteId) {
      return createEmptyNote()
    }

    const isSubNote = Boolean(toBeSelectedNote?.parentNoteId)

    selectNoteItem(
      isSubNote ? toBeSelectedNote?.parentNoteId : toBeSelectedNoteId
    )
  } catch (err) {
    console.error(err)
  } finally {
    notes$.isFetching.set(false)
  }
}

export const deleteNote = async (id: ID, permanently?: boolean) => {
  console.log('deleting note for id:', id)
  try {
    const notes = notes$.notes.peek()
    const note = notes.find((note) => note.id === id)
    await window.electron.services.notes.deleteById(id, permanently)
    const index = getNoteIdIndex(id)

    const subNotesCount = notes.filter(
      (note) => note.parentNoteId === id
    ).length

    notes$.notes.splice(index, 1 + subNotesCount)

    if (notes$.selectedNoteId.get() === id) {
      selectNoteItem(notes$.notes[0]?.id.get())
    }

    updateProjectNoteCount(note?.projectId, -1, permanently)
  } catch (err) {
    console.error(err)
  }
}

export const restoreNote = async (id: ID) => {
  console.log('restoring note for id:', id)
  try {
    const notes = notes$.notes.peek()
    const note = notes.find((note) => note.id === id)
    await window.electron.services.notes.update(
      id,
      { deleted: 0 },
      'OR parentNoteId = @id'
    )
    const index = getNoteIdIndex(id)

    const subNotesCount = notes.filter(
      (note) => note.parentNoteId === id
    ).length

    // remove from trash notes list and sub notes
    notes$.notes.splice(index, 1 + subNotesCount)

    if (notes$.selectedNoteId.get() === id) {
      selectNoteItem(notes$.notes[0]?.id.get())
    }

    // update the trash notes project note count to remove 1
    updateProjectNoteCount(trashNotesProject.id, -1)

    // update the project note count to add 1
    updateProjectNoteCount(note?.projectId, 1)
  } catch (err) {
    console.error(err)
  }
}

export const createSubNote = async (noteId: ID) => {
  console.log('creating sub note for id:', noteId)
  const index = getNoteIdIndex(noteId)
  try {
    const { newNote, oldNote } =
      await window.electron.services.notes.triggerSubNoteCreation(noteId)

    // update notes list to use the new note in place of the old note
    notes$.notes[index].set(newNote)
    notes$.notes.splice(index + 1, 0, oldNote)
    selectNoteItem(newNote.id)
  } catch (err) {
    console.error(err)
  }
}

export const fetchNote = async (id: ID) => {
  console.log('fetching note for id:', id)
  if (isNewModelId(id)) {
    return
  }
  try {
    const note = await window.electron.services.notes.getById(id)
    notes$.activeNote.set(note)
  } catch (err) {
    console.error(err)
  }
}

const searchNotes = async (
  query: string,
  callback: (results: SearchResultItem[]) => void
) => {
  console.log('searching notes for query:', query)
  if (query === '') {
    notes$.searchResults.set([])
    callback([])
    return
  }
  try {
    const notes = await window.electron.services.notes.search(query)
    // attach project title to the search results
    const withProjectTitle = notes.map((note) => {
      const project = projects$.projects
        .peek()
        .find((project) => project.id === note.projectId)
      return {
        ...note,
        projectTitle: project?.title,
      }
    })

    const sanitizedNotes = withProjectTitle.map((note) => ({
      ...note,
      markedTitle: highlightTitle(note.title, query),
      markedTextContent: highlightMatches(note.textContent, query),
    }))

    notes$.searchResults.set(sanitizedNotes)
    callback(sanitizedNotes)
  } catch (err) {
    console.error(err)
    callback([])
  }
}
export const debouncedSearchNotes = debounce(searchNotes, 500)

/**
 * End of DB handlers
 */
