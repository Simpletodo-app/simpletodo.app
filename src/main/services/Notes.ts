import { parseHtmlToNoteContent } from '../../common/dom-utils'
import { CommonTimestampFields, ID, IDField, Note } from '../../common/types'
import DBService from './DB'
import { createSubNoteFlow } from './sub-note-utils'
import { generateDeletedStatement } from './utils'

// title and text content is computed from the html content <h1> tag
type ComputedFields = 'title' | 'textContent'

type MutatableFields = Omit<
  Note,
  keyof CommonTimestampFields | keyof IDField | ComputedFields
>

export default class NotesService extends DBService {
  public exposedMethods: (keyof this)[] = [
    'getAll',
    'getById',
    'getSubNotes',
    'create',
    'update',
    'deleteById',
    'triggerSubNoteCreation',
    'count',
    'search',
  ]

  constructor() {
    super('notes')
  }

  // count all parent notes that are not deleted by default
  // if deleted is passed, we count all deleted notes
  count(deleted?: boolean) {
    const stmt = this.getDB().prepare(
      `SELECT COUNT(*) as count FROM notes WHERE ${generateDeletedStatement(
        deleted
      )} AND parentNoteId IS NULL`
    )
    const result = stmt.get() as { count: number }
    return result.count
  }

  getAll(
    projectId?: ID,
    { fields = ['*'], deleted }: { fields?: string[]; deleted?: boolean } = {}
  ) {
    // all note with parent id is a sub note
    const stmt = this.getDB().prepare(
      `SELECT ${fields.join(',')} FROM notes WHERE ${generateDeletedStatement(
        deleted
      )} ${projectId ? 'AND projectId=@projectId' : ''} ORDER BY createdAt DESC`
    )

    return stmt.all({ projectId }) as Note[]
  }

  getSubNotes(noteId: ID, fields: string[] = ['*']) {
    const stmt = this.getDB().prepare(
      `SELECT ${fields.join(
        ','
      )} FROM notes WHERE deleted != 1 AND parentNoteId = @noteId ORDER BY createdAt DESC`
    )

    return stmt.all({ noteId }) as Note[]
  }

  getSubNotesCount(noteId: ID) {
    const stmt = this.getDB().prepare(
      `SELECT COUNT(*) as count FROM notes WHERE deleted != 1 AND parentNoteId = @noteId`
    )
    const result = stmt.get({ noteId }) as { count: number }
    return result.count
  }

  getById(id: ID) {
    const stmt = this.getDB().prepare('SELECT * FROM notes WHERE id = @id')
    return stmt.get({ id }) as Note
  }

  create(input: Omit<MutatableFields, 'standupNote'>) {
    const stmt = this.getDB().prepare(
      'INSERT INTO notes(title, projectId, htmlContent, textContent, hasSubNotes, deleted, createdAt, updatedAt) VALUES (@title, @projectId, @htmlContent, @textContent, @hasSubNotes, @deleted, @createdAt, @updatedAt)'
    )
    const createdAt = new Date().toISOString()

    const queryInput = {
      ...input,
      ...parseHtmlToNoteContent(input.htmlContent),
      createdAt,
      deleted: 0,
      hasSubNotes: input.hasSubNotes ?? 0,
      updatedAt: createdAt,
    }

    const result = stmt.run(queryInput)

    return {
      ...queryInput,
      id: result.lastInsertRowid,
    } as Note
  }

  update(id: ID, updates: Partial<MutatableFields>, appendStatement = '') {
    const updatedAt = new Date().toISOString()
    const input = {
      ...updates,
      ...(updates.htmlContent && parseHtmlToNoteContent(updates.htmlContent)),
      updatedAt,
    }
    const columnSet = this.generateColumnsSetStatement(input)

    const stm = this.getDB().prepare(
      `UPDATE notes SET ${columnSet} WHERE id = @id ${appendStatement}`
    )

    stm.run({ ...input, id })

    return this.getById(id)
  }

  /**
   * Soft delete a note and all its sub notes if any
   * @param id
   * @param permanently
   * @returns
   */
  deleteById(id: ID, permanently = false) {
    if (permanently) {
      return this.permanentlyDeleteById(id)
    }

    return this.update(id, { deleted: 1 }, 'OR parentNoteId = @id')
  }

  /**
   * Permanently delete a note and all its sub notes
   * @param id
   * @returns
   */
  permanentlyDeleteById(id: ID) {
    const stm = this.getDB().prepare(
      'DELETE FROM notes WHERE id = @id OR parentNoteId = @id'
    )
    return stm.run({ id })
  }

  search(query: string) {
    const stmt = this.getDB().prepare(
      `SELECT id, title, textContent, projectId, parentNoteId FROM notes WHERE deleted != 1  AND (title LIKE @query OR textContent LIKE @query)`
    )
    return stmt.all({ query: `%${query}%` }) as Note[]
  }

  triggerSubNoteCreation(id: ID) {
    return createSubNoteFlow(id)
  }
}
