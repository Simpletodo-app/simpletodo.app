export const generateColumnsSetStatement = (
  toBeUpdated: Record<string, unknown>
) => {
  const statement = Object.keys(toBeUpdated)
    .map((key) => `${key} = @${key}`)
    .join(', ')

  return statement
}

export const generateIsNullOrDefinedStatement = (
  key: string,
  value: unknown
) => {
  return !value ? `${key} is NULL` : `${key} = @${key}`
}

export const generateDeletedStatement = (deleted?: boolean) => {
  return deleted ? 'deleted = 1' : 'deleted != 1'
}
