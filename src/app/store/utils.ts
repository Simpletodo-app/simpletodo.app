import { ID, IDField } from '../../common/types'

export const toIdAndIndexMap = <T extends IDField>(items: Array<T>) => {
  const map = new Map<ID, number>()
  items.forEach((item, index) => {
    map.set(item.id, index)
  })
  return map
}

let newModelIdCount = 0
export const getNewModelId = () => --newModelIdCount

export const isNewModelId = (id: ID) => id < 0
