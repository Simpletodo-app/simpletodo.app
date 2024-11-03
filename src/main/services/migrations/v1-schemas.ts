/* eslint-disable no-console */

import { createBooleanColumn, createForeignKeyReference } from './utils'

export const commonTimestampFields = `
createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
`

export const idField = `
id INTEGER PRIMARY KEY
`

const NoteSchema = `
CREATE TABLE IF NOT EXISTS notes (
    ${idField},
    title TEXT NOT NULL,
    htmlContent TEXT NOT NULL,
    textContent TEXT NOT NULL,
    standupNote TEXT,
   ${createBooleanColumn('deleted')},
   ${commonTimestampFields}
);
`

const SectionSchema = `
CREATE TABLE IF NOT EXISTS sections (
   ${idField},
   noteId INTEGER,
   title TEXT NOT NULL,
   description TEXT,
   ${commonTimestampFields},
   ${createForeignKeyReference('noteId', 'notes')}
);
`

const ProjectSchema = `
CREATE TABLE IF NOT EXISTS projects (
    ${idField},
    title TEXT NOT NULL,
   ${createBooleanColumn('deleted')},
   ${commonTimestampFields}
);
`
export const createSchemas = `${NoteSchema}${SectionSchema}${ProjectSchema}`
