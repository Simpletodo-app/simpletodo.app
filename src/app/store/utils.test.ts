import { describe, expect, test } from 'vitest'
import { organizeNotesByParent } from './utils'
import { Note } from '../../common/types'

describe('organizeNotesByParent', () => {
  test('should organize notes by parent and still sorting order', () => {
    const notes = [
      { id: 1, parentNoteId: null },
      { id: 2, parentNoteId: null },
      { id: 3, parentNoteId: 71 },
      { id: 4, parentNoteId: 1 },
      { id: 5, parentNoteId: 1 },
      { id: 6, parentNoteId: 2 },
    ] as Note[]

    const result = organizeNotesByParent(notes)

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "id": 1,
          "parentNoteId": null,
        },
        {
          "id": 4,
          "parentNoteId": 1,
        },
        {
          "id": 5,
          "parentNoteId": 1,
        },
        {
          "id": 2,
          "parentNoteId": null,
        },
        {
          "id": 6,
          "parentNoteId": 2,
        },
        {
          "id": 3,
          "parentNoteId": 71,
        },
      ]
    `)
  })
})
