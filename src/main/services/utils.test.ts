import { generateColumnsSetStatement } from './utils'

describe('DB: utils', () => {
  describe('generateColumnsSetStatement', () => {
    it('returns correct update statement and values for input object fields', () => {
      const fields = {
        name: 'some-name',
        day: 'Monday',
      }

      expect(generateColumnsSetStatement(fields)).toEqual({
        statement: 'name = $1, day = $2',
        values: ['some-name', 'Monday'],
      })
    })

    it('returns correct field value when it is a boolean type field', () => {
      const fields = {
        name: 'some-name',
        day: 'Monday',
        completed: true,
      }

      expect(generateColumnsSetStatement(fields)).toEqual({
        statement: 'name = $1, day = $2, completed = $3',
        values: ['some-name', 'Monday', 1],
      })

      expect(
        generateColumnsSetStatement({ ...fields, completed: false })
      ).toEqual({
        statement: 'name = $1, day = $2, completed = $3',
        values: ['some-name', 'Monday', 0],
      })
    })
  })
})
