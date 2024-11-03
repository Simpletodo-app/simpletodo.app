const AlterNotes = `
    ALTER TABLE notes ADD COLUMN hasSubNotes BOOLEAN NOT NULL DEFAULT 0;
`

export const addHasSubNotesOct192024 = AlterNotes
