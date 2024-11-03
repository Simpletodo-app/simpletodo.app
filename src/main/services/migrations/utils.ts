export const createForeignKeyReference = (key: string, collection: string) => `
CONSTRAINT fk_${collection}
    FOREIGN KEY (${key})
        REFERENCES ${collection}(id)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
`

export const createBooleanColumn = (key: string) => `
${key} BOOLEAN NOT NULL CHECK (${key} IN (0, 1))
`
