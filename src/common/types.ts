import { ThemeOptions } from '@radix-ui/themes'

type BooleanField = 0 | 1

export type CommonTimestampFields = {
  createdAt: string
  updatedAt: string
}
export type ID = number | bigint
export type IDField = {
  id: ID
}

export interface Project extends CommonTimestampFields, IDField {
  title: string
  deleted?: BooleanField // soft deleting - so we can show it in recently deleted
}

export type ProjectWithNoteCount = Project & {
  noteCount: number
}

export interface Note extends CommonTimestampFields, IDField {
  projectId?: ID
  parentNoteId?: ID
  title: string
  textContent: string
  htmlContent: string
  hasSubNotes?: BooleanField
  standupNote?: string
  deleted?: BooleanField // soft deleting - so we can show it in recently deleted
}

export interface Section extends CommonTimestampFields, IDField {
  noteId: ID
  title: string
  description?: string
}

export type LicenseStore = {
  instanceId: string
  licenseKey: string
  productId: number
}

export type UserData = {
  lastOpenedNoteId: number
  lastOpenedProjectId: number
  appearance: ThemeOptions['appearance']
  userId: string
  recentSearches: string[]
} & {
  license: LicenseStore
}

export type SearchResult = Pick<
  Note,
  'id' | 'title' | 'textContent' | 'projectId' | 'parentNoteId'
>

export type NoteListItem = Pick<
  Note,
  'id' | 'title' | 'projectId' | 'createdAt' | 'hasSubNotes' | 'parentNoteId'
> & {
  /**
   * if this note has a parent id but the note is not found in the list
   */
  hasNoExistingParentNote?: boolean
}
