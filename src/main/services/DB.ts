import Database from 'better-sqlite3'
import { generateColumnsSetStatement } from './utils'
import { IS_DEV } from '../../common/config'
import {
  createSchemas,
  addParentNoteIdOct132024,
  addHasSubNotesOct192024,
  addProjectIdToNoteOct262024,
  indexNoteOct272024,
} from './migrations'
import { app } from 'electron'

let db: Database.Database

class DBService {
  public exposedMethods: Array<keyof typeof this> = []

  constructor(public serviceName: string) {}

  /**
   * this is called in main to help initiate db connection
   * @returns {Database.Database} db instance
   */
  connect(): Database.Database {
    if (db) {
      return db
    }
    const pathName = `${
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      IS_DEV ? '.' : app.getAppPath('userData')
    }/data/simpletodoapp.db`
    db = Database(pathName, { verbose: console.log, fileMustExist: false })

    db.exec(createSchemas)
    this.runAlterTableQuery(addParentNoteIdOct132024)
    this.runAlterTableQuery(addHasSubNotesOct192024)
    this.runAlterTableQuery(addProjectIdToNoteOct262024)

    this.runAlterTableQuery(indexNoteOct272024)
    return db
  }

  /**
   * SQLite does not support altering tables if they already exist
   * so we are going to try and catch that error when we run the query
   * @param query
   */
  private runAlterTableQuery(alterQuery: string) {
    try {
      this.getDB().exec(alterQuery)
    } catch (err) {
      if (
        err.code !== 'SQLITE_ERROR' &&
        !err.message.includes('duplicate column')
      ) {
        throw err
      } else {
        console.info('Ignoring duplicate column error', err.message)
      }
    }
  }

  protected generateColumnsSetStatement(toBeUpdated: Record<string, unknown>) {
    return generateColumnsSetStatement(toBeUpdated)
  }

  protected getDB() {
    if (!db) throw new Error('No db instance. Please initial connect')
    return db
  }

  getExposedMethods() {
    if (!this.exposedMethods) throw new Error('No exposed methods')
    return this.exposedMethods
  }
}

export default DBService
