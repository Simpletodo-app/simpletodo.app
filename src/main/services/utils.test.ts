import { describe, expect, test } from 'vitest'
import {
  generateColumnsSetStatement,
  generateDeletedStatement,
  generateIsNullOrDefinedStatement,
} from './utils'

describe('DB: utils', () => {
  test('generateColumnsSetStatement: returns correct update statement and values for input object fields', () => {
    const fields = {
      name: 'some-name',
      day: 'Monday',
      completed: true,
    }

    expect(generateColumnsSetStatement(fields)).toEqual(
      'name = @name, day = @day, completed = @completed'
    )
  })

  test('generateIsNullOrDefinedStatement: return is null or defined where condition statement', () => {
    expect(generateIsNullOrDefinedStatement('name', 'some value')).toBe(
      'name = @name'
    )

    expect(generateIsNullOrDefinedStatement('name', undefined)).toBe(
      'name is NULL'
    )
  })

  test('generateDeletedStatement: generate deleted where statement', () => {
    expect(generateDeletedStatement(true)).toBe('deleted = 1')
    expect(generateDeletedStatement(false)).toBe('deleted != 1')
    expect(generateDeletedStatement()).toBe('deleted != 1')
  })
})
