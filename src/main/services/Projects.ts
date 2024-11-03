import {
  CommonTimestampFields,
  ID,
  IDField,
  Project,
  ProjectWithNoteCount,
} from '../../common/types'
import DBService from './DB'

type MutatableFields = Omit<
  Project,
  keyof CommonTimestampFields | keyof IDField
>

export default class ProjectsService extends DBService {
  public exposedMethods: (keyof this)[] = [
    'getAll',
    'create',
    'update',
    'deleteById',
  ]

  constructor() {
    super('projects')
  }

  getAll() {
    const stmt = this.getDB().prepare(
      `
      SELECT projects.id, projects.title, projects.createdAt, projects.updatedAt, projects.deleted, COUNT(notes.id) AS noteCount
      FROM projects 
      LEFT JOIN notes ON projects.id = notes.projectId AND notes.parentNoteId IS NULL AND notes.deleted != 1
      WHERE projects.deleted != 1 
      GROUP BY projects.id;
      `
    )

    return stmt.all() as ProjectWithNoteCount[]
  }

  create(title: string) {
    const stmt = this.getDB().prepare(
      'INSERT INTO projects(title, deleted, createdAt, updatedAt) VALUES (@title, @deleted, @createdAt, @updatedAt)'
    )
    const createdAt = new Date().toISOString()

    const queryInput = {
      title,
      createdAt,
      deleted: 0,
      updatedAt: createdAt,
    }

    const result = stmt.run(queryInput)

    return {
      ...queryInput,
      id: result.lastInsertRowid,
    } as Project
  }

  update(id: ID, updates: Partial<MutatableFields>, appendStatement = '') {
    const updatedAt = new Date().toISOString()
    const input = { ...updates, updatedAt }
    const columnSet = this.generateColumnsSetStatement(input)

    const stm = this.getDB().prepare(
      `UPDATE projects SET ${columnSet} WHERE id = @id ${appendStatement}`
    )

    const result = stm.run({ ...input, id })

    return {
      ...input,
      id: result.lastInsertRowid,
      updatedAt,
    } as Project
  }

  deleteById(id: ID) {
    const result = this.permanentlyDeleteById(id)
    this.getDB()
      .prepare(
        'UPDATE notes SET deleted = 1, projectId=NULL WHERE projectId = @id'
      )
      .run({ id })

    return result
  }

  permanentlyDeleteById(id: ID) {
    const stm = this.getDB().prepare('DELETE FROM projects WHERE id = @id')
    return stm.run({ id })
  }
}
